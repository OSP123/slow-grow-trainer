-- Safe sync script for updating Army Roster points

DO $$
DECLARE
  rec RECORD;
  tier_json JSONB;
  tier_models INT;
  tier_points INT;
BEGIN
  -- Loop over all army_units
  FOR rec IN SELECT id, unit_name, faction, model_count FROM public.army_units LOOP
    
    -- Check if it matches a unit_points entry with cost_tiers
    FOR tier_json IN
      SELECT jsonb_array_elements(cost_tiers)
      FROM public.unit_points
      WHERE unit_name = rec.unit_name AND faction = rec.faction AND cost_tiers IS NOT NULL AND jsonb_typeof(cost_tiers) = 'array'
    LOOP
      tier_models := CAST(tier_json->>'models' AS INTEGER);
      tier_points := CAST(tier_json->>'points' AS INTEGER);
      
      IF tier_models = rec.model_count THEN
        UPDATE public.army_units SET points = tier_points WHERE id = rec.id;
      END IF;
    END LOOP;

    -- Update base_points for units with empty or null cost_tiers
    UPDATE public.army_units
    SET points = up.base_points
    FROM public.unit_points up
    WHERE army_units.id = rec.id
      AND up.unit_name = rec.unit_name
      AND up.faction = rec.faction
      AND (up.cost_tiers IS NULL OR jsonb_array_length(up.cost_tiers) = 0);

  END LOOP;
END $$;
