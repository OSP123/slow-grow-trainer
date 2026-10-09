-- Credit the deeds described in the round 1-3 battle reports.
--
-- Why this exists:
--   No deeds had been adjudicated, so every war zone sat at its baseline.
--   These 23 awards (31 ledger rows) were drafted from the battle
--   reports and approved by Campaign Command. Each credits what that
--   commander's OWN report describes, regardless of who won. Five were judgment
--   calls where no deed matched exactly: #13, #18, #23, #44, #48.
--
-- The commander is looked up from the matchup by side, so a row can only land
-- on someone who fought in that battle. Re-running is harmless: an identical
-- award already in the ledger is skipped. Every row can still be withdrawn in
-- Admin -> Report Adjudication. Run after 20261009000000_lower_influence_baseline.sql.

INSERT INTO public.campaign_awards (matchup_id, commander_id, deed, metric, territory_name, delta, note)
SELECT v.matchup_id,
       CASE v.side WHEN 'p1' THEN m.p1_id ELSE m.p2_id END,
       v.deed, v.metric, v.territory_name, v.delta,
       'Report #' || v.report_no || ': ' || v.why
FROM (VALUES
    (3, 'b1723579-4188-47b2-882e-f7238efb2926'::uuid, 'p1', 'Completed a dark ritual', 'chaos_corruption', 'The Ash Wastes', 5, 'Beastmen completed the rite tethering the dark gods'),
    (3, 'b1723579-4188-47b2-882e-f7238efb2926'::uuid, 'p1', 'Completed a dark ritual', 'imperium_control', 'The Ash Wastes', -5, 'Beastmen completed the rite tethering the dark gods'),
    (16, 'da403bad-b307-4a9f-8430-2b66620988eb'::uuid, 'p2', 'Purged a corrupted sector', 'chaos_corruption', 'The Ash Wastes', -5, 'Inquisitorial patrol slew every heretic'),
    (6, '7d97c87d-e6ad-46df-a4e2-83f9e4f874e2'::uuid, 'p1', 'Completed a dark ritual', 'chaos_corruption', 'The Sump Ruins', 5, 'Death Guard ritual at the power relay, confirmed by both reports'),
    (6, '7d97c87d-e6ad-46df-a4e2-83f9e4f874e2'::uuid, 'p1', 'Completed a dark ritual', 'imperium_control', 'The Sump Ruins', -5, 'Death Guard ritual at the power relay, confirmed by both reports'),
    (10, '6f1901b4-44c8-4624-a1bc-35d312c391cd'::uuid, 'p2', 'Reinforced Imperial defences', 'imperium_control', 'The Sump Ruins', 5, 'Cadian garrison cleared and held Sump 4'),
    (8, '4eb9ae16-58a5-4ed6-b228-9dfead18b4e2'::uuid, 'p2', 'Established a stealth cadre', 'tau_foothold', 'The Toxic Oceans', 3, 'Held the coolant-works platform'),
    (27, '2c0b0adf-597a-4075-82b0-9a489a2a4b14'::uuid, 'p2', 'Established a stealth cadre', 'tau_foothold', 'The Toxic Oceans', 3, 'Stealth-spotted gunline secured the ridge'),
    (18, '58bdaed1-1a40-4b73-a3d3-4caf1f40b5e6'::uuid, 'p1', 'Despoiled an Imperial holding', 'imperium_control', 'The Hive Spires', -3, 'Hauled the ore and minerals off the Outer Wall'),
    (19, '7c56ee41-29ef-4889-94c1-68ff7442d849'::uuid, 'p1', 'Awakened a tomb complex', 'necron_foothold', 'The Hive Spires', 5, 'Resurrection engines awakened beneath the archive'),
    (19, '7c56ee41-29ef-4889-94c1-68ff7442d849'::uuid, 'p1', 'Awakened a tomb complex', 'necron_foothold', 'The Sump Ruins', 5, 'Resurrection engines awakened beneath the archive'),
    (23, 'b2259a26-eb4e-41eb-8086-a2ca7419acde'::uuid, 'p2', 'Won over the local populace', 'tau_foothold', 'The Hive Spires', 5, 'Seized control of the Hab District'),
    (25, '0e925272-c8b5-4966-aaf9-cb081542dbc1'::uuid, 'p2', 'Purged a corrupted sector', 'chaos_corruption', 'The Hive Spires', -5, 'Closed the Omega rift'),
    (13, 'ab8230a9-046f-4082-b6d5-7bb6d91bc197'::uuid, 'p2', 'Staked a mining claim', 'votann_foothold', 'Orbital Relay Station', 5, 'Held the Docking Pylons landing zone'),
    (14, '0fc92779-af11-4c8c-98de-ccc852a7c492'::uuid, 'p2', 'Reinforced Imperial defences', 'imperium_control', 'Orbital Relay Station', 5, 'Secured the relay station key points'),
    (15, 'd9d8540c-a5f4-422c-8f94-2bb196c10a87'::uuid, 'p2', 'Awakened a tomb complex', 'necron_foothold', 'Orbital Relay Station', 5, 'Tomb World Khoptes awakened'),
    (15, 'd9d8540c-a5f4-422c-8f94-2bb196c10a87'::uuid, 'p2', 'Awakened a tomb complex', 'necron_foothold', 'The Sump Ruins', 5, 'Tomb World Khoptes awakened'),
    (36, '41dbaec9-9bb3-49e3-8f4a-c0b0ea04a50a'::uuid, 'p1', 'Repelled intruders from the crypts', 'necron_foothold', 'Orbital Relay Station', 2, 'Turned on the Cryptek-harvesters'),
    (37, '34b7d235-e950-4c8d-a451-7f778f9daafa'::uuid, 'p2', 'Awakened a tomb complex', 'necron_foothold', 'Orbital Relay Station', 5, 'Awakening of Khoptes continued; Comms Array seized'),
    (37, '34b7d235-e950-4c8d-a451-7f778f9daafa'::uuid, 'p2', 'Awakened a tomb complex', 'necron_foothold', 'The Sump Ruins', 5, 'Awakening of Khoptes continued; Comms Array seized'),
    (41, '660d4082-1f92-4b20-affa-5f1e93f0a8e8'::uuid, 'p2', 'Completed a dark ritual', 'chaos_corruption', 'Orbital Relay Station', 5, 'Bloodshed tore the rift open over the relay'),
    (41, '660d4082-1f92-4b20-affa-5f1e93f0a8e8'::uuid, 'p2', 'Completed a dark ritual', 'imperium_control', 'Orbital Relay Station', -5, 'Bloodshed tore the rift open over the relay'),
    (50, 'c1e01853-554d-4554-9fa0-5e7c2d91b68a'::uuid, 'p1', 'Looted a scrap haul', 'ork_foothold', 'Orbital Relay Station', 5, 'Looted the relic sites and the enemy command post'),
    (29, 'b358fa53-d59c-4844-9d59-2b4c66dbec9e'::uuid, 'p1', 'Reinforced Imperial defences', 'imperium_control', 'The Magma Forges', 5, 'Secured the Extraction Bay'),
    (33, '3afeae32-50ac-48b8-8da5-9d357bf61a90'::uuid, 'p2', 'Completed a dark ritual', 'chaos_corruption', 'The Magma Forges', 5, 'Raised the ancient Dreadnought as a Helbrute'),
    (33, '3afeae32-50ac-48b8-8da5-9d357bf61a90'::uuid, 'p2', 'Completed a dark ritual', 'imperium_control', 'The Magma Forges', -5, 'Raised the ancient Dreadnought as a Helbrute'),
    (39, '9a2ae4c6-0739-4935-9b6e-927d169f8c9f'::uuid, 'p2', 'Purged a corrupted sector', 'chaos_corruption', 'The Magma Forges', -5, 'Dispatched a Red Corsair raiding party'),
    (44, 'ba19792c-e21b-4aa8-9796-87872458ea78'::uuid, 'p2', 'Purged a corrupted sector', 'chaos_corruption', 'The Magma Forges', -5, 'Fell on a Thousand Sons coven'),
    (47, '20c4e3db-d46c-43bc-9cde-97920b01d605'::uuid, 'p2', 'Completed a dark ritual', 'chaos_corruption', 'The Magma Forges', 5, 'Summoned a Keeper of Secrets through the rift'),
    (47, '20c4e3db-d46c-43bc-9cde-97920b01d605'::uuid, 'p2', 'Completed a dark ritual', 'imperium_control', 'The Magma Forges', -5, 'Summoned a Keeper of Secrets through the rift'),
    (48, 'cb2bc392-a55e-4ac6-9222-1d99e679c682'::uuid, 'p2', 'Secured a promethium cache', 'votann_resources', NULL, 10, 'Secured the target assets')
) AS v(report_no, matchup_id, side, deed, metric, territory_name, delta, why)
JOIN public.matchups m ON m.id = v.matchup_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.campaign_awards x
    WHERE x.matchup_id = v.matchup_id
      AND x.commander_id = CASE v.side WHEN 'p1' THEN m.p1_id ELSE m.p2_id END
      AND x.deed = v.deed AND x.metric = v.metric
      AND x.territory_name IS NOT DISTINCT FROM v.territory_name
);
