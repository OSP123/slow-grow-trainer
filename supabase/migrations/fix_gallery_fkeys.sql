-- Migration: fix_gallery_fkeys.sql
-- Fixes foreign keys to point to public.profiles instead of auth.users to allow joining profiles data.

ALTER TABLE public.gallery_comments DROP CONSTRAINT IF EXISTS gallery_comments_user_id_fkey;
ALTER TABLE public.gallery_comments ADD CONSTRAINT gallery_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.gallery_emotes DROP CONSTRAINT IF EXISTS gallery_emotes_user_id_fkey;
ALTER TABLE public.gallery_emotes ADD CONSTRAINT gallery_emotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
