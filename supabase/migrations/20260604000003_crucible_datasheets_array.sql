-- Migration: Add Crucible Datasheets array

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS crucible_datasheets JSONB DEFAULT '[]'::jsonb;
