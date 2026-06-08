-- Migration: setup_gallery.sql

-- 1. Create Gallery Comments Table
CREATE TABLE public.gallery_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES public.army_units(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public Read for Gallery Comments" ON public.gallery_comments
    FOR SELECT USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can create their own comments" ON public.gallery_comments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.gallery_comments
    FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 2. Create Gallery Emotes Table
CREATE TABLE public.gallery_emotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES public.army_units(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emote TEXT CHECK (emote IN ('fire', 'skull', 'shield', 'heart', 'star')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(unit_id, user_id, emote) -- Prevent duplicate identical emotes from same user on same photo
);

-- Enable RLS
ALTER TABLE public.gallery_emotes ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public Read for Gallery Emotes" ON public.gallery_emotes
    FOR SELECT USING (true);

-- Allow authenticated users to toggle their own emotes
CREATE POLICY "Users can create their own emotes" ON public.gallery_emotes
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotes" ON public.gallery_emotes
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
