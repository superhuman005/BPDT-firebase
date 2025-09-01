
-- Drop existing triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing views first (they depend on tables)
DROP VIEW IF EXISTS public.analytics_summary;

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS public.bulk_user_invites;
DROP TABLE IF EXISTS public.business_plans;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.analytics_data;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.has_role(bigint, text);
DROP FUNCTION IF EXISTS public.is_admin();

-- Drop existing types
DROP TYPE IF EXISTS public.app_role;

-- Now recreate the schema for the new project requirements
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table (separate from profiles as per best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create business plans table with reorganized structure
CREATE TABLE public.business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- The Business section
  company_name TEXT,
  industry TEXT,
  
  -- Industry Analysis section
  market_size TEXT,
  target_market TEXT,
  competitive_advantage TEXT,
  
  -- Marketing and Sales Strategies section
  marketing_strategy TEXT,
  revenue_streams TEXT,
  
  -- Operations and Management section
  operational_plan TEXT,
  management_team TEXT,
  business_model TEXT,
  
  -- Financial Plan section
  financial_projections TEXT,
  funding_request TEXT,
  
  -- Appendices section
  risk_analysis TEXT,
  
  -- Executive Summary section (filled last)
  executive_summary TEXT,
  problem_statement TEXT,
  solution TEXT,
  
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk user invites table for admin functionality
CREATE TABLE public.bulk_user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_user_invites ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create RLS policies for user_roles (admin only)
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Create RLS policies for business_plans
CREATE POLICY "Users can view their own business plans" 
  ON public.business_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business plans" 
  ON public.business_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business plans" 
  ON public.business_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business plans" 
  ON public.business_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all business plans"
  ON public.business_plans
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create RLS policies for bulk_user_invites (admin only)
CREATE POLICY "Admins can manage bulk invites"
  ON public.bulk_user_invites
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile and role on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create analytics view for admin dashboard
CREATE VIEW public.analytics_summary AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.business_plans) as total_plans,
  (SELECT COUNT(*) FROM public.business_plans WHERE executive_summary IS NOT NULL AND problem_statement IS NOT NULL AND solution IS NOT NULL) as completed_plans,
  (SELECT COUNT(DISTINCT region) FROM public.profiles WHERE region IS NOT NULL) as total_regions;
