-- Migration: Player Status
-- Adds campaign_status to profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS campaign_status TEXT DEFAULT 'active'::text;
