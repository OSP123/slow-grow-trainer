-- Fix the foreign key for hobby_milestones so PostgREST can auto-join with profiles
ALTER TABLE public.hobby_milestones
DROP CONSTRAINT IF EXISTS hobby_milestones_user_id_fkey;

ALTER TABLE public.hobby_milestones
ADD CONSTRAINT hobby_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
