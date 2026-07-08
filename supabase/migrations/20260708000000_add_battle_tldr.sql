-- Add optional TL;DR summary fields for battle reports
ALTER TABLE public.matchups ADD COLUMN IF NOT EXISTS p1_tldr TEXT;
ALTER TABLE public.matchups ADD COLUMN IF NOT EXISTS p2_tldr TEXT;

-- Update the security trigger to protect TL;DR columns
-- P1 cannot write P2's TL;DR and vice versa
CREATE OR REPLACE FUNCTION public.enforce_matchup_update()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.p1_id THEN
    -- P1 can only modify p1_score, p1_lore, p1_tldr
    NEW.p2_score := OLD.p2_score;
    NEW.p2_lore := OLD.p2_lore;
    NEW.p2_tldr := OLD.p2_tldr;
  ELSIF auth.uid() = NEW.p2_id THEN
    -- P2 can only modify p2_score, p2_lore, p2_tldr
    NEW.p1_score := OLD.p1_score;
    NEW.p1_lore := OLD.p1_lore;
    NEW.p1_tldr := OLD.p1_tldr;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
