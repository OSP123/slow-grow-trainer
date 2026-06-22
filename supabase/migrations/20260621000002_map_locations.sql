-- Create map_locations table
CREATE TABLE IF NOT EXISTS public.map_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theatre_name TEXT NOT NULL,
  name TEXT NOT NULL,
  x_pos FLOAT NOT NULL,
  y_pos FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deployed_location_id UUID REFERENCES public.map_locations(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Map locations are viewable by everyone" ON public.map_locations FOR SELECT USING (true);

-- Allow all operations for admins (based on profiles role)
CREATE POLICY "Admins can manage map locations" ON public.map_locations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
