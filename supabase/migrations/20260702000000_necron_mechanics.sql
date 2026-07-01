-- Migration: Add Necrons, Tyranids, and Genestealer Cults territory mechanics

ALTER TABLE public.territories ADD COLUMN IF NOT EXISTS necron_foothold INTEGER DEFAULT 0;
ALTER TABLE public.territories ADD COLUMN IF NOT EXISTS tyranid_foothold INTEGER DEFAULT 0;
ALTER TABLE public.territories ADD COLUMN IF NOT EXISTS genestealer_foothold INTEGER DEFAULT 0;

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
                ELSIF winner_faction = 'Necrons' THEN
                    UPDATE public.territories SET necron_foothold = LEAST(100, necron_foothold + 5) WHERE name IN (NEW.theatre_name, 'The Sump Ruins');
                ELSIF winner_faction = 'Tyranids' THEN
                    UPDATE public.territories SET tyranid_foothold = LEAST(100, tyranid_foothold + 5) WHERE name = NEW.theatre_name;
                ELSIF winner_faction = 'Genestealer Cults' THEN
                    UPDATE public.territories SET genestealer_foothold = LEAST(100, genestealer_foothold + 5) WHERE name = NEW.theatre_name;
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
