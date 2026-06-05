import fs from 'fs';

const content = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf-8');
const isNonImperialCheck = content.includes('const isNonImperial = factionData ? factionData.grandAlliance !== \'Imperium\' : false;');
console.log('isNonImperial check exists:', isNonImperialCheck);
