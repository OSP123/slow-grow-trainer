import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {} as Record<string, string>);

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function test() {
  const { data, error } = await supabase.from('unit_points').select('*').eq('base_points', 0);
  console.log(`There are ${data?.length} units with 0 points.`);
  if (data && data.length > 0) {
    console.log(data.slice(0, 10)); // sample 10 points
  }
}
test();
