import type { CrewMember, CrewRole, StatName, SkillName, StatValue } from '../types';

// ─── Mothership 1e Pre-Generated Iconic Squad ────────────────────────────────

export const PREGEN_CREW: CrewMember[] = [
  {
    id: 'crew-pregen-1',
    name: 'Sgt. Vance',
    role: 'MARINE',
    stats: { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 1, PSYCH: 1 },
    skills: {
      ATHLETICS: 1, COMBAT: 2, ENGINEERING: 0, PILOTING: 0,
      COMPUTERS: 0, SCIENCE: 0, MEDICINE: 0, NAVIGATION: 0,
      PERCEPTION: 1, PERSUASION: 0, STEALTH: 0, SURVIVAL: 1,
    },
    stress: 2,
    sanity: 8,
    isBreakdown: false,
    health: 16,
    maxHealth: 16,
    wounds: 0,
    maxWounds: 3,
    loadout: 'Pulse Rifle (3d10 DMG), Standard Battle Dress, Frag Grenade x2',
    patch: "I'M NOT A DOCTOR BUT I'LL TAKE A LOOK",
    trinket: 'Spent brass casing with notch on a steel chain',
  },
  {
    id: 'crew-pregen-2',
    name: 'Dr. Aris',
    role: 'SCIENTIST',
    stats: { STRENGTH: 1, DEXTERITY: 1, INTELLIGENCE: 3, PSYCH: 2 },
    skills: {
      ATHLETICS: 0, COMBAT: 0, ENGINEERING: 0, PILOTING: 0,
      COMPUTERS: 1, SCIENCE: 2, MEDICINE: 2, NAVIGATION: 0,
      PERCEPTION: 1, PERSUASION: 1, STEALTH: 0, SURVIVAL: 0,
    },
    stress: 2,
    sanity: 8,
    isBreakdown: false,
    health: 12,
    maxHealth: 12,
    wounds: 0,
    maxWounds: 2,
    loadout: 'Bio-scanner, Scalpel, Stimpak x3, Hazard Suit',
    patch: 'BAD NEWS: IT IS CONTAGIOUS',
    trinket: 'Specimen vial containing luminescent amoeba',
  },
  {
    id: 'crew-pregen-3',
    name: 'Unit 7-K',
    role: 'ANDROID',
    stats: { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 2, PSYCH: 1 },
    skills: {
      ATHLETICS: 0, COMBAT: 0, ENGINEERING: 2, PILOTING: 1,
      COMPUTERS: 2, SCIENCE: 1, MEDICINE: 0, NAVIGATION: 1,
      PERCEPTION: 1, PERSUASION: 0, STEALTH: 0, SURVIVAL: 0,
    },
    stress: 0, // Android cold logic
    sanity: 10,
    isBreakdown: false,
    health: 18,
    maxHealth: 18,
    wounds: 0,
    maxWounds: 3,
    loadout: 'Foam Gun, Heavy Crowbar, Diagnostic Datapad, Reinforced Chassis',
    patch: 'PROPERTY OF WEYLAND-YUTANI',
    trinket: 'Burned-out optical sensor from unknown model',
  },
  {
    id: 'crew-pregen-4',
    name: 'Cole',
    role: 'TEAMSTER',
    stats: { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 1, PSYCH: 2 },
    skills: {
      ATHLETICS: 1, COMBAT: 0, ENGINEERING: 1, PILOTING: 2,
      COMPUTERS: 0, SCIENCE: 0, MEDICINE: 0, NAVIGATION: 1,
      PERCEPTION: 1, PERSUASION: 0, STEALTH: 0, SURVIVAL: 1,
    },
    stress: 2,
    sanity: 8,
    isBreakdown: false,
    health: 14,
    maxHealth: 14,
    wounds: 0,
    maxWounds: 2,
    loadout: 'Industrial Cutting Torch, Rigging Cable, Hazard Rig Vacsuit',
    patch: "SMILE: IT'S YOUR LAST DAY",
    trinket: 'Lucky weighted pair of metal dice',
  },
];

// ─── Name, Loadout, Patch & Trinket Tables ────────────────────────────────────

const FIRST_NAMES = [
  'Ripley', 'Dallas', 'Lambert', 'Brett', 'Parker', 'Kane', 'Ash', 'Hicks',
  'Vasquez', 'Hudson', 'Gorman', 'Bishop', 'Burke', 'Apone', 'Dietrich',
  'Frost', 'Crowe', 'Wierzbowski', 'Spunkmeyer', 'Ferro', 'Novak', 'Sterling',
  'Chen', 'Karras', 'Oakes', 'Vance', 'Mercer', 'Dixon', 'Rowan', 'Kowalski',
];

const LAST_NAMES = [
  'Cross', 'Vance', 'Krell', 'Stone', 'Chen', 'Winter', 'Mercer', 'Holloway',
  'Shaw', 'Janek', 'Fifield', 'Millburn', 'Cobb', 'Tarkin', 'Solomon',
  'Geller', 'Nakamura', 'Volkov', 'Jansen', 'McKenna', 'Thorne', 'Sinclair',
];

const ANDROID_DESIGNATIONS = [
  'Unit 3-X', 'Ash-09', 'Bishop-4', 'Call-7', 'David-8', 'Walter-1',
  'Echo-99', 'Cipher-3', 'Unit 7-K', 'Aria-6', 'Nexus-5', 'Zero-One',
];

const MARINE_LOADOUTS = [
  'Pulse Rifle (3d10 DMG), Standard Battle Dress, Frag Grenade x2',
  'Combat Shotgun (2d10 DMG), Bayonet, Kevlar Flak Vest',
  'Smart SMG (2d10 DMG), Motion Tracker, Combat Stims x2',
  'Heavy Machine Gun (4d10 DMG), Bipod, Extended Magazine',
];

const SCIENTIST_LOADOUTS = [
  'Bio-scanner, Scalpel, Stimpak x3, Hazard Suit',
  'Chemical Analyzer, Tranquilizer Dart Gun, Field Lab Kit',
  'Handheld Specimen Containment Unit, Laser Scalpel, Radiation Suit',
  'Diagnostic Datapad, Syringe Gun, Broad-Spectrum Antidotes',
];

const ANDROID_LOADOUTS = [
  'Foam Gun, Heavy Crowbar, Diagnostic Datapad, Reinforced Chassis',
  'Shock Baton, Fiber-Optic Cable Scanner, Internal Comm Relays',
  'Cutting Shears, Magnetic Boots, Micro-Welder, Heavy Duty Frame',
];

const TEAMSTER_LOADOUTS = [
  'Industrial Cutting Torch, Rigging Cable, Hazard Rig Vacsuit',
  'Nail Gun, Heavy Wrench, Structural Patch Kit, Toolbelt',
  'Hydraulic Clamp, Flare Gun x4, Insulated Work Coveralls',
  'Plasma Cutter, Magnetic Tether, Heavy Reinforced Boots',
];

const TRINKETS = [
  'Spent brass casing with notch on a steel chain',
  'Antique Zippo lighter with scratched skull',
  'Preserved eyeball floating in an alcohol vial',
  'Harmonica with dented brass casing',
  'Cracked hologram family photo',
  'Alien chitin fragment carved into a 6-sided die',
  'Miniature chess set with missing white king',
  'Silver flask engraved "DO NOT DRINK"',
  'Dog tags from a scuttled deep-space frigate',
  'Cassette tape containing static and faint whispers',
  'Pair of weighted tungsten dice',
  'Small dried flower sealed in laminated plastic',
  'Faded mission patch from a classified black-ops op',
  'Petrified tooth of an unknown macro-organism',
];

const PATCHES = [
  "SMILE: IT'S YOUR LAST DAY",
  "I'M NOT A DOCTOR BUT I'LL TAKE A LOOK",
  'BAD NEWS: IT IS CONTAGIOUS',
  'PROPERTY OF WEYLAND-YUTANI',
  'MEAT ME IN THE AIRLOCK',
  "CAN'T OUTRUN A VACUUM",
  'FRONT TOWARDS ENEMY',
  'SURVIVE. SOLVE. SAVE. (CHOOSE NONE)',
  'PLEASE DO NOT FEED THE ANOMALIES',
  'BORN TO DECOMPRESS',
  'HIGH RISK // ZERO RETURN',
  'KEEP CALM AND VENT ATMOSPHERE',
  'AUTHORIZED HAZARD PERSONNEL ONLY',
  'EXPIRATION DATE: UNKNOWN',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Quick Crew Roll Generator ───────────────────────────────────────────────

export function generateQuickCrewMember(role: CrewRole, index: number): CrewMember {
  const isAndroid = role === 'ANDROID';
  const name = isAndroid
    ? pickRandom(ANDROID_DESIGNATIONS)
    : `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;

  // Roll stats (0-3 scale mapped to role strengths)
  let stats: Record<StatName, StatValue>;
  let loadout: string;
  let maxWounds = 2;

  switch (role) {
    case 'MARINE':
      stats = { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 1, PSYCH: 1 };
      loadout = pickRandom(MARINE_LOADOUTS);
      maxWounds = 3;
      break;
    case 'SCIENTIST':
      stats = { STRENGTH: 1, DEXTERITY: 1, INTELLIGENCE: 3, PSYCH: 2 };
      loadout = pickRandom(SCIENTIST_LOADOUTS);
      maxWounds = 2;
      break;
    case 'ANDROID':
      stats = { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 2, PSYCH: 1 };
      loadout = pickRandom(ANDROID_LOADOUTS);
      maxWounds = 3;
      break;
    case 'TEAMSTER':
    default:
      stats = { STRENGTH: 2, DEXTERITY: 2, INTELLIGENCE: 1, PSYCH: 2 };
      loadout = pickRandom(TEAMSTER_LOADOUTS);
      maxWounds = 2;
      break;
  }

  // Base Health: 1d10 + 10 (range 11-20)
  const health = Math.floor(Math.random() * 10) + 11;
  const stress = isAndroid ? 0 : 2;

  // Build basic skills
  const skills: Record<SkillName, number> = {
    ATHLETICS: role === 'MARINE' || role === 'TEAMSTER' ? 1 : 0,
    COMBAT: role === 'MARINE' ? 2 : 0,
    ENGINEERING: role === 'ANDROID' ? 2 : role === 'TEAMSTER' ? 1 : 0,
    PILOTING: role === 'TEAMSTER' ? 2 : role === 'ANDROID' ? 1 : 0,
    COMPUTERS: role === 'ANDROID' ? 2 : role === 'SCIENTIST' ? 1 : 0,
    SCIENCE: role === 'SCIENTIST' ? 2 : role === 'ANDROID' ? 1 : 0,
    MEDICINE: role === 'SCIENTIST' ? 2 : 0,
    NAVIGATION: role === 'TEAMSTER' ? 1 : 0,
    PERCEPTION: 1,
    PERSUASION: role === 'SCIENTIST' ? 1 : 0,
    STEALTH: 0,
    SURVIVAL: role === 'MARINE' || role === 'TEAMSTER' ? 1 : 0,
  };

  return {
    id: `crew-roll-${Date.now()}-${index}`,
    name,
    role,
    stats,
    skills,
    stress,
    sanity: 10 - stress,
    isBreakdown: false,
    health,
    maxHealth: health,
    wounds: 0,
    maxWounds,
    loadout,
    patch: pickRandom(PATCHES),
    trinket: pickRandom(TRINKETS),
  };
}

/**
 * Generate a complete fresh 4-person squad (Marine, Scientist, Android, Teamster).
 */
export function generateQuickCrewSquad(): CrewMember[] {
  const roles: CrewRole[] = ['MARINE', 'SCIENTIST', 'ANDROID', 'TEAMSTER'];
  return roles.map((role, i) => generateQuickCrewMember(role, i));
}
