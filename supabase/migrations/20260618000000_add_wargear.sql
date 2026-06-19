ALTER TABLE public.unit_points ADD COLUMN IF NOT EXISTS wargear_options JSONB DEFAULT '[]'::jsonb;
