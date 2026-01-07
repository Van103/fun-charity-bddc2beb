import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authenticated" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse request body
    const { wallet_address, points_claimed, tokens_minted } = await req.json();

    console.log(`Processing claim for user ${user.id}: ${points_claimed} CAMLY -> ${tokens_minted} FUN`);

    // Validate inputs
    if (!wallet_address || !points_claimed || !tokens_minted) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check user balance
    const { data: balance, error: balanceError } = await supabaseAdmin
      .from("user_balances")
      .select("balance")
      .eq("user_id", user.id)
      .eq("currency", "CAMLY")
      .single();

    if (balanceError || !balance) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not fetch balance" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (balance.balance < points_claimed) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient balance" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create claim record
    const { data: claim, error: claimError } = await supabaseAdmin
      .from("blockchain_claims")
      .insert({
        user_id: user.id,
        wallet_address,
        points_claimed,
        tokens_minted,
        status: "processing",
        chain: "polygon",
      })
      .select()
      .single();

    if (claimError) {
      console.error("Error creating claim:", claimError);
      return new Response(
        JSON.stringify({ success: false, error: "Could not create claim" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Deduct points from user balance
    const { error: deductError } = await supabaseAdmin
      .from("user_balances")
      .update({ 
        balance: balance.balance - points_claimed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("currency", "CAMLY");

    if (deductError) {
      // Rollback claim
      await supabaseAdmin
        .from("blockchain_claims")
        .update({ status: "failed", error_message: "Could not deduct points" })
        .eq("id", claim.id);

      return new Response(
        JSON.stringify({ success: false, error: "Could not deduct points" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Record transaction
    await supabaseAdmin
      .from("reward_transactions")
      .insert({
        user_id: user.id,
        action_type: "token_claim",
        currency: "CAMLY",
        amount: -points_claimed,
        description: `Claim ${tokens_minted} FUN Token`,
        reference_id: claim.id,
        reference_type: "blockchain_claim",
        status: "completed",
      });

    // Simulate blockchain transaction (in production, call actual smart contract)
    // For development, generate a mock transaction hash
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    // Update claim with tx hash and complete status
    const { error: updateError } = await supabaseAdmin
      .from("blockchain_claims")
      .update({
        status: "completed",
        tx_hash: mockTxHash,
        completed_at: new Date().toISOString(),
      })
      .eq("id", claim.id);

    if (updateError) {
      console.error("Error updating claim:", updateError);
    }

    // Update profile total tokens claimed
    await supabaseAdmin
      .from("profiles")
      .update({
        total_tokens_claimed: tokens_minted,
      })
      .eq("user_id", user.id);

    console.log(`Claim completed: ${claim.id} - TX: ${mockTxHash}`);

    return new Response(
      JSON.stringify({
        success: true,
        claim_id: claim.id,
        tx_hash: mockTxHash,
        tokens_minted,
        points_claimed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Claim error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
