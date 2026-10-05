-- Territory control is now a SHARE of influence across every faction.
--
-- Why this exists:
--   Each faction had its own 0-100 meter, capped independently, and nothing
--   compared them. Imperium and Chaos started at 50 and xenos at 0, so the map
--   read as a two-way fight and no one ever "controlled" a territory. The
--   dashboard now shows each faction's score as a share of the territory's
--   total (always summing to 100%) and names the largest share as controller.
--
--   Because shares are relative, the 100 cap on the raw scores is dropped: a
--   capped Imperium at 100 could otherwise never pull further ahead of a rival
--   that is also climbing. Scores still floor at 0.
--
--   Leagues of Votann gain a territorial meter (their campaign-wide resource
--   tally is unchanged) and Drukhari stop sharing the Aeldari meter.

-- ---------------------------------------------------------------------------
-- 1. New meters
-- ---------------------------------------------------------------------------

ALTER TABLE public.territories
    ADD COLUMN IF NOT EXISTS votann_foothold INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS drukhari_foothold INTEGER NOT NULL DEFAULT 0;

-- Must match AwardMetric in src/data/campaignDeeds.ts.
ALTER TABLE public.campaign_awards DROP CONSTRAINT IF EXISTS campaign_awards_metric_check;
ALTER TABLE public.campaign_awards ADD CONSTRAINT campaign_awards_metric_check CHECK (metric IN (
    'imperium_control', 'chaos_corruption', 'ork_foothold', 'tau_foothold',
    'aeldari_foothold', 'drukhari_foothold', 'necron_foothold', 'tyranid_foothold',
    'genestealer_foothold', 'votann_foothold', 'votann_resources'
));

-- ---------------------------------------------------------------------------
-- 2. Derive the map from the ledger, uncapped
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
           drukhari_foothold = 0,
           necron_foothold = 0,
           tyranid_foothold = 0,
           genestealer_foothold = 0,
           votann_foothold = 0;

    UPDATE public.campaign_state SET votann_resources_secured = 0 WHERE id = 1;

    FOR a IN SELECT * FROM public.campaign_awards ORDER BY created_at, id LOOP
        IF a.metric = 'votann_resources' THEN
            UPDATE public.campaign_state
               SET votann_resources_secured = GREATEST(0, votann_resources_secured + a.delta)
             WHERE id = 1;
        ELSIF a.territory_name IS NOT NULL THEN
            -- metric is constrained by the CHECK above, so %I is safe here.
            EXECUTE format(
                'UPDATE public.territories SET %I = GREATEST(0, %I + $1) WHERE name = $2',
                a.metric, a.metric
            ) USING a.delta, a.territory_name;
        END IF;
    END LOOP;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 3. Give Drukhari back their own deeds
-- ---------------------------------------------------------------------------
-- Until now a Drukhari commander's webway raids landed on the Aeldari meter.
-- Re-point those to the new Drukhari meter. The statement trigger on
-- campaign_awards rebuilds the map; the explicit call below covers the case
-- where there was nothing to move.

UPDATE public.campaign_awards
   SET metric = 'drukhari_foothold'
 WHERE metric = 'aeldari_foothold'
   AND commander_id IN (SELECT id FROM public.profiles WHERE army_faction = 'Drukhari');

SELECT public.recalculate_campaign_map();
