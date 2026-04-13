-- Alter existing Campaign Votes Foreign Keys to point formally at public.profiles
-- This enables PostgREST to automatically traverse the relationship for nested JSON mapping to show commander names.

ALTER TABLE public.campaign_votes
DROP CONSTRAINT IF EXISTS campaign_votes_voter_id_fkey,
DROP CONSTRAINT IF EXISTS campaign_votes_nominee_id_fkey;

ALTER TABLE public.campaign_votes
ADD CONSTRAINT campaign_votes_nominee_id_fkey FOREIGN KEY (nominee_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT campaign_votes_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
