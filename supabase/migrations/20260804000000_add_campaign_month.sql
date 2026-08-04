-- Add campaign_month to matchups to track which phase a matchup belongs to
ALTER TABLE public.matchups 
ADD COLUMN campaign_month INTEGER DEFAULT 1;

-- If you have any existing matchups from Phase 1, they will automatically be set to campaign_month = 1 because of the DEFAULT clause.
