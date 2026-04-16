-- Extend matchups with Command Temperament and Rules of Engagement
ALTER TABLE public.matchups
ADD COLUMN p1_temperament INTEGER CHECK (p1_temperament >= 1 AND p1_temperament <= 5),
ADD COLUMN p2_temperament INTEGER CHECK (p2_temperament >= 1 AND p2_temperament <= 5),
ADD COLUMN p1_rules_engagement INTEGER CHECK (p1_rules_engagement >= 1 AND p1_rules_engagement <= 5),
ADD COLUMN p2_rules_engagement INTEGER CHECK (p2_rules_engagement >= 1 AND p2_rules_engagement <= 5);
