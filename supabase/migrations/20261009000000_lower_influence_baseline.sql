-- Lower the Imperium / Chaos starting influence from 50 to 20.
--
-- Why this exists:
--   Control is each faction's share of a war zone's total score. Starting both
--   at 50 meant a typical deed (+/-5) barely moved the map: three rounds of
--   credited deeds left no faction above 53% anywhere, and xenos stayed in
--   single digits. At 20 the same deeds shift control visibly and xenos become
--   real contenders, while the Imperium and Chaos still begin evenly matched.
--
-- Nothing else changes: the map is still rebuilt from the award ledger.

ALTER TABLE public.territories ALTER COLUMN imperium_control SET DEFAULT 20;
ALTER TABLE public.territories ALTER COLUMN chaos_corruption SET DEFAULT 20;

CREATE OR REPLACE FUNCTION public.recalculate_campaign_map()
RETURNS VOID AS $fn$
DECLARE
    a RECORD;
BEGIN
    -- Back to baseline, then replay. Makes the whole thing idempotent.
    UPDATE public.territories
       SET imperium_control = 20,
           chaos_corruption = 20,
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
            -- metric is constrained by the CHECK on campaign_awards, so %I is safe here.
            EXECUTE format(
                'UPDATE public.territories SET %I = GREATEST(0, %I + $1) WHERE name = $2',
                a.metric, a.metric
            ) USING a.delta, a.territory_name;
        END IF;
    END LOOP;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT public.recalculate_campaign_map();
