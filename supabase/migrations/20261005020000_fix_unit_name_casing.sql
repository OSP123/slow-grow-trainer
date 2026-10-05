-- Correct unit names the registry's title-case rule mangled (e.g. 'Tx42 Piranha',
-- 'Aun’va'). Case-only changes: ArmyRoster matches names case-insensitively,
-- so saved rosters keep resolving. Same list as NAME_FIXES in
-- scripts/import_mfm_legends.mjs, which now applies it to future imports.

UPDATE public.unit_points u
   SET unit_name = f.fixed
  FROM (VALUES
    ('‘iron Hand’ Straken', '‘Iron Hand’ Straken'),
    ('Tx42 Piranha', 'TX42 Piranha'),
    ('Xv9 Hazard Battlesuits', 'XV9 Hazard Battlesuits'),
    ('Aun’shi', 'Aun’Shi'),
    ('Aun’va', 'Aun’Va'),
    ('Shas’o R’alai', 'Shas’O R’alai'),
    ('Brother-captain Stern', 'Brother-Captain Stern'),
    ('Lion El’jonson', 'Lion El’Jonson'),
    ('Ax-1-0 Tiger Shark', 'AX-1-0 Tiger Shark')
  ) AS f(wrong, fixed)
 WHERE u.unit_name = f.wrong
   AND NOT EXISTS (
       SELECT 1 FROM public.unit_points d WHERE d.faction = u.faction AND d.unit_name = f.fixed
   );
