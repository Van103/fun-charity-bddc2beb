import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= INPUT VALIDATION UTILITIES =============

const validateUUID = (id: string): boolean => {
  if (typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const validateStatus = (status: string, validStatuses: string[]): boolean => {
  return typeof status === 'string' && validStatuses.includes(status);
};

// Sanitize text input: remove potential XSS/injection characters, limit length
const sanitizeText = (text: unknown, maxLength: number = 1000): string | null => {
  if (text === null || text === undefined) return null;
  if (typeof text !== 'string') return null;
  
  // Trim and limit length
  let sanitized = text.trim().slice(0, maxLength);
  
  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Encode HTML special characters to prevent XSS in admin UI
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized || null;
};

// Validate and sanitize notes field
const validateNotes = (notes: unknown, maxLength: number = 1000): string | null => {
  if (notes === null || notes === undefined || notes === '') return null;
  if (typeof notes !== 'string') return null;
  return sanitizeText(notes, maxLength);
};

// Validate positive integer within range
const validatePositiveInt = (value: unknown, min: number = 1, max: number = 1000000): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num)) return null;
  if (num < min || num > max) return null;
  return num;
};

// Validate boolean value
const validateBoolean = (value: unknown, defaultValue: boolean = true): boolean => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

// Validate pagination parameters
const validatePagination = (pageParam: unknown, limitParam: unknown): { page: number; limit: number } => {
  const page = validatePositiveInt(pageParam, 1, 10000) || 1;
  const limit = Math.min(validatePositiveInt(limitParam, 1, 100) || 20, 100);
  return { page, limit };
};

// Rate limiting tracking (simple in-memory, resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per user

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

const CAMPAIGN_STATUSES = ['draft', 'pending_review', 'approved', 'active', 'paused', 'completed', 'rejected', 'cancelled'];
const USER_ROLES = ['admin', 'moderator', 'user', 'donor', 'volunteer', 'ngo', 'beneficiary'];
const DONATION_STATUSES = ['pending', 'processing', 'completed', 'failed', 'refunded'];

// Max lengths for various text fields
const MAX_NOTES_LENGTH = 1000;
const MAX_REASON_LENGTH = 500;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('[admin-api] Unauthorized access attempt');
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.log(`[admin-api] Rate limit exceeded for user ${user.id}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role client for admin operations
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await adminClient
      .rpc('is_admin', { _user_id: user.id });

    if (roleError || !isAdmin) {
      console.log(`[admin-api] Non-admin user ${user.id} attempted admin action`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Forbidden: Admin access required' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const resource = pathParts[1]; // campaigns, users, donations
    const action = pathParts[pathParts.length - 1];

    console.log(`[admin-api] Admin ${user.id} - ${req.method} ${url.pathname}`);

    // ============= CAMPAIGN MANAGEMENT =============
    
    // GET /admin-api/campaigns - List all campaigns with filters
    if (req.method === 'GET' && resource === 'campaigns' && pathParts.length === 2) {
      const status = url.searchParams.get('status');
      const { page, limit } = validatePagination(
        url.searchParams.get('page'),
        url.searchParams.get('limit')
      );
      const offset = (page - 1) * limit;

      let query = adminClient
        .from('campaigns')
        .select('*, creator:profiles!inner(full_name, avatar_url, is_verified)', { count: 'exact' });

      if (status && validateStatus(status, CAMPAIGN_STATUSES)) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[admin-api] List campaigns error:', error);
        throw error;
      }

      console.log(`[admin-api] Listed ${data?.length} campaigns (status: ${status || 'all'})`);

      return new Response(JSON.stringify({
        success: true,
        data,
        pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/campaigns/:id/approve - Approve campaign
    if (req.method === 'PATCH' && resource === 'campaigns' && action === 'approve') {
      const campaignId = pathParts[2];
      
      if (!validateUUID(campaignId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid campaign ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json().catch(() => ({}));
      const notes = validateNotes(body.notes, MAX_NOTES_LENGTH);

      const { data: campaign, error } = await adminClient
        .from('campaigns')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', campaignId)
        .eq('status', 'pending_review')
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Approve campaign error:', error);
        throw error;
      }

      // Create audit log with sanitized notes
      await adminClient.from('campaign_audits').insert({
        campaign_id: campaignId,
        auditor_id: user.id,
        action: 'approve',
        previous_status: 'pending_review',
        new_status: 'approved',
        notes: notes,
      });

      console.log(`[admin-api] Campaign ${campaignId} approved by ${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        data: campaign,
        message: 'Campaign approved successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/campaigns/:id/reject - Reject campaign
    if (req.method === 'PATCH' && resource === 'campaigns' && action === 'reject') {
      const campaignId = pathParts[2];
      
      if (!validateUUID(campaignId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid campaign ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      
      // Validate and sanitize rejection reason
      if (!body.reason || typeof body.reason !== 'string') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Rejection reason is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const reason = sanitizeText(body.reason, MAX_REASON_LENGTH);
      
      if (!reason || reason.length < 10) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Rejection reason required (min 10 characters, max 500 characters)' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: campaign, error } = await adminClient
        .from('campaigns')
        .update({ status: 'rejected' })
        .eq('id', campaignId)
        .eq('status', 'pending_review')
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Reject campaign error:', error);
        throw error;
      }

      // Create audit log with sanitized reason
      await adminClient.from('campaign_audits').insert({
        campaign_id: campaignId,
        auditor_id: user.id,
        action: 'reject',
        previous_status: 'pending_review',
        new_status: 'rejected',
        notes: reason,
      });

      console.log(`[admin-api] Campaign ${campaignId} rejected by ${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        data: campaign,
        message: 'Campaign rejected',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/campaigns/:id/status - Update campaign status
    if (req.method === 'PATCH' && resource === 'campaigns' && action === 'status') {
      const campaignId = pathParts[2];
      
      if (!validateUUID(campaignId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid campaign ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      
      if (!body.status || !validateStatus(body.status, CAMPAIGN_STATUSES)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Invalid status. Must be one of: ${CAMPAIGN_STATUSES.join(', ')}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const notes = validateNotes(body.notes, MAX_NOTES_LENGTH);

      // Get current campaign status
      const { data: currentCampaign } = await adminClient
        .from('campaigns')
        .select('status')
        .eq('id', campaignId)
        .single();

      const { data: campaign, error } = await adminClient
        .from('campaigns')
        .update({ status: body.status })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Update status error:', error);
        throw error;
      }

      // Create audit log with sanitized notes
      await adminClient.from('campaign_audits').insert({
        campaign_id: campaignId,
        auditor_id: user.id,
        action: 'status_change',
        previous_status: currentCampaign?.status,
        new_status: body.status,
        notes: notes,
      });

      console.log(`[admin-api] Campaign ${campaignId} status changed to ${body.status}`);

      return new Response(JSON.stringify({
        success: true,
        data: campaign,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= USER MANAGEMENT =============
    
    // GET /admin-api/users - List all users
    if (req.method === 'GET' && resource === 'users' && pathParts.length === 2) {
      const role = url.searchParams.get('role');
      const { page, limit } = validatePagination(
        url.searchParams.get('page'),
        url.searchParams.get('limit')
      );
      const offset = (page - 1) * limit;

      let query = adminClient
        .from('profiles')
        .select('*, user_roles(role)', { count: 'exact' });

      if (role && validateStatus(role, USER_ROLES)) {
        query = query.eq('role', role);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[admin-api] List users error:', error);
        throw error;
      }

      console.log(`[admin-api] Listed ${data?.length} users`);

      return new Response(JSON.stringify({
        success: true,
        data,
        pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin-api/users/:id - Get user details
    if (req.method === 'GET' && resource === 'users' && pathParts.length === 3) {
      const userId = pathParts[2];
      
      if (!validateUUID(userId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid user ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('[admin-api] Get user error:', profileError);
        throw profileError;
      }

      const { data: roles } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const { data: donations } = await adminClient
        .from('donations')
        .select('id, amount, status, created_at')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: campaigns } = await adminClient
        .from('campaigns')
        .select('id, title, status, created_at')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log(`[admin-api] Retrieved user ${userId}`);

      return new Response(JSON.stringify({
        success: true,
        data: {
          ...profile,
          roles: roles?.map(r => r.role) || [],
          recent_donations: donations || [],
          recent_campaigns: campaigns || [],
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/users/:id/role - Update user role
    if (req.method === 'PATCH' && resource === 'users' && action === 'role') {
      const userId = pathParts[2];
      
      if (!validateUUID(userId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid user ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      
      if (!body.role || !validateStatus(body.role, USER_ROLES)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Invalid role. Must be one of: ${USER_ROLES.join(', ')}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update or insert role
      const { error: roleError } = await adminClient
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: body.role 
        }, { 
          onConflict: 'user_id,role' 
        });

      if (roleError) {
        console.error('[admin-api] Update role error:', roleError);
        throw roleError;
      }

      // Also update profile role
      await adminClient
        .from('profiles')
        .update({ role: body.role })
        .eq('user_id', userId);

      console.log(`[admin-api] User ${userId} role updated to ${body.role}`);

      return new Response(JSON.stringify({
        success: true,
        message: `User role updated to ${body.role}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/users/:id/verify - Verify user
    if (req.method === 'PATCH' && resource === 'users' && action === 'verify') {
      const userId = pathParts[2];
      
      if (!validateUUID(userId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid user ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json().catch(() => ({}));
      const isVerified = validateBoolean(body.is_verified, true);

      const { data: profile, error } = await adminClient
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Verify user error:', error);
        throw error;
      }

      console.log(`[admin-api] User ${userId} verification set to ${isVerified}`);

      return new Response(JSON.stringify({
        success: true,
        data: profile,
        message: isVerified ? 'User verified' : 'User verification removed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/users/:id/block - Block/Unblock user
    if (req.method === 'PATCH' && resource === 'users' && action === 'block') {
      const userId = pathParts[2];
      
      if (!validateUUID(userId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid user ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      const isBlocked = validateBoolean(body.is_blocked, true);
      const reason = isBlocked ? sanitizeText(body.reason, MAX_REASON_LENGTH) : null;

      const updateData: Record<string, unknown> = {
        is_blocked: isBlocked,
        blocked_at: isBlocked ? new Date().toISOString() : null,
        blocked_reason: reason,
      };

      const { data: profile, error } = await adminClient
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Block user error:', error);
        throw error;
      }

      // Log admin action
      await adminClient.from('admin_actions').insert({
        admin_id: user.id,
        action_type: isBlocked ? 'block_user' : 'unblock_user',
        target_type: 'user',
        target_id: userId,
        details: { reason: reason },
      });

      console.log(`[admin-api] User ${userId} ${isBlocked ? 'blocked' : 'unblocked'} by ${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        data: profile,
        message: isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /admin-api/users/:id - Delete user permanently
    if (req.method === 'DELETE' && resource === 'users' && pathParts.length === 3) {
      const userId = pathParts[2];
      
      if (!validateUUID(userId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid user ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Prevent admin from deleting themselves
      if (userId === user.id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Cannot delete your own account' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete the user from auth.users (this will cascade to profiles via trigger)
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error('[admin-api] Delete auth user error:', deleteAuthError);
        throw deleteAuthError;
      }

      // Also delete profile explicitly in case cascade doesn't work
      await adminClient.from('profiles').delete().eq('user_id', userId);

      // Log admin action
      await adminClient.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete_user',
        target_type: 'user',
        target_id: userId,
        details: { deleted_at: new Date().toISOString() },
      });

      console.log(`[admin-api] User ${userId} deleted by ${user.id}`);

      return new Response(JSON.stringify({
        success: true,
        message: 'User deleted successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= DONATION MANAGEMENT =============
    
    // GET /admin-api/donations - List all donations
    if (req.method === 'GET' && resource === 'donations' && pathParts.length === 2) {
      const status = url.searchParams.get('status');
      const campaignId = url.searchParams.get('campaign_id');
      const { page, limit } = validatePagination(
        url.searchParams.get('page'),
        url.searchParams.get('limit')
      );
      const offset = (page - 1) * limit;

      let query = adminClient
        .from('donations')
        .select(`
          *,
          donor:profiles!donations_donor_id_fkey(full_name, avatar_url),
          campaign:campaigns!donations_campaign_id_fkey(title)
        `, { count: 'exact' });

      if (status && validateStatus(status, DONATION_STATUSES)) {
        query = query.eq('status', status);
      }
      if (campaignId && validateUUID(campaignId)) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[admin-api] List donations error:', error);
        // Try without FK hints if the join fails
        const { data: fallbackData, error: fallbackError, count: fallbackCount } = await adminClient
          .from('donations')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (fallbackError) throw fallbackError;

        return new Response(JSON.stringify({
          success: true,
          data: fallbackData,
          pagination: { page, limit, total: fallbackCount, total_pages: Math.ceil((fallbackCount || 0) / limit) },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[admin-api] Listed ${data?.length} donations`);

      return new Response(JSON.stringify({
        success: true,
        data,
        pagination: { page, limit, total: count, total_pages: Math.ceil((count || 0) / limit) },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATCH /admin-api/donations/:id/status - Update donation status
    if (req.method === 'PATCH' && resource === 'donations' && action === 'status') {
      const donationId = pathParts[2];
      
      if (!validateUUID(donationId)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid donation ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json();
      
      if (!body.status || !validateStatus(body.status, DONATION_STATUSES)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Invalid status. Must be one of: ${DONATION_STATUSES.join(', ')}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: Record<string, unknown> = { status: body.status };
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: donation, error } = await adminClient
        .from('donations')
        .update(updateData)
        .eq('id', donationId)
        .select()
        .single();

      if (error) {
        console.error('[admin-api] Update donation status error:', error);
        throw error;
      }

      console.log(`[admin-api] Donation ${donationId} status changed to ${body.status}`);

      return new Response(JSON.stringify({
        success: true,
        data: donation,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin-api/stats - Get admin dashboard stats
    if (req.method === 'GET' && resource === 'stats') {
      const { data: campaignStats } = await adminClient
        .from('campaigns')
        .select('status');

      const { data: donationStats } = await adminClient
        .from('donations')
        .select('status, amount');

      const { count: userCount } = await adminClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const pendingCampaigns = campaignStats?.filter(c => c.status === 'pending_review').length || 0;
      const activeCampaigns = campaignStats?.filter(c => c.status === 'active').length || 0;
      const totalDonations = donationStats?.filter(d => d.status === 'completed').length || 0;
      const totalRaised = donationStats?.filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      console.log('[admin-api] Retrieved admin stats');

      return new Response(JSON.stringify({
        success: true,
        data: {
          campaigns: {
            pending_review: pendingCampaigns,
            active: activeCampaigns,
            total: campaignStats?.length || 0,
          },
          donations: {
            completed: totalDonations,
            total_raised: totalRaised,
          },
          users: {
            total: userCount || 0,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[admin-api] Error:', error);
    // Return generic error message to avoid leaking internal details
    return new Response(JSON.stringify({
      success: false,
      error: 'An error occurred while processing your request',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
