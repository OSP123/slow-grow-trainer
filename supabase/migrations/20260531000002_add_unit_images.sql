-- Add image_url to army_units
ALTER TABLE public.army_units ADD COLUMN IF NOT EXISTS image_url text;

-- Create the unit_photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('unit_photos', 'unit_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for unit_photos
-- Allow public read access to all unit photos
CREATE POLICY "Public Read Access for unit_photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'unit_photos');

-- Allow authenticated users to upload their own photos
-- Note: the folder structure will be {profile_id}/{file_name} so we can enforce ownership.
CREATE POLICY "Authenticated users can upload unit photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'unit_photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own photos
CREATE POLICY "Authenticated users can update their own unit photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'unit_photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Authenticated users can delete their own unit photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'unit_photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
