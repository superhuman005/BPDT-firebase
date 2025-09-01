
-- Create table to track plan downloads
CREATE TABLE public.plan_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES public.business_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text,
  downloaded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
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
  USING (is_admin());

-- Create table to track user download limits
CREATE TABLE public.user_download_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  downloads_remaining integer NOT NULL DEFAULT 3,
  downloads_used integer NOT NULL DEFAULT 0,
  last_reset_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_download_limits
ALTER TABLE public.user_download_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_download_limits
CREATE POLICY "Users can view their own download limits" 
  ON public.user_download_limits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own download limits" 
  ON public.user_download_limits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own download limits" 
  ON public.user_download_limits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all download limits" 
  ON public.user_download_limits 
  FOR SELECT 
  USING (is_admin());

-- Create table for email notifications tracking
CREATE TABLE public.email_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  notification_type text NOT NULL, -- 'welcome', 'password_reset', 'incomplete_plan_reminder'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on email_notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_notifications
CREATE POLICY "Admins can view all email notifications" 
  ON public.email_notifications 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "System can insert email notifications" 
  ON public.email_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Function to initialize user download limits
CREATE OR REPLACE FUNCTION public.initialize_user_download_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_download_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize download limits for new users
CREATE TRIGGER on_auth_user_created_download_limits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_download_limits();

-- Function to check incomplete plans (for cron job)
CREATE OR REPLACE FUNCTION public.get_users_with_incomplete_plans()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  last_plan_activity timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT 
    p.id as user_id,
    p.email as user_email,
    bp.updated_at as last_plan_activity
  FROM public.profiles p
  LEFT JOIN public.business_plans bp ON p.id = bp.user_id
  WHERE p.created_at < (now() - interval '3 weeks')
    AND (
      bp.id IS NULL OR 
      bp.completion_percentage < 100 OR
      bp.updated_at < (now() - interval '3 weeks')
    );
$$;
