-- 1. Extend the Profiles Table
ALTER TABLE public.profiles
ADD COLUMN location TEXT,
ADD COLUMN experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'experienced')),
ADD COLUMN army_faction TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN army_lore TEXT;

-- 2. Update the Auth Trigger to capture new Data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  IF new.email = 'omarpatel123@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'user';
  END IF;

  INSERT INTO public.profiles (
    id, email, real_name, commander_name, discord_name, 
    role, location, experience_level, army_faction
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'real_name',
    new.raw_user_meta_data->>'commander_name',
    new.raw_user_meta_data->>'discord_name',
    assigned_role,
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'army_faction'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Provision Avatars Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Avatars
CREATE POLICY "Allow public read for avatars" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow users to update own avatars" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
