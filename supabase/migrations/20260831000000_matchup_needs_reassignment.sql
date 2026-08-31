-- Dropping a commander used to DELETE their scheduled matchups outright, which
-- silently removed the *opponent's* frontline as well — the opponent lost their
-- assignment (and the ability to file a battle report) with no notice to them
-- or to the admin.
--
-- Matchups are now flagged instead of deleted, so the opponent keeps a visible
-- frontline and the admin gets an explicit prompt to re-pair them.

ALTER TABLE public.matchups
ADD COLUMN IF NOT EXISTS needs_reassignment BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.matchups.needs_reassignment IS
  'True when a participant has withdrawn (paused/removed) and this pairing still needs an admin to re-pair the remaining commander.';

-- Cheap lookup for the admin dashboard, which filters on this flag.
CREATE INDEX IF NOT EXISTS matchups_needs_reassignment_idx
  ON public.matchups (needs_reassignment)
  WHERE needs_reassignment;

-- A stranded commander may instead claim an uncontested victory: they still
-- record a battle report and are awarded full victory points, without rating
-- an opponent who never showed.
ALTER TABLE public.matchups
ADD COLUMN IF NOT EXISTS uncontested BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.matchups.uncontested IS
  'True when this engagement was resolved as an uncontested victory because the opponent withdrew, rather than actually being fought.';
