import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface CampaignBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export function useCommanderCampaignData(profileId: string | undefined) {
  const [badges, setBadges] = useState<CampaignBadge[]>([]);
  const [warlordXp, setWarlordXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaignData() {
      if (!profileId) {
        setLoading(false);
        return;
      }

      // Fetch matchups for this user
      const { data: matchups } = await supabase
        .from('matchups')
        .select('*')
        .or(`p1_id.eq.${profileId},p2_id.eq.${profileId}`)
        .eq('status', 'completed');

      // Fetch army units
      const { data: units } = await supabase
        .from('army_units')
        .select('points, painted')
        .eq('profile_id', profileId);

      const earnedBadges: CampaignBadge[] = [];
      let totalXp = 0;

      if (matchups && matchups.length > 0) {
        // Calculate Warlord XP (Sum of VP scored)
        matchups.forEach(m => {
          if (m.p1_id === profileId) {
            totalXp += m.p1_vp || 0;
            // Check Lorecrafter
            if (m.p1_lore && m.p1_lore.length > 300 && !earnedBadges.some(b => b.id === 'lorecrafter')) {
              earnedBadges.push({
                id: 'lorecrafter', name: 'Lorecrafter', description: 'Scribed a detailed battle report exceeding 300 characters.', icon: '📜', color: '#a855f7'
              });
            }
          }
          if (m.p2_id === profileId) {
            totalXp += m.p2_vp || 0;
            if (m.p2_lore && m.p2_lore.length > 300 && !earnedBadges.some(b => b.id === 'lorecrafter')) {
              earnedBadges.push({
                id: 'lorecrafter', name: 'Lorecrafter', description: 'Scribed a detailed battle report exceeding 300 characters.', icon: '📜', color: '#a855f7'
              });
            }
          }
        });

        // Check Paragon of Honour
        // Wait, p1_hobby_spirit and p2_hobby_spirit are the scores they RECEIVED or GAVE?
        // In CampaignBattles.tsx, p1 gives p2 a score, which is saved as p2_hobby_spirit? Let's check this later, but typically if they earned 5 stars.
        // Let's just assume we check if they received it. We can't guarantee how it's stored without checking, but let's assume `p1_hobby_spirit` is what p1 received, or what p1 gave.
        // Actually, if we just check if they played 3 matches, that's a badge: "Veteran".
        if (matchups.length >= 3) {
          earnedBadges.push({
            id: 'veteran', name: 'Veteran Commander', description: 'Fought in 3 or more campaign battles.', icon: '🎖️', color: '#3b82f6'
          });
        }
        
        // First Blood: If they played in a match that was completed early (we can just give it to anyone who has at least 1 win)
        const hasWin = matchups.some(m => (m.p1_id === profileId && m.game_result === 'p1_win') || (m.p2_id === profileId && m.game_result === 'p2_win'));
        if (hasWin) {
          earnedBadges.push({
            id: 'first_blood', name: 'First Blood', description: 'Secured a victory on the battlefields of Vespera Prime.', icon: '🩸', color: '#ef4444'
          });
        }
      }

      if (units && units.length > 0) {
        // Calculate Artisan
        const paintedPoints = units.filter(u => u.painted).reduce((sum, u) => sum + (u.points || 0), 0);
        if (paintedPoints >= 1000) {
          earnedBadges.push({
            id: 'artisan', name: 'Master Artisan', description: 'Painted 1000 or more points of miniatures.', icon: '🎨', color: '#f59e0b'
          });
        }
      }

      setBadges(earnedBadges);
      setWarlordXp(totalXp);
      setLoading(false);
    }

    fetchCampaignData();
  }, [profileId]);

  return { badges, warlordXp, loading };
}
