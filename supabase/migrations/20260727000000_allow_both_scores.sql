-- Allow both players to set both VP scores
-- The trigger previously blocked cross-player score writes, but both
-- players need to be able to enter both scores. Lore and TL;DR remain
-- player-specific (P1 writes p1_lore/p1_tldr, P2 writes p2_lore/p2_tldr).

CREATE OR REPLACE FUNCTION public.enforce_matchup_update()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.p1_id THEN
    -- P1 can modify both scores, but only p1_lore and p1_tldr
    NEW.p2_lore := OLD.p2_lore;
    NEW.p2_tldr := OLD.p2_tldr;
  ELSIF auth.uid() = NEW.p2_id THEN
    -- P2 can modify both scores, but only p2_lore and p2_tldr
    NEW.p1_lore := OLD.p1_lore;
    NEW.p1_tldr := OLD.p1_tldr;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
