-- 1. Create Hobby Milestones Table
CREATE TABLE public.hobby_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mega_faction TEXT NOT NULL,
    points_threshold INTEGER NOT NULL,
    status TEXT DEFAULT 'pending'::text,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for milestones
ALTER TABLE public.hobby_milestones ENABLE ROW LEVEL SECURITY;

-- Users can read everyone's milestones (gallery features)
CREATE POLICY "Public Read for Milestones" ON public.hobby_milestones
    FOR SELECT USING (true);

-- Users can only create their own milestones
CREATE POLICY "Users can create their own milestones" ON public.hobby_milestones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestones
CREATE POLICY "Users can update their own milestones" ON public.hobby_milestones
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Create Campaign Voting Table
CREATE TABLE public.campaign_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nominee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('best_painted', 'best_conversion', 'best_lore', 'best_sportsmanship')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(voter_id, nominee_id, category) -- Prevent spamming the same vote
);

-- Enable RLS for voting
ALTER TABLE public.campaign_votes ENABLE ROW LEVEL SECURITY;

-- Secret voting (users can only see their own votes)
CREATE POLICY "Users can read their own votes" ON public.campaign_votes
    FOR SELECT USING (auth.uid() = voter_id);

CREATE POLICY "Users can cast votes" ON public.campaign_votes
    FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- 3. Set up Storage Bucket for Hobby Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hobby_photos', 'hobby_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow public read for hobby photos" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'hobby_photos');

CREATE POLICY "Allow authenticated uploads to hobby photos" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hobby_photos');
-- 1. Create Public Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    real_name TEXT,
    commander_name TEXT,
    discord_name TEXT,
    role TEXT DEFAULT 'user'::text CHECK (role IN ('user', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
      )
    );

-- 2. Auth Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Automatically designate omarpatel123@gmail.com as the root administrator
  IF new.email = 'omarpatel123@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, email, real_name, commander_name, discord_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'real_name',
    new.raw_user_meta_data->>'commander_name',
    new.raw_user_meta_data->>'discord_name',
    assigned_role
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Bind Trigger to Auth.Users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Admin Database Bypass Policies
-- Campaign Votes
CREATE POLICY "Admins have global access to campaign_votes" ON public.campaign_votes
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Hobby Milestones
CREATE POLICY "Admins have global access to hobby_milestones" ON public.hobby_milestones
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
-- Update profiles RLS policy to allow authenticated users to resolve commander names visually
CREATE POLICY "Allow authenticated users to read all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
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
CREATE TABLE public.matchups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    p1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    p2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    p1_score INTEGER,
    p2_score INTEGER,
    game_result TEXT CHECK (game_result IN ('p1_win', 'p2_win', 'draw')),
    p1_lore TEXT,
    p2_lore TEXT,
    status TEXT DEFAULT 'scheduled'::text CHECK (status IN ('scheduled', 'completed', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS enablement
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

-- Anyone can read completed/scheduled matchups
CREATE POLICY "Public Read for Matchups" ON public.matchups
    FOR SELECT USING (true);

-- Only Admins can explicitly Create (schedule) matchups
CREATE POLICY "Admins can insert matchups" ON public.matchups
    FOR INSERT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Participants can Update their specific matchups (Log score/lore)
CREATE POLICY "Participants can update their matchups" ON public.matchups
    FOR UPDATE USING (
      auth.uid() = p1_id OR auth.uid() = p2_id OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE TABLE public.war_efforts (
    mega_faction TEXT PRIMARY KEY CHECK (mega_faction IN ('imperium', 'chaos', 'xenos')),
    score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.war_efforts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active scores
CREATE POLICY "Public Read for War Efforts" ON public.war_efforts
    FOR SELECT USING (true);

-- Only admins can mutate the overall war effort totals
CREATE POLICY "Admins can update war efforts" ON public.war_efforts
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Seed initial Campaign Totals
INSERT INTO public.war_efforts (mega_faction, score) VALUES 
('imperium', 0),
('chaos', 0),
('xenos', 0);
