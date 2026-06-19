-- Sync all existing army rosters to the latest Munitorum Field Manual points

-- 1. Update units that match a specific cost tier (e.g. 5 models for 75pts)
UPDATE public.army_units au
SET points = CAST(tier->>'points' AS INTEGER)
FROM public.unit_points up,
     jsonb_array_elements(up.cost_tiers) AS tier
WHERE au.unit_name = up.unit_name
  AND au.faction = up.faction
  AND au.model_count = CAST(tier->>'models' AS INTEGER);

-- 2. Update units that don't have cost tiers (e.g. characters, vehicles)
UPDATE public.army_units au
SET points = up.base_points
FROM public.unit_points up
WHERE au.unit_name = up.unit_name
  AND au.faction = up.faction
  AND (up.cost_tiers IS NULL OR jsonb_array_length(up.cost_tiers) = 0);

-- Note: Units where the model count doesn't match any legal tier (e.g. an illegal squad size)
-- or units with custom names that don't exist in the official manual will be left untouched.
