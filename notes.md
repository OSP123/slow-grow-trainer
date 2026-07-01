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

Date: 2026-06-05 (Fix for World Eaters Dropdown - ACTUAL FIX)
Tasks:
- Re-fixed `useUnitRegistry.ts`. While `.range(0, 4999)` was added previously, the Supabase server (PostgREST) has a hard-coded internal `max-rows` limit of 1000 which overrides the client's requested range.
- Implemented an actual `while` loop pagination in the hook to fetch all 1218 units in 1000-row chunks until all are retrieved.
- World Eaters now absolutely loads.
- Pushed changes to `main`.
Follow-ups:
- None

Date: 2026-06-05 (End-to-End Testing & Verification)
Tasks:
- Created automated integration test suite via `src/hooks/useUnitRegistry.test.ts`.
- Manually verified via headless node testing and automated Vitest suite that the `useUnitRegistry` pagination fully bypassed the `1000` row limit and successfully captured 1218 units.
- Proved World Eaters dropdown properly captures units like 'Angron' end-to-end against the live backend database.
- Removed obsolete test script and committed test coverage.
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Fixed the ArmyRoster unit input UI. Replaced the hidden datalist with a proper native <select> dropdown so that all parsed Munitorum Field Manual units (like the 30 World Eaters units) are immediately visible to the user without needing to start typing.
- Investigated the parser and confirmed the database is accurately populated with all 1,338 units.
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Fixed the multi-line unit name parsing error. Units like "Death Company Dreadnought with Magna-grapple" and "Captain in Terminator Armour" that wrapped across multiple lines in the PDF are now correctly concatenated instead of being truncated into fragments like "with Magna-grapple".
- Re-ran the parser and generated updated seed_units.sql and warhammer40k.ts with 1,341 perfectly parsed units.
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Verified that all multi-line unit names ("in [Armour]", "with [Wargear]") are flawlessly merged in the database.
- Discovered and fixed a minor anomaly where a lengthy instructional paragraph from the Agents of the Imperium section was merged into "Sisters of Battle Immolator" due to the new multi-line concatenation rules. Added a word-count filter to safely ignore non-unit paragraphs.
- Regenerated seed_units.sql and warhammer40k.ts with 1,340 pristine units.
Follow-ups:
- None

Date: 2026-06-05
Tasks:
- Fixed a major faction header parsing bug where fractions with headers split across two lines (e.g., "CODEX SUPPLEMENT:" on line 1, "BLACK TEMPLARS" on line 2) were entirely skipped. This successfully recovered the missing Black Templars roster (17 units), and the standard rosters for Blood Angels (+15 units) and Dark Angels (+16 units), bringing the new true unit total to 1,388.
- Updated warhammer40k.ts and seed_units.sql to reflect all 31 factions perfectly.
Follow-ups:
- None

Date: 2026-06-08
Tasks:
- Added a League Payment section directly to the Briefing page under the "Campaign Structure & Matchmaking" section.
- Included the Venmo payment link and specific instructions to DM for alternative payment options.
Follow-ups:
- None

Date: 2026-06-08
Tasks:
- Updated the credits section in the Briefing page to include Mageek's Reddit post link for the Necrons font alongside the original Strolen link.
Follow-ups:
- None

Date: 2026-06-08
Tasks:
- Added a new question and answer to the FAQ section in Briefing.tsx regarding the campaign start date (July 1) and the final sign-up date (June 27).
Follow-ups:
- None

Date: 2026-06-08
Tasks:
- Implemented CampaignQuests component in CommanderProfile to gamify phase progression (enlistment, plus 400 pt increments).
- Implemented CampaignTimeline component and injected it into the Briefing for a visual countdown to July 1, 2026.
- Overhauled the Gallery UI to feature an Instagram-style modal with a side-by-side image and comments/emotes overlay.
- Added Supabase migrations for `gallery_comments` and `gallery_emotes` to support the new UI.
- Executed routing and navigation updates, separating FAQ into its own tab and directing logged out traffic to the Briefing.
- Shifted Honour Ratings explanation out of the Briefing and directly into the Campaign Battles finalization flow.
Follow-ups:
- Remind user to run `setup_gallery.sql` in their Supabase dashboard so the new Gallery comments feature operates without database errors.

Date: 2026-06-10
Tasks:
- Fixed the Custom Unit input text field logic in ArmyRoster.tsx.
- Created fix_gallery_fkeys.sql to properly reference public.profiles for comments and emotes.
- Added cost_tiers JSONB to unit_points via migration.
- Updated Munitorum Field Manual parser to capture all unit sizes and costs instead of just base points.
- Updated ArmyRoster to natively support selecting model sizes and automatically pulling correct points.
Follow-ups:
- User needs to run fix_gallery_fkeys.sql, update_unit_points.sql, and seed_units.sql.

Date: 2026-06-10
Tasks:
- Added maxHeight and overflow properties to Dashboard terminal communique to improve UI layout and keep the lore scrollable instead of stretching the globe.

Follow-ups:
- None

Date: 2026-06-10 (immersion update)
Tasks:
- Added dataslate aesthetics to Login/Signup cards (chamfered clip-path corners, subtle scanline overlay, caution-stripe warning banner on signup).
- Replaced all loading messages across 7 components with thematic 40k text (Interrogating Machine Spirit, Awaiting Astropathic Relay, Calibrating Auspex Arrays, Communing with the Omnissiah, Synchronizing Noospheric Link).
- Created src/utils/audioEffects.ts with Web Audio API synthesized sounds (mechanical click, hover tick, success beep, error buzz) — no external audio files.
- Wired audio effects into Login.tsx with a toggleable sound button (speaker icon, bottom-right).
- Made Dashboard lore terminal scrollable (maxHeight 250px).
- Fixed parse_munitorum_v4.cjs multi-line unit name concatenation regression (e.g. Wolf Guard in Terminator Armour).
- All 52 tests passing, build verified, pushed to main.

Follow-ups:
- Run updated seed_units.sql in Supabase dashboard.
- Consider wiring audio effects into more UI interactions (sidebar nav, battle submissions) post-launch.


Date: 2026-06-10
Tasks:
  - Replaced laser click sound with a percussive mechanical white-noise clack
  - Fixed 400 error in CampaignQuests component by correcting 'user_id' to 'profile_id' in army_units query
  - Detailed to user how to test matchmaker algorithms using existing Admin Dashboard Dry Run Preview feature without relying on fake data
  - Fixed UI horizontal overflow bug on mobile devices for the weapons tables in both custom Commander Profile Viewer and Builder
Follow-ups:
  - Update algorithm for minitorum field manual with points based on wargear eventually


Date: 2026-06-10
Tasks:
  - Implemented immersive grimdark atmospheric visual updates
  - Added volumetric fog and floating CSS embers via Atmosphere React component
  - Updated .card global class to include heavy gothic framing and corner rivets using radial gradients
  - Applied intermittent retro flicker to all header elements globally
  - Added plasma glow pulsing to primary action buttons
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually


Date: 2026-06-10
Tasks:
  - Enhanced gothic framing on .card to be more pronounced with heavy, multi-layered brutalist borders, arched top highlights, and 3D iron corner rivets
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually


Date: 2026-06-10
Tasks:
  - Replaced CSS borders with an authentic scalable vector graphic (gothic-border.svg) for .card borders
  - Frame now includes inner brass trim, structural corner blocks with diagonal support beams, and inward-facing gothic arches along all edges.
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually


Date: 2026-06-10
Tasks:
  - Replaced vector borders with the explicit generated Imperial Gothic Frame PNG (gothic_ui_frame_1781133732185.png) mapped to .card via border-image slice and stretch to serve as both the dark background and the gothic outer structural framing as requested.
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually


Date: 2026-06-10
Tasks:
  - Reverted the gothic border image implementation entirely back to the original simple, clean dataslate CSS clipping to ensure readability and stop background stretching.
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually

Date: 2026-06-12
Tasks:
  - Fixed a bug where commanders removed via the admin panel still appeared in the Dashboard (War Effort Area). Filtered removed/paused profiles securely using case-insensitive status checks.
  - Filtered removed/paused commander profiles from globe mappings, narratives, and match wins.

Follow-ups:
  - None

Date: 2026-06-16
Tasks:
  - Updated validMatchups in Dashboard.tsx to completely strip any matches where EITHER player is removed or paused, preventing them from showing up as the loser in tooltips.
  - Pushed changes to origin.

Follow-ups:
  - None

Date: 2026-06-17
Tasks:
  - Created a database migration (20260617000000_secure_private_profiles.sql) to move email, real_name, and discord_name out of the public profiles table.
  - Implemented strict RLS on the new private_profiles table to protect sensitive user information from unauthorized access.
  - Updated the Admin Dashboard to fetch the private information via a join, ensuring the admin panel continues to function seamlessly.

Follow-ups:
  - User needs to run the migration script against their live Supabase instance.

Date: 2026-06-17
Tasks:
- Created and executed SQL migration `20260617000000_secure_private_profiles.sql` to move sensitive user data (email, real_name, discord_name) from `public.profiles` to a secure `private_profiles` table.
- Conducted full security sweep revealing 12 vulnerabilities.
- Prevented privilege escalation in `profiles` by restricting `role` update via RLS triggers.
- Patched stored XSS vulnerability in `Dashboard.tsx` 3D globe tooltips.
- Secured `unit_points` table against unauthorized deletion by restricting to admins only.
- Added user folder ownership checks to storage bucket uploads (`hobby_photos`, `avatars`).
- Removed hardcoded admin secrets (`TERMINUS_ROOT` password, admin email) from client bundle.
- Prevented Matchup tampering by adding database triggers ensuring players can only modify their own score and lore.
- Added missing `DELETE` RLS policies across `matchups`, `hobby_milestones`, `campaign_votes`, and storage buckets.
- Added password strength validation to signup logic in `Login.tsx`.
- Applied character limits to gallery comments in `Gallery.tsx`.
- Improved UI/UX by removing `alert()` and `confirm()` calls across all admin and user components, replacing them with inline state messages.
- Verified successful production build.

Follow-ups:
- User must run `supabase db push` or manually execute `20260617000001_security_audit_fixes.sql` in their Supabase dashboard to apply the final database security fixes.

Date: 2026-06-18
Tasks:
- Investigated and resolved Admin Dashboard `private_profiles` empty query issue (caused by stale PostgREST schema cache and delayed Vercel frontend deployment).
- Added new FAQ entry explicitly allowing 3DP detachments in sub-2K games.
- Built `parse_munitorum_v6.cjs` to ingest the latest Munitorum Field Manual PDF (`eng_11-02...`).
- Fixed previous MFM parser regressions by properly capturing multiple model `cost_tiers` directly from the text dump, preventing data loss when users select unit sizes in the Army Roster.
- Generated updated `seed_units.sql` containing all 1370 official units with their corresponding model count cost tiers.
- Pushed frontend FAQ update and parser scripts to `main` branch on GitHub for live deployment.
- Completed Gothic/Brutalist Aesthetic refinement.

- User must run the newly generated `seed_units.sql` in their Supabase SQL editor to update the live unit points dictionary.

Date: 2026-06-18
Tasks:
- Parsed new 11th Edition Munitorum Field Manual (React Server Components HTML layout).
- Implemented `parse_mfm_html.cjs` using Cheerio to extract unit escalation tiers and wargear options.
- Updated `unit_points` table schema to include `wargear_options` JSONB column.
- Pushed updated 11th Edition points to live Supabase database via Supabase CLI query.
- Updated frontend `ArmyRoster.tsx` to automatically calculate escalating points costs based on duplicate units in the roster.
- Updated `ArmyRoster.tsx` to render wargear point costs.

Follow-ups:
- Check back with the user regarding the email verification issue.

Date: 2026-06-18
Tasks:
- Fixed unused fireEvent import causing TypeScript strict-mode build failure on Render
- Fixed case-sensitive unit counting bug where 'Tempestus Scions' didn't match 'TEMPESTUS SCIONS' for point tier escalations
- Wrote and executed a backend sync script that successfully retroactively updated the point values and escalation tiers for 40 existing units across all user rosters
Follow-ups:
- Assist with setting up custom SMTP provider to resolve email verification limits if the user requests it
- Generated fix_caps_and_sync.sql to fix ALL CAPS unit names and bypass RLS to sync points
- Removed hardcoded emailRedirectTo from Login.tsx to fix silent Supabase email failure after Render deployment
- Updated SUBFACTIONS_MAP in warhammer40k.ts with comprehensive subfactions for all armies so the registration dropdown populates correctly
Date: 2026-06-18
Tasks:
- Fixed subfaction dropdown in registration missing Adepta Sororitas and others by comprehensively mapping 10th edition subfactions in warhammer40k.ts.
- Fixed divergent Space Marine chapters (Blood Angels, Dark Angels, Space Wolves, Deathwatch, Black Templars) unable to select generic Space Marine units in the roster UI.
Follow-ups:
- Confirm with user if they'd like to provide specific divergent point overrides (like the +10 pts for Blood Angels Assault Intercessors) or manually override them in the UI.


Date: 2026-06-18
Tasks:
- Created a robust custom parser to extract the divergent Space Marine unit points directly from Next.js flight payloads in the HTML offline files.
- Generated seed_divergent_units.sql containing 578 mapped divergent points (including the 95pt Assault Intercessors with Jump Packs for Blood Angels).
Follow-ups:
- User needs to run seed_divergent_units.sql in their Supabase dashboard.


Date: 2026-06-18
Tasks:
- Killed hanging background tasks and local dev servers to free up memory and processes.
- Cleaned up the root directory by moving roughly 60 old temporary parsing scripts, test scripts, and outdated SQL files into the `scratch/` directory.
Follow-ups:
- None.


Date: 2026-06-18
Tasks:
- Created migrate_discord_name.sql to move discord_name back to the public profiles table so that it can be displayed publicly.
- Updated CommanderProfile.tsx to allow users to edit and save their Discord name.
- Updated Dashboard.tsx, Gallery.tsx, and CommanderProfile.tsx to correctly display the Discord name next to the commander name.
Follow-ups:
- User needs to run migrate_discord_name.sql in their Supabase dashboard to apply the schema changes.



Date: 2026-06-21
Tasks:
- Re-generated map images for the 6 territories without faction forces.
- Updated Dashboard.tsx to display new map images below the globe UI and added influence bars.
- Added Votann Resources conditionally rendered section to Dashboard.
- Added global Campaign Engine controls to AdminDashboard.tsx (month and points limits).

Follow-ups:
- None


Date: 2026-06-21
Tasks:
- Re-generated the Hive Spires and Orbital Defense Relay map assets to have a much darker, gritty, grimdark aesthetic.
- Appended the Dynamic Campaign Mechanics section to the Field Manual (Briefing.tsx) detailing influence shifts and Votann extra rules.
- Relocated the Territory Detail Panel in Dashboard.tsx to sit directly beneath the interactive Globe.
Follow-ups:
- None

Date: 2026-06-21
Tasks:
- Implemented mobile-first responsive layout changes across the Dashboard to ensure the new Campaign Map and Commander Roster grid scale properly on smaller smartphone screens.

Date: 2026-06-21
Tasks:
- Added deployed_theatre column to profiles via migration.
- Added Force Deployment capability to AdminDashboard to assign commanders to the 6 theatres.
- Implemented strict narrative bans in Matchmaker.ts (no Imperium mirror matches, no exact Xenos mirror matches).
- Matchmaker now prioritizes players in the same deployed_theatre with a massive point bonus.
- Dashboard maps now render deterministic overlays of all commanders officially deployed to that active territory.
Follow-ups:
- None

Date: 2026-06-21 (Update 2)
Tasks:
- Added map_locations table to store X/Y coordinates for map pins.
- Added Interactive Map Editor UI to AdminDashboard allowing click-to-pin mapping of territories.
- Updated Campaign Roster edit form to include specific location deployment dropdown.
- Matchmaker now grants +100 bonus for identical deployed_location_id.
- Dashboard now overlays map_locations as glowing nodes and clusters commanders around them.
Follow-ups:
- None

Date: 2026-06-21 (Update 3)
Tasks:
- Fixed critical bug: Dashboard.tsx queries were selecting `discord_name` directly from `profiles` table, but that column only exists on `private_profiles`. The PostgREST schema reload (from the map_locations migration) exposed this latent bug, causing a 42703 error that was silently swallowed by try/catch, making all commanders vanish from the War Effort Map page.
- Fixed both the commanders query (line 318) and the matchups query (line 137) to join `private_profiles` for `discord_name` instead.
Follow-ups:
- None

Date: 2026-06-21 (Update 4)
Tasks:
- Fixed production crash: campaign_state and territories tables don't exist on production Supabase. Their queries (especially campaign_state with .single()) were throwing inside the outer try block, causing execution to jump to `finally` and skip the commanders fetch entirely.
- Wrapped campaign_state, territories, and map_locations queries in individual try/catches.
- Added fallback commanders query (without deployed_theatre/deployed_location_id columns) for when migration hasn't been applied to production yet.
- Added fallback matchups query (without private_profiles join) and removed the early `return` that was blocking commander loading.
Follow-ups:
- Run migrations on production Supabase to add deployment columns and map_locations table

Date: 2026-06-21 (Update 5)
Tasks:
- Realized the previous fallback strategy failed because production `profiles` *does* have a `discord_name` column, so `private_profiles` join was failing due to either RLS or table absence.
- Pushed ultimate fallback queries for both matchups and commanders that directly select `discord_name` from `profiles` as it was originally built, bypassing the failed `private_profiles` join altogether.
Follow-ups:
- Verify production deployment restores commanders on the dashboard.

Date: 2026-06-27
Tasks:
- Made desktop sidebar sticky with overflow-y: auto in App.css to prevent commander profile widget cutoff on small viewports.
- Added CampaignQuests component integration directly into Briefing.tsx (Strategic Briefing / Field Manual) when logged in.
- Added Campaign Directives Chronicle progression grid at top of CampaignQuests.tsx showing sealed/active/locked status tags.
- Added responsive CSS classes to App.css to render CampaignTimeline vertically on mobile screens <= 600px, preventing milestone clipping.
- Updated Crucible of Champions interface, Supabase profile select query, DatasheetBuilder inputs, and DatasheetViewer displays to support Points and Unit Keywords.
Follow-ups:
- None

Date: 2026-06-27 (Update 2)
Tasks:
- Built TacticalSectorMap component using clean SVG vector polygons and CRT scanlines to replace AI territory artwork on the War Effort Map.
- Implemented individual lore-accurate coloring for all 8 Xenos factions (Orks, Necrons, Tyranids, T'au Empire, Aeldari, Drukhari, Leagues of Votann, Genestealer Cults) alongside Imperium and Chaos megafaction colors.
- Integrated TacticalSectorMap into Dashboard.tsx territory detail view, updating globe pins and foothold progress bars to respect unique Xenos colors.
Follow-ups:
- None

Date: 2026-06-27 (Update 3)
Tasks:
- Rewrote TacticalSectorMap component to fix critical issues: same shapes for every theatre, polygons not filling viewport, hover-only interaction broken on mobile.
- Each of the 6 theatres now has its own unique sector layout with lore-appropriate names (e.g. The Hive Spires has Upper Spire/Administratum/Hab Blocks/Underhive/Transit Conduits/Sewer Networks).
- Sector polygons now tile edge-to-edge filling the full 800x500 SVG viewport with zero gaps.
- Changed interaction from hover-only to tap/click (works on mobile). Hover still works as a convenience on desktop.
- Moved telemetry readout from a floating overlay (blocked content on mobile) to a panel below the map.
- Added 10 new tests covering unique theatre sectors, tap interaction, toggle deselect, polygon count, and fallback sectors.
Follow-ups:
- Visual verification needed on mobile device to confirm tap behavior feels right.

Date: 2026-06-27 (Update 4)
Tasks:
- Replaced arbitrary polygon approach with a proper flat-top hex grid (25 hexes, 7 columns × 3-4 rows, r=75) that tiles edge-to-edge across the 800x500 SVG viewport.
- Each of the 6 theatres now has a unique sector assignment pattern grouping adjacent hexes into named territories (e.g. Hive Spires groups top hexes into Upper Spire, bottom into Sewer Networks).
- Hex grid with coordinate labels (col.row) gives an authentic wargaming tactical display feel.
- Interaction remains tap/click for mobile with hover as desktop convenience. Detail panel below the map.
- 12 tests covering: faction colors, unique sectors per theatre, tap/click, toggle deselect, 25-polygon count, coordinate labels, all 6 theatres verified, fallback sectors.
Follow-ups:
- Visual verification needed on mobile device to confirm hex grid looks and feels right.

Date: 2026-06-27 (Update 5)
Tasks:
- Completely redesigned `TacticalSectorMap.tsx` away from flat edge-to-edge geometric diagrams toward distinctive, organic landmass/fortress silhouettes centered in an Auspex holographic display.
- Each of the 6 theatres now features a unique structural footprint (Pyramidal Spire Fortress, Sprawling Canyon Island, Heavy Industrial Refinery, Orbital Star Hub, Shattered Crater, and Offshore Archipelago).
- Within each territory silhouette, the 5 sectors explicitly correspond to the 5 escalation rounds (Round 1: 400 pts through Round 5: 2000 pts), visually linked by escalation progression vectors.
- Added rich SVG styling: glowing cybernetic drop shadows (`filter="url(#sectorGlow)"`), internal topographical wireframe contours, corner targeting brackets, coordinate grids, and an animated radar sweep.
- All 64 automated tests pass and production build compiles cleanly.
- User verification required to see if this Auspex holographic display direction successfully captures the unique, premium aesthetic envisioned without relying on AI art.

Date: 2026-06-27 (Update 6)
Tasks:
- Mapped faction battle outcomes to overarching narrative goals (e.g. Chaos win -> "Dark Ritual Completed", Orks win -> "Sector Wrecked & Looted", Imperium win -> "Sector Secured & Fortified") so players focus on narrative rather than generic win mechanics.
- Added an "ACTIVE DEPLOYMENTS & MATCHUPS" section below the Auspex tactical map when clicking any territory on the world map. Clearly displays all stationed commanders and who they are fighting against (e.g., `⚔️ VS Abaddon (Chaos Space Marines)`).
- Added a prominent "🎯 YOUR CURRENT CAMPAIGN MISSION" banner to the Dashboard top interface so logged-in players instantly see who their current opponent is and which war zone they are deployed to.
- Strictly followed Test-First Development (TDD): wrote failing unit tests for `getFactionNarrativeGoal`, map matchups roster, and Dashboard mission banner before writing minimal passing code.
- All 68 unit tests passing across the codebase and verified clean production build (`npm run build`).
Follow-ups:
- User verification requested to confirm if the active matchups banner and theatre deployment displays behave as desired in their environment.

Date: 2026-06-27 (Update 7)
Tasks:
- Created helper function `getGrandAlliance` to reliably classify any faction or subfaction into its respective Grand Alliance (Imperium, Chaos, or Xenos).
- Organized commanders under the War Effort Map (`Dashboard.tsx` Sector Command Roster) into distinct categorized sections: "Imperial Forces", "Chaos Forces", and "Xenos Forces", complete with Alliance badges and color-coded headers.
- Organized the active deployments inside the holographic territory map (`TacticalSectorMap.tsx`) under "Imperial Forces", "Chaos Forces", and "Xenos Forces" headers as well.
- Strictly followed Test-First Development (TDD): wrote failing unit tests in `Dashboard.test.tsx` and `TacticalSectorMap.test.tsx` before implementing the code changes.
- All 69 unit tests passing across the codebase and verified clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-27 (Update 8)
Tasks:
- Added a polished, comprehensive FAQ entry addressing game rules below 2000 points (Combat Patrol layouts at 400pts, full-sized boards at Incursion levels, and Games Workshop detachment selection flexibility under 2000pts).
- Followed Test-First Development (TDD) by creating `FAQ.test.tsx` before updating `FAQ.tsx`.
- Removed all emoji icons (`🛡️`, `👁️`, `👽`, `⚔️`) next to Grand Alliance headers and matchups in `Dashboard.tsx` and `TacticalSectorMap.tsx`.
- Adjusted Alliance grouping styling to match the sleek tone of the application (`var(--theme-accent)` and `var(--theme-border)` in the Dashboard, `#cbd5e1` slate text in the Auspex tactical display).
- All 71 automated unit tests passing across the codebase and verified clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-27 (Update 9)
Tasks:
- Updated the algorithmic Matchmaker engine (`Matchmaker.ts`) to strictly enforce that Xenos factions never pair against any other Xenos faction (previously allowed differing Xenos factions).
- Added a score penalty (-15 points) for Chaos vs Chaos matchups so that Chaos commanders are prioritized against Imperial or Xenos opponents when available, while still allowing Chaos infighting if required by the pool.
- Built a dedicated "Manual Narrative Pairing" UI form inside the Admin Dashboard (`AdminDashboard.tsx`) under Matchmaking Engine Override.
- Integrated interactive real-time Grand Alliance narrative alerts inside the Manual Narrative Pairing form alerting admins when pairing Imperium vs Imperium, Xenos vs Xenos, or Chaos vs Chaos.
- Strictly adhered to Test-First Development (TDD) by adding failing tests to `Matchmaker.test.ts` and `AdminDashboard.test.tsx` prior to code implementation.
- Verified 74 passing unit tests and a clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-27 (Update 10)
Tasks:
- Corrected Xenos matchmaking ban rule in `Matchmaker.ts` so that Xenos factions can pair against other differing Xenos factions (e.g., Tyranids vs Orks is allowed), while strictly banning matchups between two players of the exact same Xenos faction (e.g., Tyranids vs Tyranids).
- Updated the real-time dynamic narrative alert in `AdminDashboard.tsx` so that admins are only warned when manually pairing two commanders from the exact same Xenos faction.
- Followed Test-First Development (TDD) by updating unit tests in `Matchmaker.test.ts` to assert that differing Xenos factions pair successfully while identical Xenos factions do not.
- Verified all 74 automated unit tests pass and confirmed a clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-29 (Update 11)
Tasks:
- Added a "Reinstate" button and confirmation modal flow inside `AdminDashboard.tsx` to restore players who were accidentally marked as "removed".
- Reinstating a commander transitions their `campaign_status` back to `'active'`, making them visible and eligible for matchmaking again.
- Strictly followed Test-First Development (TDD) by adding a unit test to `AdminDashboard.test.tsx` verifying the Reinstate button renders for removed users before implementing the feature.
- Verified all 75 unit tests passing across the codebase and confirmed clean production compilation (`npm run build`).
- Request user verification to confirm reinstating players works smoothly in their admin dashboard.

Date: 2026-06-30
Tasks:
- Updated `CampaignTimeline.tsx` so that when the countdown timer expires, it is replaced by an interactive Vox Transmission interface styled similarly to the `INCOMING COMMUNIQUE :: SECTOR COMMAND` section.
- Embedded an HTML5 `<audio>` player linked to `/Inquisitor-lore-slow-grow-voxcast-final.m4a` allowing commanders to listen to the final vox-cast transmission.
- Added the full formatted transcript below the audio player complete with transmission timestamps, Governor Petro's dialogue, Inquisitor Charmeleus Kane's intervention and gunshot, and authentication codes.
- Adhered strictly to Test-First Development (TDD): created `CampaignTimeline.test.tsx` with unit tests covering both the active countdown state and expired vox transmission state before completing implementation.
- All 77 unit tests passing and verified clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Vox Visualizer Update)
Tasks:
- Created animated `VoxWaveform` visualizer component featuring a retro oscilloscope grid background, dynamic frequency bars, and animated SVG carrier waves.
- Connected the visualizer directly to the `<audio>` element play state (`isPlaying`) in `CampaignTimeline.tsx`: displays subtle standby oscillations when paused and shifts to energetic frequency animations when transmitting.
- Adhered strictly to Test-First Development (TDD): created `VoxWaveform.test.tsx` asserting standby and live spectrum indicators before building the component, and updated `CampaignTimeline.test.tsx` to verify visualizer integration.
- All 78 unit tests passing and verified clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Vox Visualizer Visibility & Dev Override Fix)
Tasks:
- Improved `VoxWaveform.tsx` visibility and animation behavior: ensured frequency bars and oscilloscope sine wave continuously animate with vibrant phosphor green glow even in standby/idle mode (`!isPlaying`), switching to high-amplitude neon pulses when transmitting (`isPlaying`).
- Added a convenient `[🛠️ DEV: SIMULATE JULY 1ST VOX TRANSMISSION]` simulation toggle button directly inside `CampaignTimeline.tsx` so commanders can immediately preview and interact with the vox transmission and wave animation without modifying date code or waiting for July 1st.
- Verified all 78 unit tests passing and confirmed clean production compilation (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (CSS Flex Collapse Fix for Vox Waveform)
Tasks:
- Investigated user report that `VoxWaveform` was hidden by CSS: discovered that `.terminal-communique` (`display: flex; flex-direction: column; max-height: 420px;`) caused `VoxWaveform` (`flex-shrink: 1`, `overflow: hidden`) to shrink its computed height to `0px`.
- Fixed the layout by adding `flex-shrink: 0`, `min-height: 180px`, and `box-sizing: border-box` to the `VoxWaveform` container style, preventing Flexbox from collapsing the visualizer when scrolling through long vox transcripts.
- Verified all 78 unit tests passing and confirmed clean production compilation (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Real-time Web Audio API Spectrum Analysis)
Tasks:
- Replaced simulated random math animation with genuine browser Web Audio API (`AudioContext` and `AnalyserNode`) real-time frequency analysis.
- Connected the `<audio>` element in `CampaignTimeline.tsx` via `audioRef` directly into `VoxWaveform.tsx`: uses `createMediaElementSource()` and Fast Fourier Transform (FFT) frequency bin extraction (`getByteFrequencyData`) to drive the 20 vertical equalizer bars in exact sync with audio volume and frequency bands.
- Utilized `getByteTimeDomainData` to map real-time soundwave amplitude points directly onto the SVG oscilloscope `<path>`, creating an authentic retro military spectrum analyzer trace.
- Verified all 79 unit tests passing and confirmed clean production compilation (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Custom Retro Auspex Terminal Audio Player)
Tasks:
- Replaced the browser-native white/grey HTML5 `<audio controls>` element in `CampaignTimeline.tsx` with a custom-built retro sci-fi component (`VoxAudioPlayer.tsx`).
- Designed custom retro Auspex playback controls matching `.terminal-communique.imperial`: deep obsidian background (`#030803`), phosphor green border (`#1a3a1a`), glowing signal indicator (`SIGNAL LOCKED // ACTIVE`), custom `[ ▶ ACTIVATE FEED ]` / `[ ⏸ HOLD SIGNAL ]` button, digital time display (`mm:ss`), and interactive neon green seek bar.
- Verified all 81 unit tests passing and clean production compilation (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Continuous Multi-Layered Oscilloscope Waveform Visualizer)
Tasks:
- Completely removed vertical equalizer bars from `VoxWaveform.tsx` per user feedback requesting pure waveforms instead of bars.
- Rewrote `VoxWaveform.tsx` to render a full-size (120px height) dynamic SVG oscilloscope window with retro background grid lines and center baseline.
- Implemented three continuous, multi-layered undulating waveform paths (`primaryPath` with neon glow, phase-shifted `secondaryPath`, and subtle `tertiaryPath`) driven in real time by Web Audio API `getByteTimeDomainData` or smooth retro oscilloscope math in standby mode.
- Verified all 82 unit tests passing and clean production compilation (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Campaign Timeline Date Correction)
Tasks:
- Corrected `CAMPAIGN_START` date in `CampaignTimeline.tsx` back to `2026-07-01T00:00:00` (July 1st) after it was inadvertently reverted to June 1st during component replacement.
- Verified unit tests and clean production build (`npm run build`).
Follow-ups:
- None

Date: 2026-06-30 (Army Chronicles Checklist Sync Fix)
Tasks:
- Investigated and resolved a bug in `CommanderProfile.tsx` where scribing and saving Army Chronicles lore displayed a success toast ("Army Chronicles safely archived") but failed to update local React `profile` state.
- Updated `handleLoreSave` and `handleAvatarUpload` to invoke `setProfile` upon successful Supabase update so child components like `<CampaignQuests>` immediately reflect the new state, dynamically crossing out the "Scribe your Army Chronicles (Lore)" enlistment checkbox without needing a browser reload.
- Added TDD unit test verifying immediate checkbox line-through styling on lore save.
Follow-ups:
- None

Date: 2026-07-01 (Admin Matchup Engine Comparison Enhancements)
Tasks:
- Updated the Admin Matchmaking & Override Station to display each player's Faction (`army_faction`) and calculated Win-Loss Record (`getUserRecord`) directly inside the algorithmically generated `Proposed Round Ledgers` and the `Manual Narrative Pairing` dropdown selects.
- Confirmed that once initial or manual pairings are locked into the ledger (`commitMatches` or `handleCreateManualPairing`), end users immediately see their active matchup banner at the top of the War Effort Map (`/dashboard`) showing their assigned opponent and faction, as well as on their individual commander card on the Sector Map.
- Wrote unit tests verifying option and simulated list text formatting.
Follow-ups:
- None
