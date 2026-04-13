-- Drop the infinitely recursive Admin read policy on profiles
-- Since we already opened up `profiles` reads to all authenticated users via `20260412000000_public_profiles_rls.sql`,
-- this old policy is now fully redundant and causes PostgREST 500 Infinite Recursion crashes when evaluated.
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
