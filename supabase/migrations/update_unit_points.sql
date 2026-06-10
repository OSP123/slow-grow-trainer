-- Migration: update_unit_points.sql
-- Adds cost_tiers column to support multiple model sizes and point values for a single unit.

ALTER TABLE public.unit_points ADD COLUMN IF NOT EXISTS cost_tiers JSONB DEFAULT '[]'::jsonb;
