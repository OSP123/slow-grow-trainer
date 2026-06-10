const fs = require('fs');

const data = `Angron 340
Chaos Land Raider 220
Chaos Predator Annihilator 145
Chaos Predator Destructor 145
Chaos Rhino 85
Chaos Spawn 90
Chaos Terminators 175
Daemon Prince of Khorne 200
Daemon Prince of Khorne with Wings 180
Defiler 250
Eightbound 135
Exalted Eightbound 140
Forgefiend 165
Goremongers 75
Helbrute 120
Heldrake 200
Jakhals 65
Khârn the Betrayer 100
Khorne Berzerkers 180
Khorne Lord of Skulls 505
Lord Invocatus 110
Lord on Juggernaut 105
Master of Executions 60
Maulerfiend 150
Slaughterbound 100
Bloodcrushers 110
Bloodletters 90
Bloodthirster 305
Flesh Hounds 75
Skarbrand 305`;

const worldEaters = data.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(.*?)\s+(\d+)$/);
    if (!match) return null;
    return `  ('World Eaters', '${match[1].replace(/'/g, "''")}', ${match[2]})`;
}).filter(Boolean);

let sql = fs.readFileSync('seed_units.sql', 'utf8');

// Remove existing World Eaters rows
sql = sql.split('\n').filter(line => !line.includes("('World Eaters'")).join('\n');

sql = sql.trim();
if (sql.endsWith(';')) {
    sql = sql.slice(0, -1).trim();
}
if (!sql.endsWith(',')) {
    sql += ',';
}

sql += '\n' + worldEaters.join(',\n') + ';\n';

fs.writeFileSync('seed_units.sql', sql);
console.log("Updated seed_units.sql with " + worldEaters.length + " World Eaters units.");
