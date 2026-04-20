/**
 * Curated, static Warhammer 40,000 10th Edition faction and unit data.
 * Source: Official GW indexes, codexes, and Warhammer Community datasheets.
 * No external API dependency — accurate and works offline.
 */

export interface Faction {
  name: string;
  grandAlliance: 'Imperium' | 'Chaos' | 'Xenos';
}

export const FACTIONS: Faction[] = [
  // ── IMPERIUM ────────────────────────────────────────────────────
  { name: 'Space Marines',        grandAlliance: 'Imperium' },
  { name: 'Blood Angels',         grandAlliance: 'Imperium' },
  { name: 'Dark Angels',          grandAlliance: 'Imperium' },
  { name: 'Space Wolves',         grandAlliance: 'Imperium' },
  { name: 'Black Templars',       grandAlliance: 'Imperium' },
  { name: 'Deathwatch',           grandAlliance: 'Imperium' },
  { name: 'Grey Knights',         grandAlliance: 'Imperium' },
  { name: 'Ultramarines',         grandAlliance: 'Imperium' },
  { name: 'Imperial Fists',       grandAlliance: 'Imperium' },
  { name: 'Iron Hands',           grandAlliance: 'Imperium' },
  { name: 'Raven Guard',          grandAlliance: 'Imperium' },
  { name: 'Salamanders',          grandAlliance: 'Imperium' },
  { name: 'White Scars',          grandAlliance: 'Imperium' },
  { name: 'Astra Militarum',      grandAlliance: 'Imperium' },
  { name: 'Adepta Sororitas',     grandAlliance: 'Imperium' },
  { name: 'Adeptus Custodes',     grandAlliance: 'Imperium' },
  { name: 'Adeptus Mechanicus',   grandAlliance: 'Imperium' },
  { name: 'Imperial Knights',     grandAlliance: 'Imperium' },
  { name: 'Agents of the Imperium', grandAlliance: 'Imperium' },
  // ── CHAOS ────────────────────────────────────────────────────────
  { name: 'Chaos Space Marines',  grandAlliance: 'Chaos' },
  { name: 'World Eaters',         grandAlliance: 'Chaos' },
  { name: 'Death Guard',          grandAlliance: 'Chaos' },
  { name: 'Thousand Sons',        grandAlliance: 'Chaos' },
  { name: "Emperor's Children",   grandAlliance: 'Chaos' },
  { name: 'Chaos Daemons',        grandAlliance: 'Chaos' },
  { name: 'Chaos Knights',        grandAlliance: 'Chaos' },
  // ── XENOS ────────────────────────────────────────────────────────
  { name: 'Aeldari',              grandAlliance: 'Xenos' },
  { name: 'Drukhari',             grandAlliance: 'Xenos' },
  { name: 'Orks',                 grandAlliance: 'Xenos' },
  { name: 'Necrons',              grandAlliance: 'Xenos' },
  { name: 'Tyranids',             grandAlliance: 'Xenos' },
  { name: 'Genestealer Cults',    grandAlliance: 'Xenos' },
  { name: "T'au Empire",          grandAlliance: 'Xenos' },
  { name: 'Leagues of Votann',    grandAlliance: 'Xenos' },
];

export const UNITS_BY_FACTION: Record<string, string[]> = {

  // ── SPACE MARINES ─────────────────────────────────────────────────
  'Space Marines': [
    // Characters
    'Captain in Gravis Armour', 'Captain in Phobos Armour', 'Captain in Terminator Armour',
    'Captain with Jump Pack', 'Primaris Captain',
    'Lieutenant in Phobos Armour', 'Lieutenant in Reiver Armour', 'Primaris Lieutenant',
    'Librarian', 'Librarian in Phobos Armour', 'Liturgies of Battle Chaplain', 'Chaplain',
    'Chaplain on Bike', 'Chaplain with Jump Pack',
    'Apothecary', 'Chief Apothecary', 'Apothecary Biologis',
    'Ancient', 'Primaris Ancient',
    'Techmarine', 'Master of the Forge',
    'Judiciar', 'Bladeguard Ancient',
    // Battleline
    'Intercessor Squad', 'Assault Intercessor Squad', 'Heavy Intercessor Squad',
    'Tactical Squad', 'Scout Squad',
    // Infantry
    'Infiltrator Squad', 'Incursor Squad', 'Eliminator Squad', 'Reiver Squad',
    'Hellblaster Squad', 'Eradicator Squad', 'Inceptor Squad',
    'Sternguard Veteran Squad', 'Vanguard Veteran Squad', 'Bladeguard Veterans',
    'Aggressor Squad', 'Suppressors', 'Desolation Squad', 'Infernus Squad',
    'Assault Squad', 'Devastator Squad', 'Company Heroes', 'Veteran Intercessors',
    // Terminator
    'Terminator Assault Squad', 'Terminator Squad',
    'Tartaros Terminator Squad', 'Cataphractii Terminator Squad',
    // Bikes
    'Outrider Squad', 'Attack Bike Squad', 'Bike Squad', 'Invader ATV',
    // Dreadnoughts
    'Redemptor Dreadnought', 'Brutalis Dreadnought', 'Ballistus Dreadnought',
    'Ironclad Dreadnought', 'Venerable Dreadnought', 'Dreadnought',
    // Vehicles
    'Rhino', 'Razorback', 'Impulsor', 'Repulsor', 'Repulsor Executioner', 'Drop Pod',
    'Gladiator Lancer', 'Gladiator Reaper', 'Gladiator Valiant',
    'Predator Annihilator', 'Predator Destructor',
    'Vindicator', 'Whirlwind', 'Thunderfire Cannon',
    'Land Raider', 'Land Raider Crusader', 'Land Raider Redeemer',
    'Land Speeder', 'Land Speeder Storm', 'Land Speeder Tempest',
    'Storm Speeder Hailstrike', 'Storm Speeder Hammerstrike', 'Storm Speeder Thunderstrike',
    // Aircraft
    'Stormhawk Interceptor', 'Stormtalon Gunship', 'Stormraven Gunship',
    'Fire Raptor Gunship',
  ],

  // ── BLOOD ANGELS ─────────────────────────────────────────────────
  'Blood Angels': [
    'Commander Dante', 'Mephiston', 'Tycho the Lost', 'Corbulo', 'Lemartes',
    'The Sanguinor', 'Astorath', 'Sanguinary Priest',
    'Death Company Chaplain', 'Captain with Jump Pack',
    'Death Company Marines', 'Death Company Dreadnought',
    'Sanguinary Guard', 'Sanguinary Ancient',
    'Assault Intercessor Squad', 'Intercessor Squad',
    'Baal Predator', 'Furioso Dreadnought', 'Librarian Dreadnought',
    // Inherits Space Marines units
  ],

  // ── DARK ANGELS ──────────────────────────────────────────────────
  'Dark Angels': [
    'Lion El\'Jonson', 'Supreme Grand Master Azrael', 'Ezekiel', 'Asmodai',
    'Belial', 'Sammael', 'Ravenwing Talonmaster',
    'Deathwing Knights', 'Deathwing Terminator Squad', 'Deathwing Command Squad',
    'Ravenwing Black Knights', 'Ravenwing Dark Talon', 'Ravenwing Nephilim Jetfighter',
    'Ravenwing Bike Squad', 'Ravenwing Attack Bike',
    'Intercessor Squad', 'Assault Intercessor Squad',
  ],

  // ── SPACE WOLVES ─────────────────────────────────────────────────
  'Space Wolves': [
    'Ragnar Blackmane', 'Bjorn the Fell-Handed', 'Logan Grimnar', 'Canis Wolfborn',
    'Njal Stormcaller', 'Arjac Rockfist', 'Ulrik the Slayer', 'Lukas the Trickster',
    'Wolf Lord', 'Iron Priest', 'Rune Priest', 'Wolf Guard Battle Leader',
    'Wolf Guard Terminators', 'Wolf Guard Pack', 'Blood Claws', 'Grey Hunters',
    'Long Fangs', 'Skyclaws', 'Swift Claws', 'Thunderwolf Cavalry',
    'Wulfen', 'Fenrisian Wolves', 'Hounds of Morkai',
    'Cyberwolf', 'Land Speeder Vengeance',
    'Intercessor Squad', 'Assault Intercessor Squad',
  ],

  // ── BLACK TEMPLARS ────────────────────────────────────────────────
  'Black Templars': [
    'High Marshal Helbrecht', 'The Emperor\'s Champion', 'Marshall',
    'Castellan', 'Primaris Chaplain on Bike', 'Chaplain',
    'Sword Brethren', 'Neophyte Squads', 'Initiate Squad',
    'Crusader Squad', 'Assault Intercessor Squad', 'Intercessor Squad',
    'Primaris Crusader Squad', 'Black Templars Primaris Neophytes',
    'Repulsor', 'Repulsor Executioner', 'Land Raider Crusader',
  ],

  // ── DEATHWATCH ────────────────────────────────────────────────────
  'Deathwatch': [
    'Watch Master', 'Watch Captain', 'Watch Captain in Terminator Armour',
    'Librarian', 'Chaplain',
    'Kill Team', 'Veteran Squad', 'Vanguard Veteran Squad',
    'Terminator Squad', 'Dreadnought', 'Venerable Dreadnought',
    'Intercessor Squad', 'Assault Intercessor Squad',
    'Corvus Blackstar', 'Repulsor', 'Land Raider',
  ],

  // ── GREY KNIGHTS ─────────────────────────────────────────────────
  'Grey Knights': [
    'Supreme Grand Master Kaldor Draigo', 'Brother-Captain', 'Grand Master in Nemesis Dreadknight',
    'Grand Master', 'Brotherhood Champion', 'Brother-Captain in Terminator Armour',
    'Brotherhood Librarian', 'Brotherhood Chaplain', 'Brotherhood Apothecary', 'Brotherhood Ancient',
    'Paladin Squad', 'Paladin Ancient', 'Paladins',
    'Strike Squad', 'Purgation Squad', 'Purifier Squad', 'Interceptor Squad',
    'Terminator Squad', 'Justicar',
    'Nemesis Dreadknight', 'Dreadnought', 'Venerable Dreadnought',
    'Stormraven Gunship', 'Rhino', 'Razorback',
  ],

  // ── ULTRAMARINES ─────────────────────────────────────────────────
  'Ultramarines': [
    'Marneus Calgar', 'Roboute Guilliman', 'Tigurius', 'Uriel Ventris',
    'Sicarius', 'Chronus', 'Antaro Chronus',
    'Victrix Guard', 'Honour Guard',
    'Intercessor Squad', 'Assault Intercessor Squad',
  ],

  // ── IMPERIAL FISTS ────────────────────────────────────────────────
  'Imperial Fists': [
    'Darnath Lysander',
    'Intercessor Squad', 'Assault Intercessor Squad',
    'Fists Exemplar Breacher Squad',
  ],

  // ── IRON HANDS ────────────────────────────────────────────────────
  'Iron Hands': [
    'Kardan Stronos', 'Iron Father Feirros',
    'Intercessor Squad', 'Assault Intercessor Squad',
  ],

  // ── RAVEN GUARD ───────────────────────────────────────────────────
  'Raven Guard': [
    'Kayvaan Shrike', 'Corvus Corax',
    'Intercessor Squad', 'Assault Intercessor Squad',
    'Vanguard Veteran Squad', 'Scout Squad',
  ],

  // ── SALAMANDERS ───────────────────────────────────────────────────
  'Salamanders': [
    'Tu\'Shan', 'Vulkan He\'stan',
    'Intercessor Squad', 'Assault Intercessor Squad',
    'Aggressor Squad', 'Eradicator Squad',
  ],

  // ── WHITE SCARS ───────────────────────────────────────────────────
  'White Scars': [
    'Kor\'sarro Khan',
    'Outrider Squad', 'Bike Squad', 'Attack Bike Squad',
    'Intercessor Squad', 'Assault Intercessor Squad',
  ],

  // ── ASTRA MILITARUM ───────────────────────────────────────────────
  'Astra Militarum': [
    // HQ
    'Lord Solar Leontus', 'Ursula Creed', 'Commander Pask',
    'Company Commander', 'Platoon Commander', 'Lord Commissar', 'Commissar',
    'Primaris Psyker', 'Tech-Priest Enginseer', 'Militarum Tempestus Command Squad',
    'Regimental Preacher', 'Colour Sergeant Kell', 'Gaunts Ghosts',
    'Tank Commander',
    // Infantry
    'Infantry Squad', 'Cadian Shock Troops', 'Catachan Jungle Fighters',
    'Militarum Tempestus Scions', 'Veteran Squad', 'Command Squad',
    'Conscripts', 'Ratlings', 'Bullgryns', 'Ogryns', 'Ogryn Bodyguard',
    'Rough Riders', 'Nork Deddog',
    // Heavy Weapons
    'Heavy Weapons Squad', 'Special Weapons Squad',
    // Vehicles
    'Sentinel', 'Armoured Sentinel', 'Scout Sentinel',
    'Chimera', 'Taurox', 'Taurox Prime',
    'Hellhound', 'Bane Wolf', 'Devil Dog',
    'Leman Russ Battle Tank', 'Leman Russ Demolisher', 'Leman Russ Punisher',
    'Leman Russ Vanquisher', 'Leman Russ Executioner', 'Leman Russ Exterminator',
    'Leman Russ Eradicator', 'Leman Russ Thunderer',
    'Basilisk', 'Wyvern', 'Hydra', 'Manticore', 'Deathstrike',
    'Baneblade', 'Shadowsword', 'Stormsword', 'Stormblade',
    'Hellhammer', 'Banehammer', 'Doomhammer',
    // Aircraft
    'Valkyrie', 'Vendetta',
  ],

  // ── ADEPTA SORORITAS ──────────────────────────────────────────────
  'Adepta Sororitas': [
    // Characters
    'Celestine', 'Morvenn Vahl', 'Saint Celestine',
    'Canoness', 'Junith Eruita', 'Ephrael Stern', 'Uriah Jacobus',
    'Sister Dogmata', 'Missionary', 'Hospitaller',
    'Imagifier', 'Palatine', 'Dialogus',
    // Troops
    'Battle Sisters Squad', 'Celestian Sacresants',
    // Elites
    'Sisters Repentia', 'Repentia Superior', 'Arco-flagellants',
    'Crusaders', 'Death Cult Assassins', 'Celestian Squad',
    'Dominion Squad', 'Retributor Squad', 'Zephyrim Squad',
    'Seraphim Squad', 'Novitiates', 'Penitent Engines',
    'Mortifiers', 'Castigator',
    // Vehicles
    'Immolator', 'Rhino', 'Exorcist', 'Exorcist Domine',
    'Paragon Warsuits',
    // Adepta Sororitas Dogmata - Convictions characters
    'Sister Dogmata',
  ],

  // ── ADEPTUS CUSTODES ──────────────────────────────────────────────
  'Adeptus Custodes': [
    // Characters
    'Trajann Valoris', 'Shield-Captain', 'Shield-Captain in Allarus Terminator Armour',
    'Shield-Captain on Dawneagle Jetbike', 'Valdor', 'Blade Champion',
    'Vexilus Praetor', 'Vexilus Praetor in Allarus Terminator Armour',
    'Custodian Warden', 'Sister of Silence Prosecutor',
    // Troops
    'Custodian Guard Squad', 'Custodian Warden Squad',
    'Allarus Custodians', 'Aquilan Shield',
    // Sisters of Silence
    'Prosecutors', 'Vigilators', 'Witchseekers',
    'Knight-Centura',
    // Vehicles
    'Venerable Land Raider', 'Grav-Rhino',
    'Dawneagle Jetbike Squadron', 'Vertus Praetors',
    'Caladius Grav-Tank', 'Pallas Grav-Attack', 'Coronus Grav-Carrier',
    'Telemon Heavy Dreadnought', 'Contemptor-Galatus Dreadnought', 'Contemptor-Achillus Dreadnought',
  ],

  // ── ADEPTUS MECHANICUS ────────────────────────────────────────────
  'Adeptus Mechanicus': [
    // Characters
    'Belisarius Cawl', 'Tech-Priest Dominus', 'Tech-Priest Manipulus',
    'Tech-Priest Enginseer', 'Technoarcheologist', 'Cybernetica Datasmith',
    'Tech-Priest Manipulus', 'Skitarii Marshal',
    // Troops
    'Skitarii Rangers', 'Skitarii Vanguard',
    // Elites
    'Sicarian Ruststalkers', 'Sicarian Infiltrators',
    'Corpuscarii Electro-Priests', 'Fulgurite Electro-Priests',
    'Pteraxii Sterylizors', 'Pteraxii Skystalkers',
    'Serberys Raiders', 'Serberys Sulphurhounds',
    'Ironstrider Ballistarii', 'Sydonian Dragoons',
    // Heavy Support
    'Onager Dunecrawler', 'Kastelan Robots', 'Cognis Manipulus',
    'Skorpius Disintegrator', 'Skorpius Dunerider',
    // Titans / Super-Heavies
    'Archaeopter Fusilave', 'Archaeopter Stratoraptor', 'Archaeopter Transvector',
    'Dunerider', 'Ballistarii', 'Ironstrider',
  ],

  // ── IMPERIAL KNIGHTS ──────────────────────────────────────────────
  'Imperial Knights': [
    'Knight Paladin', 'Knight Errant', 'Knight Crusader', 'Knight Gallant',
    'Knight Warden', 'Knight Preceptor', 'Knight Acheron', 'Knight Castigator',
    'Knight Styrix', 'Knight Magaera', 'Knight Moirax',
    'Armiger Warglaive', 'Armiger Helverin',
    'Canis Rex', 'Freeblade',
    'Cerastus Knight-Lancer', 'Cerastus Knight-Castigator',
    'Acastus Knight Porphyrion', 'Acastus Knight Asterius',
  ],

  // ── AGENTS OF THE IMPERIUM ────────────────────────────────────────
  'Agents of the Imperium': [
    'Inquisitor', 'Inquisitor in Terminator Armour', 'Inquisitor on Bike',
    'Kyria Draxus', 'Greyfax',
    'Vindicare Assassin', 'Callidus Assassin', 'Culexis Assassin', 'Eversor Assassin',
    'Officio Assassinorum',
    'Celestine & Geminae Superia',
    'Lord Inquisitor Kyria Draxus',
    'Militarum Tempestus Scions', 'Tempestus Command Squad',
    'Space Marine Heroes',
  ],

  // ── CHAOS SPACE MARINES ───────────────────────────────────────────
  'Chaos Space Marines': [
    // Characters
    'Abaddon the Despoiler', 'Haarken Worldclaimer', 'Lucius the Eternal',
    'Chaos Lord', 'Chaos Lord in Terminator Armour', 'Chaos Lord on Bike',
    'Sorcerer', 'Sorcerer in Terminator Armour',
    'Dark Apostle', 'Master of Executions', 'Master of Possession',
    'Warpsmith', 'Chaos Sorcerer',
    // Troops
    'Chaos Space Marines', 'Legionaries', 'Cultists',
    'Cultist Mob', 'Accursed Cultists',
    // Elites
    'Chaos Terminators', 'Chosen', 'Possessed',
    'Chaos Spawn', 'Mutilators', 'Obliterators',
    'Raptors', 'Warp Talons', 'Bikers',
    'Havocs', 'Chaos Predator', 'Vindicator', 'Land Raider',
    // Engines
    'Defiler', 'Maulerfiend', 'Forgefiend', 'Venomcrawler',
    'Heldrake', 'Helbrute',
    'Daemon Prince', 'Daemon Prince with Wings',
    // Vehicles
    'Rhino', 'Predator Annihilator', 'Predator Destructor',
    'Chaos Land Raider', 'Chaos Rhino', 'Chaos Vindicator',
    'Chaos Sicaran Battle Tank',
  ],

  // ── WORLD EATERS ─────────────────────────────────────────────────
  'World Eaters': [
    'Angron', 'Kharn the Betrayer',
    'World Eaters Lord', 'Lord on Juggernaut',
    'Master of Executions', 'Chaos Lord',
    'Jakhals', 'Berzerkers', 'Exalted Eightbound', 'Eightbound',
    'World Eaters Spawn', 'World Eaters Daemon Prince',
    'Terminators', 'Helbrute',
    'Rhino', 'Land Raider', 'Defiler', 'Maulerfiend',
    'Skull Altar',
  ],

  // ── DEATH GUARD ───────────────────────────────────────────────────
  'Death Guard': [
    'Mortarion', 'Typhus',
    'Chaos Lord of Nurgle', 'Death Guard Chaos Lord',
    'Malignant Plaguecaster',  'Plague Surgeon', 'Foul Blightspawn',
    'Noxious Blightbringer', 'Lord of Virulence', 'Lord of Contagion',
    'Biologus Putrifier', 'Tallyman',
    'Plague Marines', 'Poxwalkers', 'Cultists of Nurgle',
    'Blightlord Terminators', 'Deathshroud Bodyguard',
    'Myphitic Blight-Haulers', 'Foetid Bloat-Drones', 'Plagueburst Crawlers',
    'Bloat-Drone', 'Helbrute', 'Chaos Spawn',
    'Rhino', 'Predator',
    'Daemon Prince of Nurgle', 'Daemon of Nurgle',
  ],

  // ── THOUSAND SONS ─────────────────────────────────────────────────
  'Thousand Sons': [
    'Magnus the Red', 'Ahzek Ahriman',
    'Exalted Sorcerer', 'Sorcerer', 'Infernal Master',
    'Sorcerer in Terminator Armour',
    'Rubric Marines', 'Scarab Occult Terminators',
    'Tzaangors', 'Tzaangor Enlightened', 'Tzaangor Shaman',
    'Mutalith Vortex Beast', 'Chaos Spawn',
    'Helbrute',
    'Daemon Prince of Tzeentch',
    'Rhino',
  ],

  // ── EMPEROR'S CHILDREN ────────────────────────────────────────────
  "Emperor's Children": [
    'Fulgrim', 'Lucius the Eternal',
    'Lord of Pain', 'Chaos Lord', 'Sorcerer',
    'Noise Marines', 'Chaos Space Marines', 'Cultists',
    'Terminators', 'Possessed', 'Raptors',
    'Chaos Spawn', 'Daemon Prince',
    'Rhino', 'Helbrute', 'Predator',
  ],

  // ── CHAOS DAEMONS ─────────────────────────────────────────────────
  'Chaos Daemons': [
    // Khorne
    'Skarbrand', 'Bloodthirster', 'Skulltaker',
    'Bloodmaster', 'Skullmaster', 'Karanak',
    'Bloodletters', 'Flesh Hounds', 'Bloodcrushers',
    'Skull Cannon', 'Blood Throne', 'Burning Chariot of Khorne',
    // Tzeentch
    'Kairos Fateweaver', 'Lord of Change', 'Changecaster',
    'Fluxmaster', 'Fateskimmer',
    'Pink Horrors', 'Blue Horrors', 'Brimstone Horrors',
    'Flamers', 'Screamers', 'Exalted Flamer',
    'Burning Chariot of Tzeentch',
    // Nurgle
    'Rotigus', 'Great Unclean One', 'Poxbringer',
    'Sloppity Bilepiper', 'Spoilpox Scrivener', 'Epidemius',
    'Plaguebearers', 'Nurglings', 'Beasts of Nurgle',
    'Rot Fly', 'Plague Drones',
    // Slaanesh
    'The Masque', 'Keeper of Secrets', 'Infernal Enrapturess',
    'Shalaxi Helbane', 'Syll\'Esske',
    'Daemonettes', 'Seekers', 'Fiends',
    'Seeker Chariot', 'Hellflayer', 'Exalted Seeker Chariot',
    // Undivided
    'Be\'lakor', 'Daemon Prince',
  ],

  // ── CHAOS KNIGHTS ─────────────────────────────────────────────────
  'Chaos Knights': [
    'Vashtorr the Arkifane',
    'War Dog Executioner', 'War Dog Brigand', 'War Dog Karnivore',
    'War Dog Huntsman', 'War Dog Stalker',
    'Knight Abominant', 'Knight Rampager', 'Knight Despoiler',
    'Knight Tyrant', 'Knight Desecrator',
    'Chaos Knight',
  ],

  // ── AELDARI ───────────────────────────────────────────────────────
  'Aeldari': [
    // Craftworlds leadership
    'Eldrad Ulthran', 'Yvraine', 'The Visarch', 'The Yncarne',
    'Farseer', 'Autarch', 'Autarch Skyrunner', 'Autarch on Foot', 'Warlock',
    'Spiritseer', 'Avatar of Khaine',
    // Aspects
    'Dire Avengers', 'Fire Dragons', 'Howling Banshees', 'Striking Scorpions',
    'Dark Reapers', 'Warp Spiders', 'Swooping Hawks', 'Shining Spears',
    'Crimson Hunters', 'Crimson Hunter Exarch',
    // Other troops
    'Guardians Defender Squad', 'Storm Guardian Squad', 'Rangers', 'Wraithguard', 'Wraithblades',
    // Heavy
    'Wraithlord', 'Fire Prism', 'Night Spinner', 'War Walker',
    'Falcon', 'Wave Serpent', 'Vyper Squadron',
    'Hemlock Wraithfighter',
    'Wraithknight', 'Revenant Titan',
    // Harlequins
    'Troupe Master', 'Shadowseer', 'Death Jester', 'Solitaire',
    'Troupe', 'Skyweavers', 'Starweavers', 'Voidweavers',
    // Ynnari
    'Spiritseer', 'Yvraine', 'The Visarch', 'The Yncarne',
  ],

  // ── DRUKHARI ──────────────────────────────────────────────────────
  'Drukhari': [
    // Archons / Leadership
    'Supreme Overlord Asdrubael Vect', 'Archon', 'Haemonculus', 'Succubus',
    'Beastmaster', 'Lhamean', 'Ur-Ghul', 'Medusae', 'Sslyth',
    // Kabalite Warriors
    'Kabalite Warriors', 'Kabalite Trueborn', 'Sybarites',
    // Wyches
    'Wyches', 'Bloodbride', 'Hekatrix', 'Hekatrix Bloodbrides',
    // Wych Cults
    'Hellions', 'Reavers', 'Shardnets',
    // Haemonculi Covens
    'Wracks', 'Grotesques', 'Talos Pain Engine', 'Cronos Parasite Engine',
    // Heavy
    'Ravager', 'Venom', 'Raider',
    'Kabalite Warrior',
    'Scourges',
    'Razorwing Jetfighter', 'Voidraven Bomber',
  ],

  // ── ORKS ──────────────────────────────────────────────────────────
  'Orks': [
    // Characters
    'Ghazghkull Thraka', 'Makari', 'Zodgrod Wortsnagga',
    'Boss Snikrot', 'Boss Zagstruk', 'Mad Dok Grotsnik',
    'Warboss', 'Warboss on Warbike', 'Painboy', 'Weirdboy', 'Wurrboy',
    'Big Mek', 'Big Mek in Mega Armour', 'Mek', 'Mek with Shokk Attack Gun',
    'Nob on Smasha Squig', 'Mozrog Skragbad',
    // Troops
    'Boyz', 'Gretchin', 'Beast Snagga Boyz',
    // Elites
    'Nobz', 'Nobz on Warbikes', 'Kommandos',
    'Meganobz', 'Flash Gitz', 'Burna Boyz', 'Tankbustas', 'Lootas',
    'Storm Boyz', 'Stormboyz', 'Deff Dread', 'Killa Kans', 'Gorkanaut', 'Morkanaut',
    'Painbringers', 'Squighog Boyz', 'Nob on Smasha Squig',
    // Vehicles
    'Battlewagon', 'Trukk', 'Warbikers', 'Warbikes',
    'Deffkoptas', 'Bonebreaka', 'Bonecrunchas',
    'Gunwagon', 'Looted Wagon',
    // Artillery
    'Mek Gunz', 'Smasha Gun', 'Traktor Kannon', 'Kustom Mega-Kannon',
    'Dakkajet', 'Burna-Bommer', 'Blitza-Bommer', 'Wazbom Blastajet',
  ],

  // ── NECRONS ───────────────────────────────────────────────────────
  'Necrons': [
    // Characters
    'The Szarekhan Dynasty', 'Szarekh The Silent King', 'Imotekh the Stormlord',
    'Illuminor Szeras', 'Trazyn the Infinite', 'Orikan the Diviner',
    'Nemesor Zahndrekh', 'Vargard Obyron',
    'Overlord', 'Overlord with Translocation Shroud', 'Royal Warden',
    'Cryptek', 'Psychomancer', 'Technomancer', 'Plasmancer', 'Chronomancer',
    'Lord', 'Lokhust Lord', 'Skorpekh Lord',
    // Troops
    'Necron Warriors', 'Immortals',
    // Elites
    'Triarch Praetorians', 'Triarch Stalker',
    'Deathmarks', 'Lychguard', 'Flayed Ones',
    'Wraiths', 'Tomb Blades', 'Destroyers', 'Heavy Destroyers',
    'Lokhust Destroyers', 'Lokhust Heavy Destroyers',
    'Skorpekh Destroyers', 'Ophydian Destroyers',
    'Canoptek Scarabs', 'Canoptek Spyders', 'Canoptek Wraiths',
    'Canoptek Acanthrites', 'Canoptek Reanimator',
    'C\'tan Shard of the Deceiver', 'C\'tan Shard of the Nightbringer',
    'C\'tan Shard of the Void Dragon', 'C\'tan Shard of the Mephet\'ran',
    // Heavy
    'Annihilation Barge', 'Catacomb Command Barge', 'Doomsday Ark',
    'Ghost Ark', 'Doomsday Ark', 'Tesseract Ark',
    'Night Scythe', 'Doom Scythe',
    'Monolith', 'Obelisk', 'Tesseract Vault',
  ],

  // ── TYRANIDS ──────────────────────────────────────────────────────
  'Tyranids': [
    // Characters
    'The Swarmlord', 'Hive Tyrant', 'Winged Hive Tyrant',
    'Old One Eye', 'Norn Emissary', 'Norn Assimilator',
    'Neurothrope', 'Tervigon', 'Parasite of Mortrex',
    'Broodlord', 'Deathleaper', 'The Red Terror',
    'Tyranid Prime', 'Neurotyrant',
    // Troops
    'Termagants', 'Hormagaunts', 'Ripper Swarms', 'Gargoyles',
    // Elites
    'Genestealers', 'Raveners', 'Warriors', 'Tyranid Warriors',
    'Zoanthropes', 'Neurothrope', 'Venomthropes',
    'Lictors', 'Pyrovores', 'Hive Guard',
    // Large creatures
    'Carnifexes', 'Screamer-Killer', 'Stone Crusher Carnifex',
    'Maleceptor', 'Toxicrene', 'Exocrine', 'Haruspex',
    'Trygon', 'Trygon Prime', 'Mawloc', 'Tyrannofex',
    'Hierodule', 'Dimachaeron',
    // Flyers
    'Harpy', 'Hive Crone',
  ],

  // ── GENESTEALER CULTS ─────────────────────────────────────────────
  'Genestealer Cults': [
    // Characters
    'The Patriarch', 'Magus', 'Primus', 'Nexos', 'Clamavus',
    'Locus', 'Biophagus', 'Jackal Alphus', 'Kelermorph',
    'Abominant',
    // Troops
    'Acolyte Hybrids', 'Neophyte Hybrids', 'Hybrid Metamorphs', 'Aberrants',
    // Vehicles
    'Goliath Rockgrinder', 'Goliath Truck', 'Leman Russ (Cult)',
    'Achilles Ridgerunner', 'Mining Laser Sentinel', 'Atalan Jackals',
    // Brood Brothers
    'Brood Brothers Infantry Squad', 'Brood Brothers Heavy Weapons Squad',
    'Brood Brothers Command Squad',
    'Cult Ambush',
  ],

  // ── T'AU EMPIRE ───────────────────────────────────────────────────
  "T'au Empire": [
    // Characters
    'Shadowsun', 'Farsight', 'Longstrike',
    'Commander in Coldstar Battlesuit', 'Commander in Enforcer Battlesuit',
    'Commander in Firestorm Battlesuit', 'Commander in XV86 Coldstar Battlesuit',
    'Commander Farsight', 'Commander Shadowsun',
    'Aun\'va', 'Aun\'shi', 'Ethereal', 'Ethereal on Hover Drone',
    'Cadre Fireblade',
    // Infantry
    'Fire Warriors (Strike Team)', 'Fire Warriors (Breacher Team)',
    'Kroot Carnivores', 'Kroot Hounds', 'Kroot Shaper',
    'Krootox Riders', 'Longstrike',
    'Vespid Stingwings',
    // Battlesuits
    'XV8 Crisis Battlesuits', 'XV8-02 Crisis Iridescent Battlesuit',
    'XV25 Stealth Battlesuits', 'XV88 Broadside Battlesuits',
    'XV95 Ghostkeel Battlesuit', 'XV104 Riptide Battlesuit',
    'XV107 R\'varna Battlesuit', 'XV109 Y\'vahra Battlesuit',
    'XV46 Vanguard Void Suit', 'XV46-1',
    'KV128 Stormsurge', 'KX139 Ta\'unar Supremacy Armour',
    // Drones
    'Pathfinder Team', 'Drone Squad',
    // Vehicles
    'Devilfish', 'Hammerhead Gunship', 'Sky Ray Gunship', 'Piranha',
    // Aircraft
    'Razorshark Strike Fighter', 'Sun Shark Bomber', 'Tiger Shark',
    // Auxiliaries
    'Dahyak Grekh',
  ],

  // ── LEAGUES OF VOTANN ─────────────────────────────────────────────
  'Leagues of Votann': [
    // Characters
    'Ûthar the Destined', 'Grimnyr', 'Kâhl', 'Brôkhyr Iron-Master',
    'Einhyr Champion', 'Brôkhyr Thunderkyn',
    // Troops
    'Hearthkyn Warriors', 'Einhyr Hearthguard', 'Hernkyn Pioneers',
    // Heavy
    'Cthonian Beserks', 'Sagitaur', 'Hekaton Land Fortress',
    'Colossus',
    // Vehicles
    'Hernkyn Yaegir', 'Pioneers',
  ],
};

/** Returns all faction names sorted alphabetically within each grand alliance. */
export function getFactionsGrouped(): Record<string, string[]> {
  const grouped: Record<string, string[]> = { Imperium: [], Chaos: [], Xenos: [] };
  for (const f of FACTIONS) {
    grouped[f.grandAlliance].push(f.name);
  }
  
  grouped.Imperium.sort();
  grouped.Chaos.sort();
  grouped.Xenos.sort();
  
  return grouped;
}

/** 
 * Primary army categories for high-level selection. 
 */
export const CORE_FACTIONS = [
  "Space Marines",
  "Astra Militarum",
  "Adepta Sororitas",
  "Adeptus Custodes",
  "Adeptus Mechanicus",
  "Imperial Knights",
  "Agents of the Imperium",
  "Chaos Space Marines",
  "World Eaters",
  "Death Guard",
  "Thousand Sons",
  "Chaos Daemons",
  "Chaos Knights",
  "Aeldari",
  "Drukhari",
  "Orks",
  "Necrons",
  "Tyranids",
  "Genestealer Cults",
  "T'au Empire",
  "Leagues of Votann"
];

/**
 * Mapping of core factions to their specific sub-factions/variations.
 */
export const SUBFACTIONS_MAP: Record<string, string[]> = {
  "Space Marines": [
    "Ultramarines", "Blood Angels", "Dark Angels", "Space Wolves", 
    "Black Templars", "Deathwatch", "Grey Knights", "Imperial Fists", 
    "Iron Hands", "Raven Guard", "Salamanders", "White Scars"
  ],
  "Chaos Space Marines": [
    "Emperor's Children", "Black Legion", "Iron Warriors", 
    "Night Lords", "Word Bearers", "Alpha Legion"
  ],
  "Orks": [
    "Goffs", "Bad Moons", "Evil Sunz", "Snakebites", 
    "Deathskulls", "Blood Axes", "Freebooterz"
  ],
  "Tyranids": [
    "Hive Fleet Leviathan", "Hive Fleet Kraken", "Hive Fleet Behemoth", 
    "Hive Fleet Jormungandr", "Hive Fleet Hydra", "Hive Fleet Kronos"
  ],
  "Necrons": [
    "Szarekhan Dynasty", "Sautekh Dynasty", "Mephrit Dynasty", 
    "Novokh Dynasty", "Nephrekh Dynasty"
  ],
  "Astra Militarum": [
    "Cadian", "Catachan", "Krieg", "Tallarn", "Armageddon Steel Legion", "Tanith"
  ],
  "Aeldari": [
    "Biel-Tan", "Ulthwé", "Saim-Hann", "Iyanden", "Alaitoc", "Ynnari"
  ],
  "T'au Empire": [
    "T'au Sept", "Farsight Enclaves", "Vior'la Sept", "Sa'cea Sept", "Dal'yth Sept"
  ]
};
