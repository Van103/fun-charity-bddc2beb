import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VolunteerProfile {
  id: string;
  user_id: string;
  skills: string[];
  availability: { weekdays: string[]; timeSlots: string[] };
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  experience_level: string;
  rating: number;
  is_available: boolean;
}

interface HelpRequest {
  id: string;
  requester_id: string;
  category: string;
  urgency: string;
  latitude: number | null;
  longitude: number | null;
  skills_required: string[];
  volunteers_needed: number;
  volunteers_matched: number;
  scheduled_date: string | null;
}

interface MatchResult {
  volunteer_id: string;
  request_id: string;
  match_score: number;
  skill_score: number;
  geo_score: number;
  experience_score: number;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate skill match score (0-100)
function calculateSkillScore(volunteer: VolunteerProfile, request: HelpRequest): number {
  if (!request.skills_required || request.skills_required.length === 0) {
    return 100; // No skills required means perfect match
  }

  const volunteerSkills = volunteer.skills || [];
  const requiredSkills = request.skills_required;

  // Category is often in skills
  const categoryMatch = volunteerSkills.includes(request.category) ? 20 : 0;

  // Direct skill matches
  const matchedSkills = requiredSkills.filter(skill => volunteerSkills.includes(skill));
  const skillMatchRatio = matchedSkills.length / requiredSkills.length;

  return Math.round(categoryMatch + skillMatchRatio * 80);
}

// Calculate geographic score (0-100)
function calculateGeoScore(volunteer: VolunteerProfile, request: HelpRequest): number {
  // If either doesn't have location, return neutral score
  if (!volunteer.latitude || !volunteer.longitude || !request.latitude || !request.longitude) {
    return 50;
  }

  const distance = calculateDistance(
    volunteer.latitude,
    volunteer.longitude,
    request.latitude,
    request.longitude
  );

  const serviceRadius = volunteer.service_radius_km || 10;

  if (distance <= serviceRadius) {
    return 100;
  } else if (distance <= serviceRadius * 2) {
    return 75;
  } else if (distance <= serviceRadius * 3) {
    return 50;
  } else if (distance <= serviceRadius * 5) {
    return 25;
  }
  return 0;
}

// Calculate experience score (0-100)
function calculateExperienceScore(volunteer: VolunteerProfile, request: HelpRequest): number {
  const levelScores: Record<string, number> = {
    expert: 100,
    intermediate: 70,
    beginner: 40,
  };

  const baseScore = levelScores[volunteer.experience_level] || 40;

  // Add rating bonus
  const ratingBonus = (volunteer.rating || 0) * 5; // Max 25 points

  // Urgency matching - experts for critical, anyone for low
  const urgencyMultiplier: Record<string, Record<string, number>> = {
    critical: { expert: 1.2, intermediate: 1.0, beginner: 0.7 },
    high: { expert: 1.1, intermediate: 1.0, beginner: 0.8 },
    medium: { expert: 1.0, intermediate: 1.0, beginner: 1.0 },
    low: { expert: 1.0, intermediate: 1.0, beginner: 1.0 },
  };

  const multiplier =
    urgencyMultiplier[request.urgency]?.[volunteer.experience_level] || 1.0;

  return Math.min(100, Math.round((baseScore + ratingBonus) * multiplier));
}

// Calculate overall match score
function calculateMatchScore(volunteer: VolunteerProfile, request: HelpRequest): MatchResult {
  const skillScore = calculateSkillScore(volunteer, request);
  const geoScore = calculateGeoScore(volunteer, request);
  const experienceScore = calculateExperienceScore(volunteer, request);

  // Weighted average: Skills 40%, Location 35%, Experience 25%
  const matchScore = Math.round(skillScore * 0.4 + geoScore * 0.35 + experienceScore * 0.25);

  return {
    volunteer_id: volunteer.user_id,
    request_id: request.id,
    match_score: matchScore,
    skill_score: skillScore,
    geo_score: geoScore,
    experience_score: experienceScore,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, request_id, limit = 10 } = await req.json();

    console.log(`[volunteer-matching] Action: ${action}, Request ID: ${request_id}`);

    if (action === 'find_matches') {
      // Find volunteers for a specific help request
      if (!request_id) {
        return new Response(
          JSON.stringify({ error: 'request_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the help request
      const { data: request, error: requestError } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', request_id)
        .single();

      if (requestError || !request) {
        console.error('[volunteer-matching] Request not found:', requestError);
        return new Response(
          JSON.stringify({ error: 'Help request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch available volunteers (excluding the requester)
      const { data: volunteers, error: volunteersError } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('is_available', true)
        .neq('user_id', request.requester_id);

      if (volunteersError) {
        console.error('[volunteer-matching] Error fetching volunteers:', volunteersError);
        throw volunteersError;
      }

      // Get existing matches to exclude already matched volunteers
      const { data: existingMatches } = await supabase
        .from('volunteer_matches')
        .select('volunteer_id')
        .eq('request_id', request_id)
        .in('status', ['pending', 'accepted']);

      const matchedVolunteerIds = new Set(existingMatches?.map(m => m.volunteer_id) || []);

      // Calculate match scores
      const matches: MatchResult[] = [];
      for (const volunteer of volunteers || []) {
        if (matchedVolunteerIds.has(volunteer.user_id)) continue;

        const match = calculateMatchScore(volunteer as VolunteerProfile, request as HelpRequest);
        if (match.match_score >= 30) { // Minimum threshold
          matches.push(match);
        }
      }

      // Sort by score and limit
      matches.sort((a, b) => b.match_score - a.match_score);
      const topMatches = matches.slice(0, limit);

      console.log(`[volunteer-matching] Found ${topMatches.length} potential matches`);

      return new Response(
        JSON.stringify({ matches: topMatches }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create_matches') {
      // Create match records for a help request
      if (!request_id) {
        return new Response(
          JSON.stringify({ error: 'request_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // First find matches
      const { data: request } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', request_id)
        .single();

      if (!request) {
        return new Response(
          JSON.stringify({ error: 'Help request not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: volunteers } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('is_available', true)
        .neq('user_id', request.requester_id);

      const { data: existingMatches } = await supabase
        .from('volunteer_matches')
        .select('volunteer_id')
        .eq('request_id', request_id);

      const matchedVolunteerIds = new Set(existingMatches?.map(m => m.volunteer_id) || []);

      const matches: MatchResult[] = [];
      for (const volunteer of volunteers || []) {
        if (matchedVolunteerIds.has(volunteer.user_id)) continue;

        const match = calculateMatchScore(volunteer as VolunteerProfile, request as HelpRequest);
        if (match.match_score >= 40) {
          matches.push(match);
        }
      }

      matches.sort((a, b) => b.match_score - a.match_score);
      const volunteersNeeded = Math.max(0, request.volunteers_needed - request.volunteers_matched);
      const topMatches = matches.slice(0, Math.min(volunteersNeeded * 2, limit)); // Get 2x needed for choices

      // Insert match records
      if (topMatches.length > 0) {
        const matchRecords = topMatches.map(m => ({
          request_id: m.request_id,
          volunteer_id: m.volunteer_id,
          match_score: m.match_score,
          status: 'pending',
        }));

        const { error: insertError } = await supabase
          .from('volunteer_matches')
          .upsert(matchRecords, { onConflict: 'request_id,volunteer_id' });

        if (insertError) {
          console.error('[volunteer-matching] Error inserting matches:', insertError);
          throw insertError;
        }

        // Update request status
        await supabase
          .from('help_requests')
          .update({ status: 'matching' })
          .eq('id', request_id);

        console.log(`[volunteer-matching] Created ${topMatches.length} match records`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          matches_created: topMatches.length,
          matches: topMatches
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'run_batch_matching') {
      // Run matching for all open requests
      const { data: openRequests } = await supabase
        .from('help_requests')
        .select('*')
        .in('status', ['open', 'matching']);

      let totalMatchesCreated = 0;

      for (const request of openRequests || []) {
        if (request.volunteers_matched >= request.volunteers_needed) continue;

        const { data: volunteers } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('is_available', true)
          .neq('user_id', request.requester_id);

        const { data: existingMatches } = await supabase
          .from('volunteer_matches')
          .select('volunteer_id')
          .eq('request_id', request.id);

        const matchedVolunteerIds = new Set(existingMatches?.map(m => m.volunteer_id) || []);

        const matches: MatchResult[] = [];
        for (const volunteer of volunteers || []) {
          if (matchedVolunteerIds.has(volunteer.user_id)) continue;

          const match = calculateMatchScore(volunteer as VolunteerProfile, request as HelpRequest);
          if (match.match_score >= 40) {
            matches.push(match);
          }
        }

        matches.sort((a, b) => b.match_score - a.match_score);
        const volunteersNeeded = request.volunteers_needed - request.volunteers_matched;
        const topMatches = matches.slice(0, volunteersNeeded * 2);

        if (topMatches.length > 0) {
          const matchRecords = topMatches.map(m => ({
            request_id: m.request_id,
            volunteer_id: m.volunteer_id,
            match_score: m.match_score,
            status: 'pending',
          }));

          await supabase
            .from('volunteer_matches')
            .upsert(matchRecords, { onConflict: 'request_id,volunteer_id' });

          totalMatchesCreated += topMatches.length;
        }
      }

      console.log(`[volunteer-matching] Batch matching complete. Total matches: ${totalMatchesCreated}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          requests_processed: openRequests?.length || 0,
          total_matches_created: totalMatchesCreated 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: find_matches, create_matches, or run_batch_matching' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[volunteer-matching] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
