-- Migration: Campaign Narrative Engine

-- 1. Create the campaign_state table
CREATE TABLE IF NOT EXISTS public.campaign_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    current_month INTEGER DEFAULT 1,
    points_limit INTEGER DEFAULT 400,
    votann_resources_secured INTEGER DEFAULT 0,
    global_warp_corruption INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert the singleton row if it doesn't exist
INSERT INTO public.campaign_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2. Create the territories table
CREATE TABLE IF NOT EXISTS public.territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    imperium_control INTEGER DEFAULT 50,
    chaos_corruption INTEGER DEFAULT 50,
    ork_foothold INTEGER DEFAULT 0,
    tau_foothold INTEGER DEFAULT 0,
    aeldari_foothold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed territories
INSERT INTO public.territories (name) VALUES 
('The Hive Spires'),
('The Magma Forges'),
('The Sump Ruins'),
('The Ash Wastes'),
('The Toxic Oceans'),
('Orbital Defense Grid')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.campaign_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on campaign_state" ON public.campaign_state FOR SELECT USING (true);
CREATE POLICY "Enable update for admins on campaign_state" ON public.campaign_state FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Enable read access for all users on territories" ON public.territories FOR SELECT USING (true);
CREATE POLICY "Enable update for admins on territories" ON public.territories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 3. Matchup Processing Logic
-- When a matchup is marked 'completed' or 'verified', process the territory changes
CREATE OR REPLACE FUNCTION public.process_match_outcome()
RETURNS trigger AS $$
DECLARE
    winner_id UUID;
    winner_faction TEXT;
    loser_faction TEXT;
    territory_record RECORD;
BEGIN
    -- Only process when status changes to 'completed' or 'verified' from 'scheduled'
    IF NEW.status IN ('completed', 'verified') AND OLD.status = 'scheduled' AND NEW.game_result IS NOT NULL THEN
        
        -- Determine winner and loser
        IF NEW.game_result = 'p1_win' THEN
            winner_id := NEW.p1_id;
        ELSIF NEW.game_result = 'p2_win' THEN
            winner_id := NEW.p2_id;
        ELSE
            -- It's a draw, no territory change for now
            RETURN NEW;
        END IF;

        -- Get factions
        SELECT army_faction INTO winner_faction FROM public.profiles WHERE id = winner_id;
        SELECT army_faction INTO loser_faction FROM public.profiles WHERE id = CASE WHEN winner_id = NEW.p1_id THEN NEW.p2_id ELSE NEW.p1_id END;

        -- Only proceed if a territory is specified
        IF NEW.theatre_name IS NOT NULL THEN
            
            -- Get the territory record
            SELECT * INTO territory_record FROM public.territories WHERE name = NEW.theatre_name;
            
            IF FOUND THEN
                -- Votann Resource Tracking
                IF winner_faction = 'Leagues of Votann' THEN
                    UPDATE public.campaign_state SET votann_resources_secured = votann_resources_secured + 10 WHERE id = 1;
                    IF NEW.theatre_name IN ('The Magma Forges', 'The Sump Ruins') THEN
                        UPDATE public.campaign_state SET votann_resources_secured = votann_resources_secured + 5 WHERE id = 1; -- Bonus
                    END IF;
                END IF;

                -- Farsight Enclaves vs Chaos Tracking
                IF winner_faction = 'T''au Empire' AND loser_faction IN ('Chaos Space Marines', 'Thousand Sons', 'World Eaters', 'Chaos Daemons', 'Death Guard') THEN
                    -- Note: Assumes FSE is played as Tau, could be more specific
                    UPDATE public.territories SET chaos_corruption = GREATEST(0, chaos_corruption - 5) WHERE name = NEW.theatre_name;
                END IF;

                -- Standard Imperial / Chaos / Xenos logic
                IF winner_faction IN ('Space Marines', 'Astra Militarum', 'Imperial Knights', 'Adeptus Custodes', 'Dark Angels', 'Space Wolves', 'Grey Knights', 'Blood Angels', 'Black Templars') THEN
                    UPDATE public.territories 
                    SET imperium_control = LEAST(100, imperium_control + 5),
                        chaos_corruption = GREATEST(0, chaos_corruption - 2)
                    WHERE name = NEW.theatre_name;
                    
                ELSIF winner_faction IN ('Chaos Space Marines', 'Thousand Sons', 'World Eaters', 'Chaos Daemons', 'Death Guard', 'Emperor''s Children') THEN
                    UPDATE public.territories 
                    SET imperium_control = GREATEST(0, imperium_control - 5),
                        chaos_corruption = LEAST(100, chaos_corruption + 5)
                    WHERE name = NEW.theatre_name;
                    
                ELSIF winner_faction = 'Orks' THEN
                    UPDATE public.territories SET ork_foothold = LEAST(100, ork_foothold + 5) WHERE name = NEW.theatre_name;
                ELSIF winner_faction = 'T''au Empire' THEN
                    UPDATE public.territories SET tau_foothold = LEAST(100, tau_foothold + 5) WHERE name = NEW.theatre_name;
                ELSIF winner_faction IN ('Aeldari', 'Drukhari') THEN
                    UPDATE public.territories SET aeldari_foothold = LEAST(100, aeldari_foothold + 5) WHERE name = NEW.theatre_name;
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_process_match_outcome ON public.matchups;
CREATE TRIGGER trigger_process_match_outcome
AFTER UPDATE ON public.matchups
FOR EACH ROW
EXECUTE FUNCTION public.process_match_outcome();
