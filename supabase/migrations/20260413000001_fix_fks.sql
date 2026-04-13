-- Alter existing Matchups Foreign Keys to point formally at public.profiles
-- This enables PostgREST to automatically traverse the relationship for nested JSON mapping (GraphQL-style auto joins).

ALTER TABLE public.matchups
DROP CONSTRAINT IF EXISTS matchups_p1_id_fkey,
DROP CONSTRAINT IF EXISTS matchups_p2_id_fkey;

ALTER TABLE public.matchups
ADD CONSTRAINT matchups_p1_id_fkey FOREIGN KEY (p1_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT matchups_p2_id_fkey FOREIGN KEY (p2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
