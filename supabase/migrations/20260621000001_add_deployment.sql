-- Add deployed_theatre column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deployed_theatre TEXT;
