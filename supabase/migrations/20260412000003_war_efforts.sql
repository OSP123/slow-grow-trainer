CREATE TABLE public.war_efforts (
    mega_faction TEXT PRIMARY KEY CHECK (mega_faction IN ('imperium', 'chaos', 'xenos')),
    score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.war_efforts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active scores
CREATE POLICY "Public Read for War Efforts" ON public.war_efforts
    FOR SELECT USING (true);

-- Only admins can mutate the overall war effort totals
CREATE POLICY "Admins can update war efforts" ON public.war_efforts
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Seed initial Campaign Totals
INSERT INTO public.war_efforts (mega_faction, score) VALUES 
('imperium', 0),
('chaos', 0),
('xenos', 0);
