-- Legendary Moments: standout moments from the table, recognised on the
-- commander's profile and the War Effort page.
--
-- Why this exists:
--   The best things in the battle reports -- an Armiger pilot trading his life
--   for a Daemon Prince's, scarabs blowing up Lucius the Eternal -- had nowhere
--   to live beyond the report itself. A moment is a narrative honour only: it
--   carries no rules, points or map effect, so it cannot tilt game balance.
--
-- Flow: either player in a completed matchup nominates one moment from it
-- (theirs or their opponent's), an admin approves or rejects it, and approved
-- moments are public.

CREATE TABLE IF NOT EXISTS public.legendary_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matchup_id UUID NOT NULL REFERENCES public.matchups(id) ON DELETE CASCADE,
    -- Who put it forward, and whose moment it was. Either player may nominate
    -- either player, so an opponent's heroics get recognised too.
    nominated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    honoured_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
    description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 500),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- One nomination per player per battle keeps them special.
    UNIQUE (matchup_id, nominated_by)
);

CREATE INDEX IF NOT EXISTS legendary_moments_honoured_idx ON public.legendary_moments (honoured_id);
CREATE INDEX IF NOT EXISTS legendary_moments_status_idx ON public.legendary_moments (status);

ALTER TABLE public.legendary_moments ENABLE ROW LEVEL SECURITY;

-- Approved moments are public; a nominator can see their own pending or
-- rejected ones; admins see everything.
DROP POLICY IF EXISTS "Read legendary moments" ON public.legendary_moments;
CREATE POLICY "Read legendary moments"
  ON public.legendary_moments FOR SELECT USING (
    status = 'approved'
    OR nominated_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Players nominate only from a completed battle they fought in, only someone
-- who fought in it, and only as pending.
DROP POLICY IF EXISTS "Players nominate from their own battles" ON public.legendary_moments;
CREATE POLICY "Players nominate from their own battles"
  ON public.legendary_moments FOR INSERT WITH CHECK (
    nominated_by = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND EXISTS (
      SELECT 1 FROM public.matchups m
      WHERE m.id = matchup_id
        AND m.status = 'completed'
        AND auth.uid() IN (m.p1_id, m.p2_id)
        AND honoured_id IN (m.p1_id, m.p2_id)
    )
  );

-- Only admins approve or reject.
DROP POLICY IF EXISTS "Admins review legendary moments" ON public.legendary_moments;
CREATE POLICY "Admins review legendary moments"
  ON public.legendary_moments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- A player may withdraw their own nomination while it is pending; admins may
-- delete any.
DROP POLICY IF EXISTS "Withdraw legendary moments" ON public.legendary_moments;
CREATE POLICY "Withdraw legendary moments"
  ON public.legendary_moments FOR DELETE USING (
    (nominated_by = auth.uid() AND status = 'pending')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
