-- Migration: Narrative Expansion
-- Adds Warlord tracking and Global Events

-- 1. Add Warlord columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS warlord_name TEXT,
ADD COLUMN IF NOT EXISTS warlord_traits JSONB DEFAULT '[]'::jsonb;

-- 2. Create global_events table
CREATE TABLE IF NOT EXISTS public.global_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.global_events ENABLE ROW LEVEL SECURITY;

-- Create policies for global_events
CREATE POLICY "Enable read access for all users"
ON public.global_events FOR SELECT
USING (true);

-- Only admins can modify global events
CREATE POLICY "Enable insert for admins"
ON public.global_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable update for admins"
ON public.global_events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable delete for admins"
ON public.global_events FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
