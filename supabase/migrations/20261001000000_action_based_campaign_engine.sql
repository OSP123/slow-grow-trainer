-- Rebuild the campaign map around REPORTED ACTIONS rather than match outcomes.
--
-- Why this exists:
--   The campaign map has never recorded anything, for three separate reasons.
--   public.territories was never created (20260621000000_campaign_engine.sql
--   creates campaign_state AND territories, but only the former exists, so that
--   migration was applied partially). trigger_process_match_outcome sits at the
--   end of that same file and so was never attached either. And the lookup could
--   not have matched anyway: territories.name held a bare theatre
--   ('The Ash Wastes') while matchups.theatre_name always carries a sub-sector
--   ('The Ash Wastes - Nomad Trail').
--
--   Separately, that engine was built on the wrong premise. Rewards are meant to
--   come from the deeds commanders describe in their battle reports, not from
--   who won. Winning a match earns victory points and honour ratings; it moves
--   nothing on the map.
--
-- The design here is a ledger. Every award an admin grants is a row, and the
-- territory map is DERIVED by replaying that ledger. Nothing is ever mutated in
-- place, so an award can be corrected or withdrawn and the map simply recomputes.

-- ---------------------------------------------------------------------------
-- 1. Retire the outcome-driven engine
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_process_match_outcome ON public.matchups;
DROP FUNCTION IF EXISTS public.process_match_outcome();

-- ---------------------------------------------------------------------------
-- 2. The territory map
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    imperium_control INTEGER NOT NULL DEFAULT 50,
    chaos_corruption INTEGER NOT NULL DEFAULT 50,
    ork_foothold INTEGER NOT NULL DEFAULT 0,
    tau_foothold INTEGER NOT NULL DEFAULT 0,
    aeldari_foothold INTEGER NOT NULL DEFAULT 0,
    necron_foothold INTEGER NOT NULL DEFAULT 0,
    tyranid_foothold INTEGER NOT NULL DEFAULT 0,
    genestealer_foothold INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Repair the old seed's name if a partial apply ever created it.
UPDATE public.territories SET name = 'Orbital Relay Station'
WHERE name = 'Orbital Defense Grid'
  AND NOT EXISTS (SELECT 1 FROM public.territories WHERE name = 'Orbital Relay Station');

-- These six must match THEATRES in Dashboard.tsx and REAL_SECTORS in
-- AdminDashboard.tsx / Matchmaker.ts exactly, or the influence bars stay hidden.
INSERT INTO public.territories (name) VALUES
('The Hive Spires'),
('The Ash Wastes'),
('The Magma Forges'),
('Orbital Relay Station'),
('The Sump Ruins'),
('The Toxic Oceans')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users on territories" ON public.territories;
CREATE POLICY "Enable read access for all users on territories"
  ON public.territories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for admins on territories" ON public.territories;
CREATE POLICY "Enable update for admins on territories"
  ON public.territories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- 3. The award ledger
-- ---------------------------------------------------------------------------
-- One row per effect. A deed with two effects (a Necron awakening credits both
-- the contested war zone and the tomb world under The Sump Ruins) is two rows,
-- so the admin can see and withdraw each one.

CREATE TABLE IF NOT EXISTS public.campaign_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- The report this was adjudicated from.
    matchup_id UUID REFERENCES public.matchups(id) ON DELETE CASCADE,
    -- The commander who performed the deed.
    commander_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    deed TEXT NOT NULL,
    metric TEXT NOT NULL CHECK (metric IN (
        'imperium_control', 'chaos_corruption', 'ork_foothold', 'tau_foothold',
        'aeldari_foothold', 'necron_foothold', 'tyranid_foothold',
        'genestealer_foothold', 'votann_resources'
    )),
    -- NULL for campaign-wide metrics such as votann_resources.
    territory_name TEXT,
    delta INTEGER NOT NULL,
    note TEXT,
    awarded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS campaign_awards_matchup_idx ON public.campaign_awards (matchup_id);
CREATE INDEX IF NOT EXISTS campaign_awards_commander_idx ON public.campaign_awards (commander_id);

ALTER TABLE public.campaign_awards ENABLE ROW LEVEL SECURITY;

-- Players can see why the map looks the way it does.
DROP POLICY IF EXISTS "Anyone can read campaign awards" ON public.campaign_awards;
CREATE POLICY "Anyone can read campaign awards"
  ON public.campaign_awards FOR SELECT USING (true);

-- Only admins adjudicate.
DROP POLICY IF EXISTS "Admins can insert campaign awards" ON public.campaign_awards;
CREATE POLICY "Admins can insert campaign awards"
  ON public.campaign_awards FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update campaign awards" ON public.campaign_awards;
CREATE POLICY "Admins can update campaign awards"
  ON public.campaign_awards FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete campaign awards" ON public.campaign_awards;
CREATE POLICY "Admins can delete campaign awards"
  ON public.campaign_awards FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- 4. Derive the map from the ledger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.recalculate_campaign_map()
RETURNS VOID AS $fn$
DECLARE
    a RECORD;
BEGIN
    -- Back to baseline, then replay. Makes the whole thing idempotent.
    UPDATE public.territories
       SET imperium_control = 50,
           chaos_corruption = 50,
           ork_foothold = 0,
           tau_foothold = 0,
           aeldari_foothold = 0,
           necron_foothold = 0,
           tyranid_foothold = 0,
           genestealer_foothold = 0;

    UPDATE public.campaign_state SET votann_resources_secured = 0 WHERE id = 1;

    FOR a IN SELECT * FROM public.campaign_awards ORDER BY created_at, id LOOP
        IF a.metric = 'votann_resources' THEN
            UPDATE public.campaign_state
               SET votann_resources_secured = GREATEST(0, votann_resources_secured + a.delta)
             WHERE id = 1;
        ELSIF a.territory_name IS NOT NULL THEN
            -- metric is constrained by the CHECK above, so %I is safe here.
            EXECUTE format(
                'UPDATE public.territories SET %I = LEAST(100, GREATEST(0, %I + $1)) WHERE name = $2',
                a.metric, a.metric
            ) USING a.delta, a.territory_name;
        END IF;
    END LOOP;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep the map in step with the ledger automatically.
CREATE OR REPLACE FUNCTION public.campaign_awards_changed()
RETURNS trigger AS $fn$
BEGIN
    PERFORM public.recalculate_campaign_map();
    RETURN NULL;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_campaign_awards_changed ON public.campaign_awards;
CREATE TRIGGER trigger_campaign_awards_changed
AFTER INSERT OR UPDATE OR DELETE ON public.campaign_awards
FOR EACH STATEMENT
EXECUTE FUNCTION public.campaign_awards_changed();

-- Build the map from whatever is already in the ledger (nothing, on first run).
SELECT public.recalculate_campaign_map();
