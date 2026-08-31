-- A commander whose opponent withdrew needs a frontline of their own so they can
-- claim an uncontested victory and file a battle report. Until now that was
-- impossible: p2_id was NOT NULL, so every matchup required a second real
-- commander. Where the original pairing had already been deleted, the admin had
-- to remember who the opponent was and name them by hand.
--
-- Allowing p2_id to be NULL models a bye honestly: there is no opponent.

ALTER TABLE public.matchups
ALTER COLUMN p2_id DROP NOT NULL;

COMMENT ON COLUMN public.matchups.p2_id IS
  'The opposing commander. NULL for a bye: the opponent withdrew and no replacement was assigned.';
