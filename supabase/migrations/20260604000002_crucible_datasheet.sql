-- Migration: Crucible of Champions Datasheet

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS warlord_datasheet JSONB DEFAULT '{}'::jsonb;
