-- 1. Add discord_name back to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_name TEXT;

-- 2. Migrate existing discord names from private_profiles to profiles
UPDATE public.profiles p
SET discord_name = pp.discord_name
FROM public.private_profiles pp
WHERE p.id = pp.id AND pp.discord_name IS NOT NULL;

-- 3. Update the handle_new_user trigger to save discord_name to profiles
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
    id, commander_name, discord_name, role, location, experience_level, army_faction
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'commander_name',
    new.raw_user_meta_data->>'discord_name',
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
