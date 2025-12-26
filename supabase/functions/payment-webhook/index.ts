import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature, x-webhook-signature',
};

// Stripe webhook event types we handle
const STRIPE_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  CHARGE_REFUNDED: 'charge.refunded',
};

// PayPal webhook event types
const PAYPAL_EVENTS = {
  PAYMENT_COMPLETED: 'PAYMENT.CAPTURE.COMPLETED',
  PAYMENT_DECLINED: 'PAYMENT.CAPTURE.DENIED',
  REFUND_COMPLETED: 'PAYMENT.CAPTURE.REFUNDED',
};

// Webhook authentication
// - Stripe: verify Stripe-Signature header using STRIPE_WEBHOOK_SIGNING_SECRET (HMAC SHA256)
// - Other providers/test: verify x-webhook-signature header using WEBHOOK_SIGNING_SECRET (HMAC SHA256)
// IMPORTANT: No development-mode bypasses.
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') ?? '';
const WEBHOOK_SIGNING_SECRET = Deno.env.get('WEBHOOK_SIGNING_SECRET') ?? '';
const STRIPE_TOLERANCE_SECONDS = 5 * 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function parseStripeSignatureHeader(
  header: string
): { timestamp: number; signatures: string[] } | null {
  const parts = header.split(',').map((p) => p.trim());
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const p of parts) {
    const [k, v] = p.split('=');
    if (!k || !v) continue;
    if (k === 't') {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      timestamp = n;
    }
    if (k === 'v1') signatures.push(v);
  }

  if (!timestamp || signatures.length === 0) return null;
  return { timestamp, signatures };
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string
): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SIGNING_SECRET) return false;

  const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > STRIPE_TOLERANCE_SECONDS) return false;

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = await hmacSha256Hex(STRIPE_WEBHOOK_SIGNING_SECRET, signedPayload);

  return parsed.signatures.some((sig) => timingSafeEqual(sig, expected));
}

async function verifyGenericSignature(
  rawBody: string,
  signatureHeader: string
): Promise<boolean> {
  if (!WEBHOOK_SIGNING_SECRET) return false;
  const expected = await hmacSha256Hex(WEBHOOK_SIGNING_SECRET, rawBody);
  return timingSafeEqual(signatureHeader, expected);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for webhook operations (no user context)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const provider = pathParts[1]; // stripe, paypal, crypto

    console.log(`[payment-webhook] ${req.method} ${url.pathname}`);

    // POST /payment-webhook/stripe - Handle Stripe webhooks
    if (req.method === 'POST' && provider === 'stripe') {
      const rawBody = await req.text();
      const sigHeader = req.headers.get('stripe-signature');

      if (!STRIPE_WEBHOOK_SIGNING_SECRET) {
        console.error('[payment-webhook] STRIPE_WEBHOOK_SIGNING_SECRET is not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Webhook not configured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!sigHeader) {
        return new Response(JSON.stringify({ success: false, error: 'Missing stripe-signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isValid = await verifyStripeSignature(rawBody, sigHeader);
      if (!isValid) {
        console.log('[payment-webhook] Invalid Stripe signature');
        return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let event: any;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[payment-webhook] Stripe event: ${event.type}`);

      switch (event.type) {
        case STRIPE_EVENTS.PAYMENT_INTENT_SUCCEEDED: {
          const paymentIntent = event.data.object;
          const paymentId = paymentIntent.id;

          // Find and update donation
          const { data: donation, error } = await supabaseClient
            .from('donations')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              stripe_receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
            })
            .eq('stripe_payment_id', paymentId)
            .eq('status', 'pending')
            .select()
            .single();

          if (error) {
            console.error('[payment-webhook] Stripe success update error:', error);
            // Don't throw - Stripe needs 200 response
          } else {
            console.log(`[payment-webhook] Donation ${donation?.id} completed via Stripe`);
            
            // Create notification for campaign owner
            if (donation) {
              const { data: campaign } = await supabaseClient
                .from('campaigns')
                .select('creator_id, title')
                .eq('id', donation.campaign_id)
                .single();

              if (campaign) {
                await supabaseClient.from('notifications').insert({
                  user_id: campaign.creator_id,
                  type: 'donation_received',
                  title: 'Đã nhận quyên góp mới!',
                  message: `Chiến dịch "${campaign.title}" đã nhận được ${donation.amount} ${donation.currency}`,
                  data: {
                    donation_id: donation.id,
                    campaign_id: donation.campaign_id,
                    amount: donation.amount,
                    currency: donation.currency,
                  },
                });
              }
            }
          }
          break;
        }

        case STRIPE_EVENTS.PAYMENT_INTENT_FAILED: {
          const paymentIntent = event.data.object;
          const paymentId = paymentIntent.id;

          const { error } = await supabaseClient
            .from('donations')
            .update({ status: 'failed' })
            .eq('stripe_payment_id', paymentId)
            .eq('status', 'pending');

          if (error) {
            console.error('[payment-webhook] Stripe failed update error:', error);
          } else {
            console.log(`[payment-webhook] Donation with payment ${paymentId} marked as failed`);
          }
          break;
        }

        case STRIPE_EVENTS.CHARGE_REFUNDED: {
          const charge = event.data.object;
          const paymentIntentId = charge.payment_intent;

          const { error } = await supabaseClient
            .from('donations')
            .update({ status: 'refunded' })
            .eq('stripe_payment_id', paymentIntentId);

          if (error) {
            console.error('[payment-webhook] Stripe refund update error:', error);
          } else {
            console.log(`[payment-webhook] Donation with payment ${paymentIntentId} refunded`);
          }
          break;
        }

        default:
          console.log(`[payment-webhook] Unhandled Stripe event: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /payment-webhook/paypal - Handle PayPal webhooks
    if (req.method === 'POST' && provider === 'paypal') {
      const rawBody = await req.text();
      const sigHeader = req.headers.get('x-webhook-signature');

      if (!WEBHOOK_SIGNING_SECRET) {
        console.error('[payment-webhook] WEBHOOK_SIGNING_SECRET is not configured');
        return new Response(JSON.stringify({ success: false, error: 'Webhook not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!sigHeader) {
        return new Response(JSON.stringify({ success: false, error: 'Missing x-webhook-signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isValid = await verifyGenericSignature(rawBody, sigHeader);
      if (!isValid) {
        console.log('[payment-webhook] Invalid webhook signature');
        return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let event: any;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const eventType = event.event_type;
      console.log(`[payment-webhook] PayPal event: ${eventType}`);

      switch (eventType) {
        case PAYPAL_EVENTS.PAYMENT_COMPLETED: {
          const capture = event.resource;
          const orderId = capture.supplementary_data?.related_ids?.order_id;
          
          // In real implementation, we'd store PayPal order ID in donations
          // For now, find by amount and pending status (demo only)
          console.log(`[payment-webhook] PayPal payment completed: ${orderId}`);
          break;
        }

        case PAYPAL_EVENTS.PAYMENT_DECLINED: {
          console.log('[payment-webhook] PayPal payment declined');
          break;
        }

        case PAYPAL_EVENTS.REFUND_COMPLETED: {
          console.log('[payment-webhook] PayPal refund completed');
          break;
        }

        default:
          console.log(`[payment-webhook] Unhandled PayPal event: ${eventType}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /payment-webhook/crypto - Handle crypto transaction confirmations
    if (req.method === 'POST' && provider === 'crypto') {
      const rawBody = await req.text();
      const sigHeader = req.headers.get('x-webhook-signature');

      if (!WEBHOOK_SIGNING_SECRET) {
        console.error('[payment-webhook] WEBHOOK_SIGNING_SECRET is not configured');
        return new Response(JSON.stringify({ success: false, error: 'Webhook not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!sigHeader) {
        console.log('[payment-webhook] Missing x-webhook-signature header');
        return new Response(JSON.stringify({ success: false, error: 'Missing x-webhook-signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isValid = await verifyGenericSignature(rawBody, sigHeader);
      if (!isValid) {
        console.log('[payment-webhook] Invalid webhook signature');
        return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let body: any;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate required fields
      if (!body.donation_id || !body.tx_hash || !body.confirmations) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: donation_id, tx_hash, confirmations' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const requiredConfirmations = body.chain === 'ethereum' ? 12 : 30;
      
      if (body.confirmations >= requiredConfirmations) {
        const { data: donation, error } = await supabaseClient
          .from('donations')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            tx_hash: body.tx_hash,
            block_number: body.block_number || null,
          })
          .eq('id', body.donation_id)
          .eq('status', 'pending')
          .select()
          .single();

        if (error) {
          console.error('[payment-webhook] Crypto confirmation error:', error);
          throw error;
        }

        console.log(`[payment-webhook] Crypto donation ${donation?.id} confirmed with ${body.confirmations} confirmations`);

        // Create notification for campaign owner
        if (donation) {
          const { data: campaign } = await supabaseClient
            .from('campaigns')
            .select('creator_id, title')
            .eq('id', donation.campaign_id)
            .single();

          if (campaign) {
            await supabaseClient.from('notifications').insert({
              user_id: campaign.creator_id,
              type: 'donation_received',
              title: 'Đã nhận quyên góp Crypto!',
              message: `Chiến dịch "${campaign.title}" đã nhận được ${donation.amount} ${donation.currency}`,
              data: {
                donation_id: donation.id,
                campaign_id: donation.campaign_id,
                amount: donation.amount,
                currency: donation.currency,
                tx_hash: body.tx_hash,
              },
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          data: donation,
          message: 'Crypto donation confirmed',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`[payment-webhook] Crypto donation ${body.donation_id} has ${body.confirmations}/${requiredConfirmations} confirmations`);
        
        return new Response(JSON.stringify({
          success: true,
          message: `Waiting for more confirmations: ${body.confirmations}/${requiredConfirmations}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // POST /payment-webhook/test - Test webhook endpoint (requires signature)
    if (req.method === 'POST' && provider === 'test') {
      const rawBody = await req.text();
      const sigHeader = req.headers.get('x-webhook-signature');

      if (!WEBHOOK_SIGNING_SECRET) {
        console.error('[payment-webhook] WEBHOOK_SIGNING_SECRET is not configured');
        return new Response(JSON.stringify({ success: false, error: 'Webhook not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!sigHeader) {
        return new Response(JSON.stringify({ success: false, error: 'Missing x-webhook-signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isValid = await verifyGenericSignature(rawBody, sigHeader);
      if (!isValid) {
        console.log('[payment-webhook] Invalid webhook signature');
        return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let body: any;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[payment-webhook] Test webhook received:', body);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test webhook received',
          echo: body,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // GET /payment-webhook/health - Health check
    if (req.method === 'GET' && provider === 'health') {
      return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[payment-webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
