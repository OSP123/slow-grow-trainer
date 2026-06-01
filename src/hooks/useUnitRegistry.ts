import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface UnitRegistryEntry {
  id: string;
  faction: string;
  unit_name: string;
  base_points: number;
}

export function useUnitRegistry() {
  const [unitsByFaction, setUnitsByFaction] = useState<Record<string, string[]>>({});
  const [rawRegistry, setRawRegistry] = useState<UnitRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('unit_points')
      .select('id, faction, unit_name, base_points')
      .order('faction', { ascending: true })
      .order('unit_name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setRawRegistry(data);
      const dict: Record<string, string[]> = {};
      for (const row of data) {
        if (!dict[row.faction]) dict[row.faction] = [];
        dict[row.faction].push(row.unit_name);
      }
      setUnitsByFaction(dict);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  return { unitsByFaction, rawRegistry, loading, error, refreshRegistry: fetchRegistry };
}
