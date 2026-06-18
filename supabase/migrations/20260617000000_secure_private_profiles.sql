-- 1. Create the new private_profiles table
CREATE TABLE public.private_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    real_name TEXT,
    discord_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can read their own private profile" ON public.private_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own private profile" ON public.private_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all private profiles" ON public.private_profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      )
    );

-- 4. Migrate existing data
INSERT INTO public.private_profiles (id, email, real_name, discord_name)
SELECT id, email, real_name, discord_name FROM public.profiles;

-- 5. Drop columns from public.profiles
ALTER TABLE public.profiles 
  DROP COLUMN email, 
  DROP COLUMN real_name, 
  DROP COLUMN discord_name;

-- 6. Update the trigger
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
    id, commander_name, role, location, experience_level, army_faction
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'commander_name',
    assigned_role,
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'experience_level',
    new.raw_user_meta_data->>'army_faction'
  );

  INSERT INTO public.private_profiles (
    id, email, real_name, discord_name
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'real_name',
    new.raw_user_meta_data->>'discord_name'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
