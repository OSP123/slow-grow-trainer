// Legendary Moments: narrative honours for standout moments at the table.
//
// A moment carries no rules, points or map effect -- it is recognition only,
// so it cannot tilt game balance. Players nominate from a completed battle,
// an admin approves, and approved moments show on the commander's profile and
// the War Effort page. Access rules live in the RLS policies of
// 20261008000000_legendary_moments.sql.

import { supabase } from '../../supabaseClient';

export const TITLE_MAX = 80;
export const DESCRIPTION_MAX = 500;

export type MomentStatus = 'pending' | 'approved' | 'rejected';

interface MomentProfile {
  commander_name: string;
  army_faction?: string;
  discord_name?: string;
}

export interface LegendaryMoment {
  id: string;
  matchup_id: string;
  nominated_by: string;
  honoured_id: string;
  title: string;
  description: string;
  status: MomentStatus;
  created_at: string;
  honoured?: MomentProfile | null;
  nominator?: MomentProfile | null;
  matchup?: { campaign_month?: number; theatre_name?: string } | null;
}

export const MOMENT_SELECT =
  'id, matchup_id, nominated_by, honoured_id, title, description, status, created_at, ' +
  'honoured:profiles!honoured_id(commander_name, army_faction, discord_name), ' +
  'nominator:profiles!nominated_by(commander_name, army_faction, discord_name), ' +
  'matchup:matchups!matchup_id(campaign_month, theatre_name)';

/** Approved moments, newest first, optionally for one commander. Empty if the table is unreachable. */
export async function fetchApprovedMoments(honouredId?: string): Promise<LegendaryMoment[]> {
  try {
    let query = supabase.from('legendary_moments').select(MOMENT_SELECT).eq('status', 'approved');
    if (honouredId) query = query.eq('honoured_id', honouredId);
    const { data } = await query.order('created_at', { ascending: false });
    return (data ?? []) as unknown as LegendaryMoment[];
  } catch {
    return [];
  }
}

/** Returns an error message, or null when the nomination is acceptable. */
export function validateNomination(title: string, description: string): string | null {
  const t = title.trim();
  const d = description.trim();
  if (t.length < 3) return 'Give the moment a title of at least 3 characters.';
  if (t.length > TITLE_MAX) return `Keep the title to ${TITLE_MAX} characters.`;
  if (d.length < 10) return 'Describe what happened in at least a sentence.';
  if (d.length > DESCRIPTION_MAX) return `Keep the description to ${DESCRIPTION_MAX} characters.`;
  return null;
}
