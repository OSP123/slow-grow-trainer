CREATE TABLE IF NOT EXISTS public.war_efforts (
    mega_faction TEXT PRIMARY KEY CHECK (mega_faction IN ('imperium', 'chaos', 'xenos')),
    score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS safely
ALTER TABLE public.war_efforts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read for War Efforts' AND tablename = 'war_efforts') THEN
    CREATE POLICY "Public Read for War Efforts" ON public.war_efforts FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update war efforts' AND tablename = 'war_efforts') THEN
    CREATE POLICY "Admins can update war efforts" ON public.war_efforts
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- Seed initial Campaign Totals safely
INSERT INTO public.war_efforts (mega_faction, score) VALUES 
('imperium', 0),
('chaos', 0),
('xenos', 0)
ON CONFLICT (mega_faction) DO NOTHING;
