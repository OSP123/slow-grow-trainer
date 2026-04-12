-- Update profiles RLS policy to allow authenticated users to resolve commander names visually
CREATE POLICY "Allow authenticated users to read all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
