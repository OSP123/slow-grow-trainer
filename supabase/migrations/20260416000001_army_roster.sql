-- Army Roster Units Table
CREATE TABLE public.army_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL,
  faction TEXT,
  model_count INTEGER DEFAULT 1,
  points INTEGER,
  built BOOLEAN DEFAULT false NOT NULL,
  painted BOOLEAN DEFAULT false NOT NULL,
  played BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.army_units ENABLE ROW LEVEL SECURITY;

-- All rosters are public
CREATE POLICY "Public read for army units" ON public.army_units
  FOR SELECT USING (true);

-- Insert only for own rows
CREATE POLICY "Users can insert own army units" ON public.army_units
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Update only own rows
CREATE POLICY "Users can update own army units" ON public.army_units
  FOR UPDATE USING (profile_id = auth.uid());

-- Delete only own rows
CREATE POLICY "Users can delete own army units" ON public.army_units
  FOR DELETE USING (profile_id = auth.uid());
