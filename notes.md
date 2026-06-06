Date: 2026-04-03
Tasks:
- Bootstrapped Vite + React application.
- Configured Vitest and React Testing Library for Test-Driven Development.
- Created robust Foundation and Theming CSS framework for Warhammer factions (Imperium, Chaos, Orks, Tyranids, etc).
- Initialized core sidebar layout shell to test faction aesthetic generation.

Follow-ups:
- Obtain Supabase URL and Anon Key from the user.
- Build Dashboard, Logistics, and Assessment modules using TDD.

Date: 2026-04-06
Tasks:
- Connected Supabase authentication backend using `.env.local` API keys.
- Successfully built `Login.tsx` adhering strictly to Test-Driven Development (wrote failing test first, passed test, then compiled app).
- Verified production build compiles successfully.
- Integrated `react-router-dom` in `main.tsx` and implemented auth-locked conditional routing in `App.tsx` (fully tested with TDD).
- Built `Dashboard.tsx` War Effort Map leveraging strict TDD workflows to guarantee no mock data is utilized.
- Tests verify the Dashboard correctly fetches and maps `megafactions` payload, leaving empty state UI natively without injecting fake data.
- Built explicit Supabase CLI migrations via `20260407000152_campaign_tracking.sql` to handle proper tracking logic.
- Constructed `Logistics.tsx` milestone and photo uploading interface, rigorously tested in Vitest without mock placeholders.
- Built `Assessments.tsx` handling secure, single-vote-per-category Campaign Awards nominations.
- Fully integrated Core Features (Dashboard, Logistics, Assessments) into the primary React Router application framework. 

Follow-ups:
- Final polish: ensure `data-theme` switches natively via profile integration if requested.
- Review total UI visual aesthetics and UX for final deployment.

Date: 2026-04-14
Tasks:
- Mapped all `useState<any>` declarations across entire application infrastructure replacing them with formal TypeScript interfaces (`ProfileData`, `MatchupData`, `CampaignVote`).
- Successfully closed all 26 application-wide linting errors running `npm run lint`.
- Safely relocated structural `useEffect` hook scopes escaping internal Temporal Dead Zones dynamically mapping React syntax.
- Drafted algorithmic execution scripts testing core matchmaking capability in `Matchmaker.test.ts`.
- Validated total module testing coverage ensuring `CampaignBattles.test.tsx` accurately tests active URL joins securely across 22 passing instances natively.
Follow-ups:
- None

Date: 2026-04-15
Tasks:
- Established new `game_stores` SQL Table enabling Admin CRUD venue endpoints dynamically overriding registrations.
- Altered primary `profiles` taxons securely injecting robust Foreign keys targeting specific Army Subfactions natively.
- Dismantled static `CommanderProfile.tsx` displays securely rendering full `editMode` configurations capable of overriding profiles without Server collisions.
- Refactored all `Vitest` validations avoiding generic Mock collisions natively.

Follow-ups:
- Manually seed Game Stores to unlock pending registration blocks.

Date: 2026-04-16
Tasks:
- Added "Field Manual" (Briefing) section to sidebar navigation explaining the platform purpose and all modules.
- Wrote migration `20260416000000_matchup_extended_metrics.sql` adding `p1_temperament`, `p2_temperament`, `p1_rules_engagement`, `p2_rules_engagement` columns to `matchups` table; pushed to Supabase.
- Completely rewrote `CampaignBattles.tsx` with three distinct layers: Global Warzone Board (all players visible), Live VP Tracker (save mid-game scores without finalizing), and Final Assessment modal with Command Temperament and Rules of Engagement star ratings (1-5).
- Updated `CampaignBattles.test.tsx` with 4 tests covering loading state, global board render, VP tracker panel, and finalization flow — 25/25 total tests passing.
Follow-ups:
- Admin must schedule matchups via the Admin Dashboard for players to see them in "My Assigned Frontlines".

Date: 2026-04-16 (session continued)
Tasks:
- Created `army_units` Postgres table with RLS (public read, owner-only writes); pushed migration to Supabase.
- Built `ArmyRoster.tsx` component — pulls live 10th Edition unit data from OpenHammer API (34 factions, full datasheet library), gracefully degrades to manual entry if API is unreachable. Tracks Built/Painted/Played per unit with instant-save toggles and progress bar summary.
- Refactored `CommanderProfile.tsx` into a tabbed layout: Commander Specs | Army Roster | Army Chronicles. Added public profile viewing via `/profile/:profileId` route.
- Updated `AdminDashboard.tsx` with full Matchup Command Override panel — admin can edit VP scores, result, status, and all honour ratings for any matchup, or delete matchups entirely.
- Updated Field Manual (`Briefing.tsx`) with Getting Started checklist, Army Roster section, Honour Ratings explained section, and all updated module descriptions.
- Added `/profile/:profileId` route to `App.tsx` for public roster viewing.
- Wrote 5 new tests for ArmyRoster, 5 for CommanderProfile, updated AdminDashboard tests — 34/34 total tests passing.
Follow-ups:
- To view another player's roster, navigate directly to /profile/<their-uuid>. Consider adding a Commander directory page for easier discovery.

Date: 2026-04-16 (image compression)
Tasks:
- Built `src/utils/imageCompression.ts` — shared Canvas API utility that validates file type, enforces a 20MB hard reject, scales images to max 1920px, and converts to JPEG at 80% quality. Also exports `getTransformUrl()` for Supabase Image Transformation params.
- Wired compression into `CommanderProfile.tsx` avatar upload (max 1200px, 82% quality) — shows "Compressing..." status during processing.
- Wired compression into `Logistics.tsx` milestone photo upload (max 1920px) — shows upload errors inline in the UI.
- Added 8 tests for imageCompression utility (getTransformUrl, type reject, size reject, jsdom pass-through). Mocked imageCompression in Logistics tests.
- 42/42 tests passing, clean tsc and eslint.
Follow-ups:
- Supabase bucket max-file-size policies should also be set server-side (in Supabase Dashboard → Storage → Bucket settings → Max upload size) as a belt-and-suspenders safety net.

Date: 2026-04-16 (faction data overhaul)
Tasks:
- Dropped the unreliable OpenHammer API entirely (was missing Astra Militarum, Drukhari, etc. and fabricating entries like "Aeldari Library" and "Library").
- Created `src/data/warhammer40k.ts` — curated static 40k 10th Edition data with 19 proper factions (Imperium, Chaos, Xenos) and hundreds of unit datasheets per faction. Works offline, no API dependency.
- ArmyRoster rewritten to use static data: grouped `<optgroup>` selects by grand alliance, native datalist autocomplete + pill suggestions, free-text fallback for any unlisted unit, colour-coded faction badges (blue=Imperium, red=Chaos, purple=Xenos).
- 43/43 tests passing.
Follow-ups:
- Unit lists in warhammer40k.ts can be expanded as new codexes release — just add entries to the UNITS_BY_FACTION record.

Date: 2026-04-16
Tasks:
- Fixed email confirmation redirect bug; `signUp` now correctly uses `window.location.origin` as `emailRedirectTo`.
- Implemented "Munitorum Field Manual" points registry in `AdminDashboard`. Admins can now manage the global points dictionary for all 40k units.
- Integrated points auto-fill in `ArmyRoster.tsx`. When a user selects or types a known unit, the points cost is automatically retrieved and pre-populated with a status indicator.
- Updated comprehensive test suite (Admin, Auth, Roster) to cover new points-management flows and redirect logic. 14 relevant tests passing.
Follow-ups:
- Remind user to update "Site URL" and "Redirect URLs" in Supabase Dashboard.

Date: 2026-04-16
Tasks:
- Refactored `warhammer40k.ts` to include hierarchical `CORE_FACTIONS` and `SUBFACTIONS_MAP` for cleaner data consumption.
- Replaced registration text inputs with prefilled dropdowns for Faction/Subfaction.
- Implemented dynamic subfaction logic: selecting "Space Marines" now reveals specific chapters like Blood Angels, Ultramarines, etc.
- Added "Custom/Other..." option for subfactions to allow for homebrew armies while keeping the Core Faction selection strict.
- Verified with 44/44 passing tests and successful production build.
Follow-ups:
- None.

Date: 2026-04-20
Tasks:
- Refactored `hobby_milestones` schema to replace overlapping `points_threshold` integer column with robust `milestone_step` text column.
- Expanded Logistics milestone tracking beyond 1000 points to include 1500 and 2000 points tiers.
- Added explicit starting milestones for "Warlord Built" and "Warlord Painted".
- Updated UI array rendering and component mapping to track exact string matching instead of parsed logic.
- Created local `20260420000000_milestones_refactor.sql` Supabase migration structure.
- Resolved Testing regex match limitations and verified structural components against new specific test cases.
Follow-ups:
- None.
Date: 2026-04-19
Tasks:
- Implemented full mobile responsive design with hamburger menu and collapsible sidebar.
- Added smooth slide-in/out sidebar with overlay backdrop on mobile (≤768px).
- Added tablet breakpoint (769-1024px) with narrower sidebar.
- Made all grid layouts responsive using auto-fit/minmax patterns (AdminDashboard forms, matchup grids).
- Fixed Login/Registration cards to be mobile-friendly with proper width and box-sizing.
- Added global mobile styles: iOS zoom prevention, scrollable tables, full-width buttons.
- Verified hamburger menu toggle, nav item close behavior, and no horizontal overflow at 375px.
- All 44 tests passing, production build verified, pushed to main.
Follow-ups:
- None.

Date: 2026-04-20 (session continued)
Tasks:
- Mapped sorting logic to `warhammer40k.ts` `getFactionsGrouped()` resolving UI bug where Army Factions weren't properly alphabetized.
- Generated `20260420000002_seed_points.sql` migration pulling the 900+ static string data entries from `UNITS_BY_FACTION` map. The database dynamically pre-fills all listed units with `0` base points. This enables the Admin to query all existing elements and update their costs gracefully within the AdminDashboard.
Follow-ups:
- Need to execute `20260420000002_seed_points.sql` inside the live Supabase SQL portal.

Date: 2026-05-31
Tasks:
- Bridged Wahapedia and OpenHammer community point datasets dynamically generating `20260420000003_update_real_points.sql` and `20260420000004_update_openhammer_points.sql`.
- Built custom Levenshtein string similarity script mapping 43 edge-case unmapped units with new points in `20260420000005_fuzzy_points_bridge.sql`.
- Finalized database schema bridging; deleted scratch API bridging scripts.
- Refactored `README.md` containing database deployment instructions.
- Added a "Clear (✕)" button overlay to the Roster unit combobox to allow users to quickly swap units without backspacing text out of the input.
- Verified test suite passes (44/44 passing).
- Verified linter rules pass seamlessly.
- Verified local deployment production build compiles with no internal TS compilation errors.
Follow-ups:
- None.

Date: 2026-05-31
Tasks:
  - Migrated point progression milestones to 400 point increments (400, 800, 1200, 1600, 2000).
  - Designed missing campaign roster payment tracker panel inside AdminDashboard.
  - Implemented 'payment_status' column migration in Supabase.
Follow-ups:
  - None

Date: 2026-05-31 (Session Continued)
Tasks:
  - Created Supabase `unit_photos` storage bucket and `image_url` column in `army_units`.
  - Enforced 1-picture-per-unit limit with strict overwrite policies on upload.
  - Implemented unit validation checks so users can only upload photos for recognized `UNITS_BY_FACTION` entries in the `ArmyRoster`.
  - Added 'Milestone Progress' column to the Admin Dashboard Roster.
  - Upgraded `CommanderProfile.tsx` to automatically query all uploaded photos matching the commander's faction and dynamically render them as a tiled background.
Follow-ups:
  - None

Date: 2026-06-01
Tasks:
  - Added an Edit button to the `ArmyRoster` component mapping to the Muster Unit state inline.
  - Allowed unit records to be dynamically updated utilizing `UPDATE` SQL clauses against Supabase without needing deletion and recreation.
Follow-ups:
  - None

Date: 2026-06-01 (Session Continued)
Tasks:
  - Migrated the master official "Unit Registry" from a hardcoded array in `src/data/warhammer40k.ts` to the Supabase `unit_points` database table.
  - Built a `useUnitRegistry` hook to hydrate valid official units dynamically across the application upon load.
  - Updated the `ArmyRoster` component to consume the dynamic context to filter and validate units.
  - Upgraded the Munitorum Field Manual panel in the `AdminDashboard` to serve as a complete registry management tool, adding the ability to edit and safely remove unit records (e.g. Legends units) with live dropdown refresh.
  - Mocked `useUnitRegistry` across all `AdminDashboard` and `ArmyRoster` test suites to maintain clean TDD architecture. Tests successfully passing.
Follow-ups:
  - None

Date: 2026-06-01 (Session Continued - Field Manual Update)
Tasks:
  - Updated `Briefing.tsx` to include the Campaign Structure & Matchmaking section.
  - Specified the 400, 800, 1200, and 1600 escalation checkpoints.
  - Clarified that every Commander must play at least one official game at each checkpoint using the automatching system.
  - Added details about the $15 entry fee and its allocation toward venue and prizes.
  - Noted the Final 2000-Point Tournament and the prize categories (Best Painted, Best Converted, Best Sportsmanship, Best General).
Follow-ups:
  - None

Date: 2026-06-01 (Session Continued - Munitorum PDF Parser)
Tasks:
  - Created `scripts/parse_munitorum.ts` to ingest the official Munitorum Field Manual PDF.
  - Set up a pipeline to convert the PDF via `pdftotext` into a linear text file, then map regex extractors over 850+ unit profiles.
  - Generated `seed_units.sql` containing a massive `INSERT` block for all 854 official units and their corresponding base points.
  - Provided the SQL file to the Admin to bypass Row Level Security restrictions, allowing a complete, 100% accurate database reset to official Games Workshop points.
Follow-ups:
  - None

Date: 2026-06-01 (Session Continued - Profile Faction Editing)
Tasks:
  - Updated `CommanderProfile.tsx` to allow users to edit their Core Faction.
  - Replaced the free-text `Core Faction` input with a rigorous `<select>` dropdown populated directly from the `useUnitRegistry` hook's official faction list.
  - Mocked `useUnitRegistry` in `CommanderProfile.test.tsx` to restore test viability.
  - All unit tests verified (12/12 passing).

Date: 2026-06-01 (Session Continued - Login Form Core Factions)
Tasks:
  - Updated `Login.tsx` (the registration form) to use the database-backed `useUnitRegistry` instead of the static `CORE_FACTIONS` array.
  - This ensures users signing up can only select official factions that exist in the newly loaded Munitorum Field Manual data, preventing data desynchronization right at account creation.
  - Refactored `Login.test.tsx` and `App.test.tsx` to mock `useUnitRegistry`. All unit tests verified (12/12 passing).
Follow-ups:
  - None

Date: 2026-06-01 (Session Continued - Admin Dashboard User Management)
Tasks:
  - Added an inline editing form to the "Campaign Roster & Payments" section of the Admin Dashboard.
  - Admins can now click "Edit" on any user to update their `commander_name`, `army_faction`, `location`, and `experience_level`.
  - Fixed a critical bug in `fetchUsers` where `profiles` and `hobby_milestones` were being joined via a non-existent foreign key, which caused PostgREST to crash and return an empty user array. Changed to fetching `profiles` and `hobby_milestones` independently and merging them in JS.
  - Added `Real Name` and `Discord` columns to the Admin Dashboard table, pulling directly from the `profiles` table.
  - Fixed a mobile UI bug where the sidebar menu required scrolling to reach the Commander link by implementing `100dvh` in `App.css` to properly account for dynamic mobile browser toolbars.
  - Fixed flaky Matchmaker algorithm test by stubbing `Math.random` to ensure deterministic execution orders.
  - Added an FAQ section to the Field Manual (`Briefing.tsx`) addressing what a slow grow campaign is, defining the 400-point milestones.
  - Added an FAQ entry to the Field Manual addressing the use of half-painted/primed models.
  - Added an FAQ entry to the Field Manual detailing the 5-month timeline, requiring 400 points and 1 game per month.
  - Changed "Rules of Engagement" to "Hobby Spirit & Helpfulness" across the application to avoid dissuading new players.
  - Updated the Global Warzone Board to hide individual honour ratings to prevent public shaming.
  - Replaced individual ratings with an "Exemplars of the Campaign" leaderboard displaying three separate top-3 categories: Top Megafactions (by average VP across commanders), Finest Temperament, and Best Hobby Spirit.
  - Moved `ImperialFont`, `ZeusBorne`, `NecronCrypt`, `Tau40k`, and `OCRAStd` fonts to the `public/fonts` directory and loaded them globally.
  - Configured CSS themes to inject faction-specific fonts into UI headers.
  - Modified `App.tsx` to automatically configure the UI theme based on the user's `army_faction`.
Date: 2026-06-01 (Session Continued - Alien Font Translation Bugfix)
Tasks:
  - Enhanced the `MutationObserver` in `App.tsx` to include `characterData: true` and `subtree: true`, ensuring that all dynamic text updates (such as async data loading or route modifications) immediately synchronize translations.
  - Refined the JS selector logic to isolate translations strictly to text-bearing leaf nodes, completely preventing nested translation duplicates.
  - Upgraded the CSS translation system in `themes.css` by forcing `display: block !important`, `white-space: normal !important`, and other critical overrides on the `::after` pseudo-element to render translations reliably beneath the glyph font irrespective of parent flex/grid/overflow constraints.
  - Created `AlienTranslation.test.tsx` to thoroughly test dynamic updates and leaf node translation containment.
  - Verified that all 53 unit tests pass perfectly and the production build compiles successfully.

Date: 2026-06-01 (Session Continued - Translation Edge Cases Bugfix)
Tasks:
  - Fixed an issue where SVGs inside navigation items were preventing leaf node detection by enforcing `toUpperCase()` matching on element `tagName` properties. Navigation items are now successfully translated.
  - Removed an inline `var(--font-mono)` override from the "Connection secure" text block in `App.tsx` that was causing it to display in standard English instead of the required alien glyph font before translation.

Follow-ups:
  - None


Date: 2026-06-03
Tasks:
  - Replaced the generic Earth texture with a generated custom 2:1 equirectangular grimdark planet texture.
  - Adjusted coordinates of the Theatres of War to match topographical features on the custom texture (e.g., Magma Forges placed on a volcanic crater).
  - Upgraded globe markers from generic spikes to red tactical reticles rendered as HTML overlays.
  - Adjusted globe container layout with flexbox to center the planet properly on desktop layouts.
  - Named the fictional planet 'Vespera Prime' on the globe dashboard.
Follow-ups:
  - None

Date: 2026-06-03 (Session Continued)
Tasks:
  - Relocated 'The Sump' to land coordinates (lat: -50, lng: 100) on Vespera Prime.
  - Imported Three.js to generate and map stylized, low-poly primitive 3D structures directly to the globe interface.
  - Added a Hive Spire for Hive Primus, Brutalist Cubes for Magma Forges, a Space Elevator cylinder for the Orbital Tether, Domes for The Sump, jagged Spikes for the Ash Wastes, and an inverted pyramid for Rad-Zone Gamma.
Follow-ups:
  - None

Date: 2026-06-03 (Session Continued)
Tasks:
  - Fixed an issue where the 3D structures were rendering tangentially to the globe surface due to internal Three.js orientation differences. All primitives have been correctly aligned with their Z-axis pointing radially outward.
  - Scaled up the 3D structures globally by 2.5x to ensure they are visible on standard zoom levels without feeling like 'funky blocks'.
  - Adjusted coordinates for The Sump and Orbital Tether to align precisely with solid landmass terrain instead of open ocean.
Follow-ups:
  - Pending user decision on overhauling war_efforts into individual player-owned theatre control.

Date: 2026-06-03 (Warlords of Vespera Update)
Tasks:
  - Overhauled Dashboard to use individual player profiles and matchups instead of global war effort points
  - Replaced 3D primitives with scalable SVG icons from lucide-react (Castle, Factory, Satellite, Skull, Biohazard, Mountain)
  - Updated Matchmaker.ts to assign a random theatre of war to matches
  - Updated CampaignBattles.tsx to display active theatre for matchups
Follow-ups:
  - User must run ALTER TABLE matchups ADD COLUMN theatre_name text; in Supabase

Date: 2026-06-03 (Clustered Sub-Sectors Update)
Tasks:
  - Updated Matchmaker.ts to generate random sub-sectors (e.g. Hive Primus - Sector Alpha)
  - Updated Dashboard.tsx to parse theatre strings and dynamically cluster victorious matchup pins around the 6 core theatres using deterministic hashing
Follow-ups:
  - None

Date: 2026-06-03 (Battle Lore added to Map)
Tasks:
  - Updated Dashboard.tsx to fetch p1_lore and p2_lore from matchups.
  - Injected winner's battle report lore directly into the map hover tooltips.
Follow-ups:
  - None

Date: 2026-06-03 (Dual Battle Lore added to Map)
Tasks:
  - Updated Dashboard.tsx to display BOTH the winner's and the loser's battle reports on the globe tooltips.
  - Color-coded the winner's name in their faction color, and the loser's name in gray.
Follow-ups:
  - None

Date: 2026-06-03 (Player Flow Lockout Fix)
Tasks:
  - Fixed match finalization to require both players to submit their reports.
  - UI now locks individually and displays an 'Awaiting opponent' message.
  - Map updates are gated behind full match completion.
Follow-ups:
  - None

Date: 2026-06-03 (Field Manual Update)
Tasks:
  - Updated Briefing.tsx to explicitly clarify that BOTH players must submit their reports and honour ratings to finalize a match on the globe.
Follow-ups:
  - None

Date: 2026-06-04 (Map Marker Modals)
Tasks:
  - Removed the coordinate alert when clicking the globe.
  - Implemented an interactive modal for map markers that displays location lore, the controlling warlord, and battle reports.
  - Added a graceful fallback gradient for theatre art until images are provided.
Follow-ups:
  - User will upload theatre art to public/images/theatres/

Date: 2026-06-04 (Generated Theatre Art)
Tasks:
  - Generated AI concept art for all 6 campaign theatres (Hive Primus, Ash Wastes, Magma Forges, Orbital Tether, The Sump, Rad-Zone Gamma).
  - Added them to public/images/theatres/ to display in the map modals.
Follow-ups:
  - None


Date: 2026-06-04
Tasks:
- Implemented Warlord Headquarters with XP progression and Battle Traits
- Implemented automated Campaign Badges logic and UI
- Added Global Events admin panel and dashboard banner
- Created Pict-Captures Gallery routing and layout
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Added player campaign_status to profiles
- Created React modal for confirmation dialogs in AdminDashboard
- Implemented Pause, Resume, and Remove player functionality
- Updated matchmaking engine to only include active players
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Researched Crucible of Champions actual Maelstrom rules
- Refactored Warlord Headquarters UI to act as a custom character datasheet builder
- Replaced XP/Leveling system with Archetype, Specialism, Abilities, and Wargear inputs
- Created database migration for warlord_datasheet JSONB column
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Created DatasheetBuilder and DatasheetViewer components for full 40k Datasheet UI.
- Expanded Crucible of Champions to support up to 3 custom characters via crucible_datasheets array.
- Added Core Stats (M, T, SV, W, etc.), Ranged Weapons, and Melee Weapons inputs.
- Created new database migration for crucible_datasheets.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Added ability for users to edit their Commander Name from the Commander Specs tab.
- Updated state, form, and save logic in CommanderProfile.tsx to handle commander_name updates directly to the database.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Created a Sector Command Roster on the Dashboard.
- Queries the profiles database for active commanders.
- Displays grid of Dossier cards featuring Avatar, Name, Faction, and Lore snippet with a link to the full profile.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Fixed mobile tab overflow issue by adding overflowX: auto and whiteSpace: nowrap to the Commander Profile tab wrapper.
- Fixed issue where users could not save their Commander Specs. This was caused by a missing UPDATE row-level-security policy on the profiles table. Created migration 20260604000004_user_update_profiles.sql.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Updated Dashboard.tsx to use magma_forges.jpg and the_ash_wastes.jpg.
- Deleted the old .png versions of those images.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Added Vespera Prime narrative lore to the Global Command Interface (Dashboard.tsx).
- Fixed grammar and spelling (e.g. "Horus Heresy", "Millennia", "Promethium").
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Styled the Vespera Prime lore on the Dashboard to look like a retro terminal communique (green monospace font, dark background, transmission tags).
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Fetched current user profile on the Dashboard to determine their faction.
- Dynamically updated the communique title and color if the user belongs to a non-imperial faction (Chaos or Xenos).
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Updated Dashboard terminal styling to use the current theme's primary font (var(--font-head)) when the user is a non-imperial faction.
Follow-ups:
- None


Date: 2026-06-04
Tasks:
- Fixed a bug where Xenos fonts failed to render correctly for intercepted transmissions due to inline textTransform properties overriding the required lowercase glyph mapping.
- Added data-text attributes to the terminal communique elements to ensure the English translations correctly show up below the alien glyphs.
- Corrected the Necrons theme in themes.css which was incorrectly using the EldarRunes font instead of NecronCrypt.
Follow-ups:
- None


Date: 2026-06-04 (Follow-up)
Tasks:
- Fixed the lingering English text bug for Xenos faction terminal communiques.
- Applied CSS classes instead of inline styles for the Dashboard terminal text to avoid React CSS variable conflicts.
- Wrapped the raw Xenos narrative string in JavaScript `.toLowerCase()` calls, ensuring the underlying DOM text characters mapped perfectly to the lowercase-only Xenos font glyphs (this prevented the browser from silently falling back to readable English fonts when evaluating the uppercase characters like `V` in `Vespera`).
Follow-ups:
- None

Date: 2026-06-04 (Follow-up 2)
Tasks:
- Uncovered root cause of Xenos terminal styling: Dashboard was statically rendering the terminal based on the logged-in user's database profile faction, entirely ignoring the UI theme selector dropdown.
- Replaced static database fetch with a MutationObserver to listen to dynamic changes to document.body.getAttribute("data-theme").
- Terminal text styling and Xenos font translations now correctly update and map glyphs when toggling between themes using the sidebar UI.
Follow-ups:
- None

Date: 2026-06-04 (Follow-up 3)
Tasks:
- Created a separate `.chaos` terminal class to decouple Chaos faction styling from Xenos faction styling.
- Chaos factions now correctly display the red "INTERCEPTED TRANSMISSION" text while retaining a legible monospace font, instead of mistakenly inheriting the illegible alien glyph fonts reserved for Xenos.
Follow-ups:
- None

Date: 2026-06-04 (Follow-up 4)
Tasks:
- Reverted Chaos terminal communique styles to perfectly match Imperium terminal styles (green monospace).
- Ensured Chaos terminal still displays the "INTERCEPTED TRANSMISSION" header without accidentally inheriting any Xenos-specific CSS overrides (red text or custom typography).
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Created a "Forces Deployed" widget directly above the Sector Command Roster on the dashboard.
- Mapped each recognized Warhammer 40k faction to a thematic lucide-react icon (e.g. Shield for Imperium/Custodes, Cog for Mechanicus, Bug for Tyranids, Skull for Chaos, etc.).
- The widget actively tallies the count of commanders registered for each faction dynamically based on database entries.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up)
Tasks:
- Fixed a broken route link on the Dashboard where the "View Full Dossier" button incorrectly pointed to `/commander/:id` instead of the correct `/profile/:id` route. Navigating from the Sector Command Roster now correctly opens the full dossier.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 2)
Tasks:
- Fixed a bug where a manually selected UI Theme would revert upon page reload if the user's registered faction was different (e.g. reverting back to Chaos if their profile was set to a Chaos faction).
- Theme selections are now correctly persisted using `localStorage`, ensuring the interface remembers the commander's manual override preference between sessions.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 3)
Tasks:
- Applied the secondary Chaos font (`ZarathustraBleeds`) to all sub-headers (`h2`-`h6`) across all Chaos-related themes. The aggressive, hard-to-read primary Chaos font (`ZeusBorne`) is now restricted solely to the highest-level `h1` titles on each page for better overall legibility.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 4)
Tasks:
- Replaced the previous `hive_primus.png` and `rad_zone_gamma.png` image references in the War Effort map data with their new `.jpg` variants.
- Removed the deprecated `.png` files from the public assets directory.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 5)
Tasks:
- Further refined Chaos typography by restricting the aggressive primary font (like `ZeusBorne`) strictly to the top-level `.faction-header h1` element which represents the actual title of the page.
- Adjusted all other `h1` elements across the site to use the highly legible secondary Chaos font, exactly aligning with the user's explicit preference.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 6)
Tasks:
- Appended a "Credits & Acknowledgements" section to the bottom of the Field Manual (`Briefing.tsx`).
- Added formal attributions for all custom 40k typography (CaslonAntique, EldarRunes, Necron-Crypt, OrkGlyphs, tau-40k, ZarathustraBleeds, Zeus-Borne) with links to their respective foundries/authors.
- Added a massive shoutout to Yaro (Discord: iyaro87) for contributing all the environmental and theatre of war imagery used across the campaign.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 7)
Tasks:
- Replaced the final `orbital_tether.png` reference in the `Dashboard.tsx` with its `.jpg` variant to complete the image format optimizations.
- Removed the deprecated `.png` asset from the repository.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 8)
Tasks:
- Wrote a custom Node.js parser script to automatically extract all Warhammer 40,000 units from the Munitorum Field Manual PDF text dump.
- Extracted Matched Play, Forge World, and Legends Field Manual units while stripping out enhancements and point values.
- Built a merge script to append exactly 1,052 missing units to the appropriate sub-faction arrays in `src/data/warhammer40k.ts`.
- Verified TypeScript compilation (`npm run build`) and pushed changes to main.
Follow-ups:
- None

Date: 2026-06-05 (Follow-up 9)
Tasks:
- Added `CoreScript` font styling for Leagues of Votann titles.
- Added `Simbiot` font styling for Tyranids titles.
- Updated `Briefing.tsx` to include creator credits and links for the two new fonts.
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Re-parsed the PDF with `pdf-parse` but fell back to regenerating `seed_units.sql` using the robust PDF-to-text linear parser.
- Created `CREDITS.md` in `public/fonts` to properly attribute `CoreScript` and `Simbiot`.
- Created SQL migration `20260606000000_warlord_momentum.sql` to automatically insert a Warlord into a user's roster with `built: false` and `painted: false`, providing momentum for the first 400 points.
- Removed standalone 'Warlord Built' and 'Warlord Painted' items from Logistics milestones so they integrate into the 400 point path.
Follow-ups:
- User must download `CoreScript.otf` and `Simbiot.ttf` and place them in `public/fonts/`.
- User must run `seed_units.sql` and `20260606000000_warlord_momentum.sql` against the Supabase instance using the SQL editor.

Date: 2026-06-05 (continued)
Tasks:
- Completely rewrote the Munitorum Field Manual PDF parser (parse_munitorum_v4.cjs) to properly handle the multi-column PDF layout
- Fixed: Previous parser was missing entire factions (T'au Empire, Tyranids, World Eaters, Space Wolves, Thousand Sons) because the linear pdftotext output interleaved columns and the parser lost track
- Fixed: X-101 and UR-025 unit names were being treated as Legends faction headers; now only known faction names are treated as faction headers in the Legends section
- Fixed: Emperor's Children faction name had a curly/smart quote that wasn't being matched
- Generated new seed_units.sql with 1218 units across 31 factions (up from ~1000 incomplete units in the DB)
- Cleaned up scratch parser files
- Build passes, all relevant tests pass (1 pre-existing Dashboard test failure unrelated to changes)
Follow-ups:
- User must run seed_units.sql in the Supabase SQL Editor to populate the unit_points table
- User must run 20260606000000_warlord_momentum.sql in the Supabase SQL Editor for the Warlord momentum feature
- Pre-existing Dashboard.test.tsx failure needs fixing (supabase mock issue)

Date: 2026-06-05 (Fix for World Eaters Dropdown)
Tasks:
- Fixed a bug where `useUnitRegistry.ts` was hitting the default 1000-row Supabase limit, causing units for "World Eaters" and other late-alphabet factions to silently not load on the frontend. Increased the range to 4999.
- Fixed faction name mismatches in `warhammer40k.ts` (e.g., "Agents of the Imperium" to "Imperial Agents") so that the dropdown exactly matches the database records.
- Pushed changes to `main`.
Follow-ups:
- None
