-- Create volunteer_profiles table for storing volunteer information
CREATE TABLE public.volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{"weekdays": [], "timeSlots": []}'::jsonb,
  latitude NUMERIC,
  longitude NUMERIC,
  location_name TEXT,
  service_radius_km INTEGER DEFAULT 10,
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  certifications TEXT[] DEFAULT '{}',
  total_hours NUMERIC DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create help_requests table for storing help requests
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('education', 'healthcare', 'construction', 'food', 'clothing', 'transport', 'elderly_care', 'child_care', 'disaster_relief', 'environment', 'other')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  latitude NUMERIC,
  longitude NUMERIC,
  location_name TEXT,
  volunteers_needed INTEGER DEFAULT 1,
  volunteers_matched INTEGER DEFAULT 0,
  skills_required TEXT[] DEFAULT '{}',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  estimated_duration_hours NUMERIC DEFAULT 2,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matching', 'in_progress', 'completed', 'cancelled')),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  contact_phone TEXT,
  contact_name TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create volunteer_matches table for storing matches
CREATE TABLE public.volunteer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  match_score INTEGER DEFAULT 0,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  hours_logged NUMERIC DEFAULT 0,
  volunteer_rating INTEGER CHECK (volunteer_rating >= 1 AND volunteer_rating <= 5),
  volunteer_feedback TEXT,
  requester_rating INTEGER CHECK (requester_rating >= 1 AND requester_rating <= 5),
  requester_feedback TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, volunteer_id)
);

-- Enable RLS
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for volunteer_profiles
CREATE POLICY "Anyone can view volunteer profiles"
ON public.volunteer_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own volunteer profile"
ON public.volunteer_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own volunteer profile"
ON public.volunteer_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own volunteer profile"
ON public.volunteer_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for help_requests
CREATE POLICY "Anyone can view open help requests"
ON public.help_requests FOR SELECT
USING (status != 'cancelled' OR requester_id = auth.uid());

CREATE POLICY "Authenticated users can create help requests"
ON public.help_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update their own requests"
ON public.help_requests FOR UPDATE
USING (auth.uid() = requester_id OR is_admin(auth.uid()));

CREATE POLICY "Requesters can delete their own requests"
ON public.help_requests FOR DELETE
USING (auth.uid() = requester_id);

-- RLS Policies for volunteer_matches
CREATE POLICY "Users can view their own matches"
ON public.volunteer_matches FOR SELECT
USING (
  volunteer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM help_requests WHERE id = request_id AND requester_id = auth.uid())
);

CREATE POLICY "System can create matches"
ON public.volunteer_matches FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own matches"
ON public.volunteer_matches FOR UPDATE
USING (
  volunteer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM help_requests WHERE id = request_id AND requester_id = auth.uid())
);

-- Create updated_at triggers
CREATE TRIGGER update_volunteer_profiles_updated_at
BEFORE UPDATE ON public.volunteer_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON public.help_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volunteer_matches_updated_at
BEFORE UPDATE ON public.volunteer_matches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_matches;