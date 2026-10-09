-- Round 4 Battlefield Conditions, drawn from events across the round 1-3
-- battle reports. Each applies equally to both players, so neither side gains
-- an advantage. No named characters intervene.
--
-- Round 4 is the current round, so these go live immediately (is_active is set
-- against campaign_state, mirroring the Admin form: the round trigger only
-- fires when the round changes). When the campaign advances to round 5 the
-- trigger retires them automatically. Re-running is harmless: a condition with
-- the same title for the same round is skipped. Edit or deactivate any of them
-- in Admin -> Global Events.

INSERT INTO public.global_events (title, description, rules_text, theatre_name, campaign_month, is_active)
SELECT v.title, v.description, v.rules_text, v.theatre_name, 4,
       (SELECT current_month = 4 FROM public.campaign_state WHERE id = 1)
FROM (VALUES
    (
        'The Veil Thins',
        'Rituals completed across Vespera Prime — beneath the Sump, in the Magma Forges and at the Orbital Relay — have worn reality thin. Soldiers on every side hear things that are not there.',
        'At the start of each battle round, roll one D6. On a 1, warp whispers fill the air: until the end of that battle round, both players subtract 1 from Battle-shock tests.',
        NULL
    ),
    (
        'The Wound in the Sky',
        'The rift torn open above the relay station during the last round has not closed. Something vast presses against it from the other side.',
        'From battle round 3, the objective marker closest to the centre of the battlefield is the Rift. At the end of each player''s turn, roll one D6 for each unit within 3" of the Rift; on a 1, that unit suffers D3 mortal wounds. At the end of the battle, the player who controls the Rift scores 5 VP.',
        'Orbital Relay Station'
    ),
    (
        'The Tomb Stirs',
        'Deep beneath the Sump, ancient tombs are waking, and the ground heaves with them.',
        'At the start of each battle round, roll one D6. On a 1, violent tremors shake the battlefield: until the end of that battle round, subtract 1 from all Advance and Charge rolls (to a minimum of 1).',
        'The Sump Ruins'
    )
) AS v(title, description, rules_text, theatre_name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.global_events g
    WHERE g.title = v.title AND g.campaign_month = 4
);
