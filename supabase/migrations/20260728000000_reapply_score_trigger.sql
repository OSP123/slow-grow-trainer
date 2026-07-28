-- Re-apply the enforce_matchup_update trigger to ensure both players
-- can set both VP scores. This replaces the function that previously
-- blocked cross-player score writes.
-- Also drops and recreates the trigger to ensure a clean state.

CREATE OR REPLACE FUNCTION public.enforce_matchup_update()
RETURNS trigger AS $$
BEGIN
  -- Admins and service_role bypass all restrictions
  IF auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  -- Both players can modify both p1_score and p2_score.
  -- But lore and tldr remain player-specific.
  IF auth.uid() = NEW.p1_id THEN
    NEW.p2_lore := OLD.p2_lore;
    NEW.p2_tldr := OLD.p2_tldr;
  ELSIF auth.uid() = NEW.p2_id THEN
    NEW.p1_lore := OLD.p1_lore;
    NEW.p1_tldr := OLD.p1_tldr;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it fires the updated function
DROP TRIGGER IF EXISTS on_matchup_update ON public.matchups;
CREATE TRIGGER on_matchup_update
  BEFORE UPDATE ON public.matchups
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_matchup_update();
