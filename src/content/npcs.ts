import type { NPC, NPCType, AdventureTone, AdventureSetting } from '../types';

// ─── Procedural NPC Generator ────────────────────────────────────────────────

const THREAT_NAMES = [
  'The Devourer', 'Subject 7', 'The Stowaway', 'The Mimic',
  'The Watcher', 'Entity X', 'The Infected', 'The Hollow',
  'The Swarm', 'The Architect', 'The Echo', 'The Wraith',
];

const ALLY_NAMES = [
  'Dr. Chen', 'Commander Reyes', 'Engineer Okafor', 'Lt. Petrov',
  'Survivor 12', 'The Captain', 'The Medic', 'The Pilot',
  'Dr. Vasquez', 'Chief Tanaka', 'The Engineer', 'The Scout',
];

const NEUTRAL_NAMES = [
  'The Trader', 'The Wanderer', 'The Scholar', 'The Mercenary',
  'The Hermit', 'The Navigator', 'The Mechanic', 'The Observer',
];

const THREAT_DESCRIPTIONS = [
  'A hostile entity with unknown origins.',
  'A creature that feeds on fear.',
  'A former crew member, changed beyond recognition.',
  'An alien intelligence with hostile intent.',
  'A manifestation of the ship\'s dark secrets.',
];

const ALLY_DESCRIPTIONS = [
  'A survivor with crucial information.',
  'A crew member who knows the ship\'s secrets.',
  'A scientist studying the anomaly.',
  'A soldier who can help fight the threat.',
];

const NEUTRAL_DESCRIPTIONS = [
  'A mysterious figure with their own agenda.',
  'A trader offering questionable deals.',
  'A wanderer who has seen many worlds.',
];

export function generateNPCs(tone: AdventureTone, setting: AdventureSetting, count: number): NPC[] {
  const npcs: NPC[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const type = generateNPCType(tone);
    const name = generateUniqueName(type, usedNames);
    const description = generateDescription(type);

    npcs.push({
      id: `npc-${i}`,
      name,
      type,
      description,
      isAlive: true,
      stress: type === 'threat' ? Math.floor(Math.random() * 5) + 3 : undefined,
    });
  }

  return npcs;
}

function generateNPCType(tone: AdventureTone): NPCType {
  const roll = Math.random();
  if (tone === 'horror') {
    if (roll < 0.4) return 'threat';
    if (roll < 0.7) return 'ally';
    return 'neutral';
  }
  if (tone === 'action') {
    if (roll < 0.5) return 'threat';
    if (roll < 0.8) return 'ally';
    return 'neutral';
  }
  if (tone === 'mystery') {
    if (roll < 0.2) return 'threat';
    if (roll < 0.5) return 'ally';
    return 'neutral';
  }
  // exploration
  if (roll < 0.2) return 'threat';
  if (roll < 0.4) return 'ally';
  return 'neutral';
}

function generateUniqueName(type: NPCType, used: Set<string>): string {
  const names = type === 'threat' ? THREAT_NAMES : type === 'ally' ? ALLY_NAMES : NEUTRAL_NAMES;
  const available = names.filter((n) => !used.has(n));
  const name = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : `${type.charAt(0).toUpperCase() + type.slice(1)} ${used.size + 1}`;
  used.add(name);
  return name;
}

function generateDescription(type: NPCType): string {
  const descriptions = type === 'threat' ? THREAT_DESCRIPTIONS
    : type === 'ally' ? ALLY_DESCRIPTIONS
    : NEUTRAL_DESCRIPTIONS;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
