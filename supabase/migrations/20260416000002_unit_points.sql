-- Unit Points Registry
-- Admin-managed table mapping unit names to their current GW points cost.
-- Updated via the Admin Dashboard whenever GW issues balance updates.
CREATE TABLE public.unit_points (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faction     TEXT NOT NULL,
  unit_name   TEXT NOT NULL,
  base_points INTEGER NOT NULL CHECK (base_points >= 0),
  updated_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (faction, unit_name)
);

ALTER TABLE public.unit_points ENABLE ROW LEVEL SECURITY;

-- Anyone can read the points table (needed for auto-fill in the roster UI)
CREATE POLICY "Public read unit points" ON public.unit_points
  FOR SELECT USING (true);

-- Only authenticated users can write (admin panel is code-gated behind TERMINUS_ROOT)
CREATE POLICY "Authenticated users manage unit points" ON public.unit_points
  FOR ALL USING (auth.role() = 'authenticated');
