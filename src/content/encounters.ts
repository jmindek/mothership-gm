import type { Encounter, EncounterType, AdventureTone, AdventureSetting } from '../types';

// ─── Procedural Encounter Generator ──────────────────────────────────────────

const THREAT_ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  { type: 'threat', title: 'Alien Creature', description: 'A hostile alien creature emerges from the shadows.', difficulty: 3, stressOnFailure: 2, stressOnSuccess: 1 },
  { type: 'threat', title: 'Boarders', description: 'Unknown entities have boarded the ship.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
  { type: 'threat', title: 'Security Breach', description: 'An intruder has bypassed the security systems.', difficulty: 2, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'threat', title: 'Hostile AI', description: 'The ship\'s AI has turned hostile.', difficulty: 3, stressOnFailure: 3, stressOnSuccess: 1 },
  { type: 'threat', title: 'Parasite', description: 'A parasitic organism has infected a crew member.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 1 },
];

const ENVIRONMENT_ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  { type: 'environment', title: 'Hull Breach', description: 'A hull breach threatens the ship.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
  { type: 'environment', title: 'Power Failure', description: 'The ship loses power in a critical section.', difficulty: 2, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'environment', title: 'Toxic Atmosphere', description: 'Toxic gas fills a section of the ship.', difficulty: 3, stressOnFailure: 3, stressOnSuccess: 1 },
  { type: 'environment', title: 'Extreme Cold', description: 'Temperature drops to lethal levels.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
  { type: 'environment', title: 'Radiation Leak', description: 'Radiation levels are rising.', difficulty: 3, stressOnFailure: 3, stressOnSuccess: 1 },
];

const SOCIAL_ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  { type: 'social', title: 'Mutiny', description: 'Crew members are turning against each other.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
  { type: 'social', title: 'Diplomatic Contact', description: 'First contact with an alien species.', difficulty: 2, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'social', title: 'Crew Conflict', description: 'Tensions flare between crew members.', difficulty: 1, stressOnFailure: 1, stressOnSuccess: 0 },
];

const PUZZLE_ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  { type: 'puzzle', title: 'Ancient Terminal', description: 'A terminal with an unknown encryption.', difficulty: 3, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'puzzle', title: 'Locked Door', description: 'A sealed door with an unknown mechanism.', difficulty: 2, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'puzzle', title: 'Decay Log', description: 'A log entry with missing data.', difficulty: 2, stressOnFailure: 1, stressOnSuccess: 0 },
];

const DISCOVERY_ENCOUNTERS: Omit<Encounter, 'id'>[] = [
  { type: 'discovery', title: 'Derelict Ship', description: 'A derelict ship floats in the void.', difficulty: 1, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'discovery', title: 'Alien Artifact', description: 'An alien artifact of unknown origin.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
  { type: 'discovery', title: 'Survivor', description: 'A lone survivor is found.', difficulty: 1, stressOnFailure: 1, stressOnSuccess: 0 },
  { type: 'discovery', title: 'Signal', description: 'A mysterious signal is detected.', difficulty: 2, stressOnFailure: 2, stressOnSuccess: 0 },
];

export function generateEncounters(tone: AdventureTone, setting: AdventureSetting, count: number): Encounter[] {
  const allEncounters = [
    ...THREAT_ENCOUNTERS,
    ...ENVIRONMENT_ENCOUNTERS,
    ...SOCIAL_ENCOUNTERS,
    ...PUZZLE_ENCOUNTERS,
    ...DISCOVERY_ENCOUNTERS,
  ];

  // Weight encounters by tone
  const weighted = allEncounters.map((e) => {
    let weight = 1;
    if (tone === 'horror' && e.type === 'threat') weight = 3;
    if (tone === 'action' && e.type === 'threat') weight = 4;
    if (tone === 'mystery' && (e.type === 'puzzle' || e.type === 'discovery')) weight = 3;
    if (tone === 'exploration' && e.type === 'discovery') weight = 3;
    return { ...e, weight };
  });

  const selected: Omit<Encounter, 'id'>[] = [];
  const used = new Set<string>();

  while (selected.length < count && selected.length < weighted.length) {
    const totalWeight = weighted.reduce((sum, e) => sum + e.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const e of weighted) {
      rand -= e.weight;
      if (rand <= 0 && !used.has(e.title)) {
        selected.push(e);
        used.add(e.title);
        break;
      }
    }
    if (selected.length < count && used.size >= weighted.length) break;
  }

  return selected.map((e, i) => ({ ...e, id: `encounter-${i}` }));
}
