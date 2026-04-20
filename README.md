# Warhammer 40k Slow Grow Trainer

A comprehensive campaign management platform designed to help local gaming groups track hobby progress, matchmaking, and Munitorum Field Manual points throughout an Escalation League.

## Core Features

- **Hobby Logistics**: Track your Path to Glory spanning from building and painting your Warlord all the way up to a fully assembled 2000-point army.
- **Dynamic Army Rosters**: Configure your crusade forces using built-in exact-match lookup datasets across all 10th-edition factions.
- **Matchmaking & VP Tracking**: Record live Command points, temperament, Rules of Engagement ratings, and global Win/Loss metrics across the War Zone. 
- **Admin Dashboard**: Override deployments, register custom local game-store locations, and seamlessly update the global Munitorum Points unit registry.

## Initialization & Points Seeding

This project uses a fully integrated Supabase PostgreSQL backend. Along with the core platform schema migrations, we've populated the entire database with over ~1000 real Warhammer 40k units spanning all major Imperial, Chaos, and Xenos factions. 

To initialize the application locally with all real-world base point costs already registered:

1. Connect your instance to a new Supabase Project.
2. Run the database push protocol:
   `npx supabase db push`
3. The migrations pipeline will securely assemble tables and subsequently inject:
   - `20260420000002_seed_points.sql` (Creates the fundamental data structure)
   - `20260420000003_update_real_points.sql` (Bridges base points via community Datasheet datasets)
   - `20260420000004_update_openhammer_points.sql` (Bridges edge cases using OpenHammer historical schemas)
   - `20260420000005_fuzzy_points_bridge.sql` (Heuristic fuzzy-matching bridge for remaining naming discrepancies)

Any obscure units or unmapped items will default neutrally to `0` Points in the live database. The Administrator can modify these directly within the application's Admin Dashboard.

## Local Setup

1. Install module dependencies:
   `npm install`
2. Configure `.env.local` with your Supabase keys:
   `VITE_SUPABASE_URL=your_project_url`
   `VITE_SUPABASE_ANON_KEY=your_anon_key`
3. Launch the development server:
   `npm run dev`
