-- Create Game Stores Table
CREATE TABLE public.game_stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Game Stores
ALTER TABLE public.game_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read for Game Stores" ON public.game_stores
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage Game Stores" ON public.game_stores
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Extend profiles with new granular properties
ALTER TABLE public.profiles
ADD COLUMN army_subfaction TEXT,
ADD COLUMN preferred_store_id UUID REFERENCES public.game_stores(id) ON DELETE SET NULL;

-- Overwrite Auth Trigger mapping new variables securely into Profile instantiations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
  store_id UUID;
BEGIN
  IF new.email = 'omarpatel123@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'user';
  END IF;

  -- Attempt precise Postgres UUID parsing, else fallback null gracefully
  BEGIN
    store_id := (new.raw_user_meta_data->>'preferred_store_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    store_id := NULL;
  END;

  INSERT INTO public.profiles (
    id, email, real_name, commander_name, discord_name, 
    role, location, experience_level, army_faction,
    army_subfaction, preferred_store_id
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
    new.raw_user_meta_data->>'army_faction',
    new.raw_user_meta_data->>'army_subfaction',
    store_id
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
