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
