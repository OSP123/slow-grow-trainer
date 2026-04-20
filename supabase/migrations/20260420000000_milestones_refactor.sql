-- Add the new milestone_step column
ALTER TABLE public.hobby_milestones 
ADD COLUMN milestone_step TEXT;

-- For any old data (assuming there might be some points_threshold data, though unlikely in a fresh env)
UPDATE public.hobby_milestones 
SET milestone_step = points_threshold::TEXT || ' Points Built'
WHERE points_threshold IS NOT NULL AND milestone_step IS NULL;

-- Drop the old flawed column
ALTER TABLE public.hobby_milestones 
DROP COLUMN IF EXISTS points_threshold;

-- Make the new column required
ALTER TABLE public.hobby_milestones 
ALTER COLUMN milestone_step SET NOT NULL;
