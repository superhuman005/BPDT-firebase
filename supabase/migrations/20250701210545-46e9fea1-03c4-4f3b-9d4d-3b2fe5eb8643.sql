
-- Add location and business industry to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS business_industry TEXT;

-- Update the app_role enum to include editor
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'editor';

-- Create a table to track plan downloads for analytics
CREATE TABLE IF NOT EXISTS public.plan_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.business_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on plan_downloads
ALTER TABLE public.plan_downloads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plan_downloads
CREATE POLICY "Users can view their own downloads" 
  ON public.plan_downloads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own downloads" 
  ON public.plan_downloads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all downloads"
  ON public.plan_downloads
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create a function to check if user is editor or admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role)
$$;

-- Create analytics view for user analysis
CREATE OR REPLACE VIEW public.user_analytics AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.region,
  p.location,
  p.business_industry,
  p.created_at,
  COUNT(bp.id) as total_plans,
  COUNT(pd.id) as total_downloads,
  MAX(bp.updated_at) as last_plan_activity
FROM public.profiles p
LEFT JOIN public.business_plans bp ON p.id = bp.user_id
LEFT JOIN public.plan_downloads pd ON p.id = pd.user_id
GROUP BY p.id, p.email, p.full_name, p.region, p.location, p.business_industry, p.created_at;

-- Update analytics_summary view to include more metrics
DROP VIEW IF EXISTS public.analytics_summary;
CREATE VIEW public.analytics_summary AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.business_plans) as total_plans,
  (SELECT COUNT(*) FROM public.business_plans WHERE executive_summary IS NOT NULL AND business_description IS NOT NULL AND market_opportunities IS NOT NULL) as completed_plans,
  (SELECT COUNT(DISTINCT region) FROM public.profiles WHERE region IS NOT NULL) as total_regions,
  (SELECT COUNT(DISTINCT location) FROM public.profiles WHERE location IS NOT NULL) as total_locations,
  (SELECT COUNT(DISTINCT business_industry) FROM public.profiles WHERE business_industry IS NOT NULL) as total_industries,
  (SELECT COUNT(*) FROM public.plan_downloads) as total_downloads;

-- Create function for admins to create users (invite system)
CREATE TABLE IF NOT EXISTS public.admin_user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  location TEXT,
  business_industry TEXT,
  role app_role DEFAULT 'user',
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_user_invites
ALTER TABLE public.admin_user_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_user_invites
CREATE POLICY "Admins can manage user invites"
  ON public.admin_user_invites
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Add RLS policy for editors to view user analytics
CREATE POLICY "Editors can view user analytics"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Add RLS policy for editors to view business plans count
CREATE POLICY "Editors can view all business plans"
  ON public.business_plans
  FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Add RLS policy for editors to view downloads
CREATE POLICY "Editors can view all downloads"
  ON public.plan_downloads
  FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());
