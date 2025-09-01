
-- Create the missing user_analytics view that combines user profile data with business plan statistics
CREATE OR REPLACE VIEW public.user_analytics AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    up.location,
    up.location as region,
    COALESCE(bp_stats.business_industry, '') as business_industry,
    p.created_at,
    COALESCE(bp_stats.total_plans, 0) as total_plans,
    COALESCE(bp_stats.total_downloads, 0) as total_downloads,
    COALESCE(bp_stats.last_plan_activity, p.created_at) as last_plan_activity
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_plans,
        SUM(COALESCE(download_count, 0)) as total_downloads,
        STRING_AGG(DISTINCT industry, ', ') as business_industry,
        MAX(updated_at) as last_plan_activity
    FROM business_plans 
    GROUP BY user_id
) bp_stats ON p.id = bp_stats.user_id;

-- Create the missing admin_user_invites table
CREATE TABLE IF NOT EXISTS public.admin_user_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    location TEXT,
    business_industry TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_user_invites
ALTER TABLE public.admin_user_invites ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage invites
CREATE POLICY "Admins can manage user invites"
ON public.admin_user_invites
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update the analytics_summary view to include missing columns
DROP VIEW IF EXISTS public.analytics_summary;
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM business_plans) as total_plans,
    (SELECT COUNT(*) FROM business_plans WHERE status = 'completed') as completed_plans,
    (SELECT SUM(COALESCE(download_count, 0)) FROM business_plans) as total_downloads,
    (SELECT COUNT(DISTINCT up.location) FROM user_profiles up WHERE up.location IS NOT NULL) as total_locations,
    (SELECT COUNT(DISTINCT bp.industry) FROM business_plans bp WHERE bp.industry IS NOT NULL) as total_industries,
    (SELECT COUNT(DISTINCT p.region) FROM profiles p WHERE p.region IS NOT NULL) as total_regions;
