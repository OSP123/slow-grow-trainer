-- Remove old warlord milestones from pending state
DELETE FROM public.hobby_milestones WHERE milestone_step IN ('Warlord Built', 'Warlord Painted');

-- Update the handle_new_user trigger to insert a Warlord automatically
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

  -- Add a default Warlord to the Army Roster for momentum
  INSERT INTO public.army_units (
    profile_id, unit_name, faction, built, painted, played, model_count
  )
  VALUES (
    new.id,
    'Warlord',
    new.raw_user_meta_data->>'army_faction',
    false,
    false,
    false,
    1
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed Warlords for existing profiles
INSERT INTO public.army_units (
  profile_id, unit_name, faction, built, painted, played, model_count
)
SELECT 
  p.id, 
  'Warlord', 
  p.army_faction, 
  false, 
  false, 
  false, 
  1
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.army_units au 
  WHERE au.profile_id = p.id AND au.unit_name = 'Warlord'
);
