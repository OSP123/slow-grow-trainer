import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface UnitRegistryEntry {
  id: string;
  faction: string;
  unit_name: string;
  base_points: number;
  cost_tiers?: { models: number; points: number; escalation?: string | null }[];
  wargear_options?: { name: string; points: number }[];
}

export function useUnitRegistry() {
  const [unitsByFaction, setUnitsByFaction] = useState<Record<string, string[]>>({});
  const [rawRegistry, setRawRegistry] = useState<UnitRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    setError(null);

    let allData: UnitRegistryEntry[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      const { data, error: fetchError } = await supabase
        .from('unit_points')
        .select('id, faction, unit_name, base_points, cost_tiers, wargear_options')
        .order('faction', { ascending: true })
        .order('unit_name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        offset += limit;
        if (data.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    setRawRegistry(allData);
    const dict: Record<string, string[]> = {};
    for (const row of allData) {
      if (!dict[row.faction]) dict[row.faction] = [];
      dict[row.faction].push(row.unit_name);
    }
    setUnitsByFaction(dict);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  return { unitsByFaction, rawRegistry, loading, error, refreshRegistry: fetchRegistry };
}
