-- Allow authenticated users to explicitly insert their own Profile data if they bypass the Auth trigger 
-- (Specifically safeguards missing-account ghosts from throwing PostgREST HTTP 403 Forbidden errors naturally)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
