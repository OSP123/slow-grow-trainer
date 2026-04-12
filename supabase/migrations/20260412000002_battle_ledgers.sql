CREATE TABLE public.matchups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    p1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    p2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    p1_score INTEGER,
    p2_score INTEGER,
    game_result TEXT CHECK (game_result IN ('p1_win', 'p2_win', 'draw')),
    p1_lore TEXT,
    p2_lore TEXT,
    status TEXT DEFAULT 'scheduled'::text CHECK (status IN ('scheduled', 'completed', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS enablement
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

-- Anyone can read completed/scheduled matchups
CREATE POLICY "Public Read for Matchups" ON public.matchups
    FOR SELECT USING (true);

-- Only Admins can explicitly Create (schedule) matchups
CREATE POLICY "Admins can insert matchups" ON public.matchups
    FOR INSERT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Participants can Update their specific matchups (Log score/lore)
CREATE POLICY "Participants can update their matchups" ON public.matchups
    FOR UPDATE USING (
      auth.uid() = p1_id OR auth.uid() = p2_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
