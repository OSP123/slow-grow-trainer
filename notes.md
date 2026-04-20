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
