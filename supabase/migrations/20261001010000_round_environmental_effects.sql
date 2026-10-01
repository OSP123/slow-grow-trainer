-- Environmental effects that take hold when the campaign advances a round.
--
-- Advancing a round previously did exactly one thing: UPDATE campaign_state SET
-- current_month = n. Nothing reacted to it. The only month-specific behaviour in
-- the whole app was a label ('The Siege of Vespera') and a hardcoded month-5
-- banner. global_events existed but had no way to be tied to a round, and
-- carried only narrative text with no rules.
--
-- An effect now belongs to a round, carries the rules text both players apply at
-- the table, and goes live automatically when the campaign reaches that round.

-- ---------------------------------------------------------------------------
-- 1. Round binding and rules text
-- ---------------------------------------------------------------------------

-- NULL campaign_month means the event is not round-bound: it is staged and
-- retired by hand, which is how every existing event behaves.
ALTER TABLE public.global_events
ADD COLUMN IF NOT EXISTS campaign_month INTEGER;

-- The modifier both players apply during the game. Kept separate from
-- `description`, which stays the narrative flavour.
ALTER TABLE public.global_events
ADD COLUMN IF NOT EXISTS rules_text TEXT;

COMMENT ON COLUMN public.global_events.campaign_month IS
  'The campaign round this effect belongs to. Activates automatically when the campaign reaches it. NULL = staged and retired manually.';
COMMENT ON COLUMN public.global_events.rules_text IS
  'The rules modifier both players apply at the table. Narrative flavour lives in description.';

CREATE INDEX IF NOT EXISTS global_events_month_idx
  ON public.global_events (campaign_month)
  WHERE campaign_month IS NOT NULL;

-- Repair war zone names on any existing events. The admin dropdown used to offer
-- names that do not exist ('Hive Primus', 'Magma Forges', 'Orbital Tether',
-- 'The Sump', 'Rad-Zone Gamma'), so a per-theatre event could never match a
-- matchup. These are the six real ones.
UPDATE public.global_events SET theatre_name = 'The Hive Spires'       WHERE theatre_name = 'Hive Primus';
UPDATE public.global_events SET theatre_name = 'The Magma Forges'      WHERE theatre_name = 'Magma Forges';
UPDATE public.global_events SET theatre_name = 'Orbital Relay Station' WHERE theatre_name = 'Orbital Tether';
UPDATE public.global_events SET theatre_name = 'The Sump Ruins'        WHERE theatre_name = 'The Sump';
-- 'Rad-Zone Gamma' has no counterpart; make it campaign-wide rather than guess.
UPDATE public.global_events SET theatre_name = NULL                    WHERE theatre_name = 'Rad-Zone Gamma';

-- ---------------------------------------------------------------------------
-- 2. Activate on round advance
-- ---------------------------------------------------------------------------
-- A database trigger rather than client code, so the effects follow the round
-- no matter what moves it -- the admin dashboard, a SQL console, or anything else.

CREATE OR REPLACE FUNCTION public.sync_round_effects()
RETURNS trigger AS $fn$
BEGIN
    IF NEW.current_month IS DISTINCT FROM OLD.current_month THEN
        -- Round-bound effects follow the campaign: this round's go live, every
        -- other round's retires. Manual events (campaign_month IS NULL) are
        -- left exactly as the admin set them.
        UPDATE public.global_events
           SET is_active = (campaign_month = NEW.current_month)
         WHERE campaign_month IS NOT NULL
           AND is_active IS DISTINCT FROM (campaign_month = NEW.current_month);
    END IF;
    RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_round_effects ON public.campaign_state;
CREATE TRIGGER trigger_sync_round_effects
AFTER UPDATE ON public.campaign_state
FOR EACH ROW
EXECUTE FUNCTION public.sync_round_effects();

-- Bring existing round-bound effects in line with the round we are already on.
UPDATE public.global_events ge
   SET is_active = (ge.campaign_month = cs.current_month)
  FROM public.campaign_state cs
 WHERE cs.id = 1
   AND ge.campaign_month IS NOT NULL;
