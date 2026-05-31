-- Update historical milestone progress to the new 400-point scale
UPDATE public.hobby_milestones SET milestone_step = '400 Points Built' WHERE milestone_step = '500 Points Built';
UPDATE public.hobby_milestones SET milestone_step = '400 Points Painted' WHERE milestone_step = '500 Points Painted';

UPDATE public.hobby_milestones SET milestone_step = '800 Points Built' WHERE milestone_step = '1000 Points Built';
UPDATE public.hobby_milestones SET milestone_step = '800 Points Painted' WHERE milestone_step = '1000 Points Painted';

UPDATE public.hobby_milestones SET milestone_step = '1200 Points Built' WHERE milestone_step = '1500 Points Built';
UPDATE public.hobby_milestones SET milestone_step = '1200 Points Painted' WHERE milestone_step = '1500 Points Painted';

-- 1600 Points is a new step that did not exist previously, so no old entries map directly to it.
-- 2000 Points remains untouched.
