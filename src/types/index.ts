// ─── Stats ───────────────────────────────────────────────────────────────────

export type StatName = 'STRENGTH' | 'DEXTERITY' | 'INTELLIGENCE' | 'PSYCH';

export const STATS: StatName[] = ['STRENGTH', 'DEXTERITY', 'INTELLIGENCE', 'PSYCH'];

export type StatValue = 0 | 1 | 2 | 3;

// ─── Skills ──────────────────────────────────────────────────────────────────

export type SkillName =
  | 'ATHLETICS'        // STRENGTH
  | 'COMBAT'           // STRENGTH
  | 'ENGINEERING'      // DEXTERITY
  | 'PILOTING'         // DEXTERITY
  | 'COMPUTERS'        // INTELLIGENCE
  | 'SCIENCE'          // INTELLIGENCE
  | 'MEDICINE'         // INTELLIGENCE
  | 'NAVIGATION'       // INTELLIGENCE
  | 'PERCEPTION'       // PSYCH
  | 'PERSUASION'       // PSYCH
  | 'STEALTH'          // PSYCH
  | 'SURVIVAL'         // PSYCH;

export const SKILLS: SkillName[] = [
  'ATHLETICS', 'COMBAT', 'ENGINEERING', 'PILOTING',
  'COMPUTERS', 'SCIENCE', 'MEDICINE', 'NAVIGATION',
  'PERCEPTION', 'PERSUASION', 'STEALTH', 'SURVIVAL',
];

export const SKILL_STAT: Record<SkillName, StatName> = {
  ATHLETICS: 'STRENGTH',
  COMBAT: 'STRENGTH',
  ENGINEERING: 'DEXTERITY',
  PILOTING: 'DEXTERITY',
  COMPUTERS: 'INTELLIGENCE',
  SCIENCE: 'INTELLIGENCE',
  MEDICINE: 'INTELLIGENCE',
  NAVIGATION: 'INTELLIGENCE',
  PERCEPTION: 'PSYCH',
  PERSUASION: 'PSYCH',
  STEALTH: 'PSYCH',
  SURVIVAL: 'PSYCH',
};

// ─── Crew Member ─────────────────────────────────────────────────────────────

export type CrewRole =
  | 'MARINE'
  | 'ANDROID'
  | 'SCIENTIST'
  | 'TEAMSTER'
  | 'CAPTAIN'
  | 'ENGINEER'
  | 'MEDIC'
  | 'PILOT'
  | 'SCIENCE_OFFICER';

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  stats: Record<StatName, StatValue>;
  skills: Record<SkillName, number>; // 0-2, skill levels
  stress: number; // 0-10
  sanity: number; // 0-10, derived from stress
  isBreakdown: boolean;
  compulsion?: string;
  health?: number;
  maxHealth?: number;
  wounds?: number;
  maxWounds?: number;
  loadout?: string;
  trinket?: string;
  patch?: string;
}

export const CREW_ROLES: CrewRole[] = [
  'MARINE', 'ANDROID', 'SCIENTIST', 'TEAMSTER',
  'CAPTAIN', 'ENGINEER', 'MEDIC', 'PILOT', 'SCIENCE_OFFICER',
];

// ─── Ship Systems ────────────────────────────────────────────────────────────

export type ShipSystemName =
  | 'LIFE_SUPPORT'
  | 'NAVIGATION'
  | 'WEAPONS'
  | 'SHIELDS'
  | 'PROPULSION'
  | 'COMMUNICATIONS'
  | 'POWER';

export interface ShipSystem {
  name: ShipSystemName;
  integrity: number; // 0-10
  isFunctional: boolean;
}

export const SHIP_SYSTEMS: ShipSystemName[] = [
  'LIFE_SUPPORT', 'NAVIGATION', 'WEAPONS', 'SHIELDS',
  'PROPULSION', 'COMMUNICATIONS', 'POWER',
];

export interface Ship {
  name: string;
  systems: Record<ShipSystemName, ShipSystem>;
  hullIntegrity: number; // 0-10
}

// ─── Dice Results ────────────────────────────────────────────────────────────

export interface SkillCheckResult {
  success: boolean;
  critical: boolean;
  value: number; // 2d6 + stat
  dice: [number, number];
  stat: StatValue;
  targetNumber: number;
}

export interface StressCheckResult {
  breakdown: boolean;
  roll: number; // 1d10
  stressLevel: number;
}

// ─── Adventure ───────────────────────────────────────────────────────────────

export type AdventureTone = 'horror' | 'action' | 'mystery' | 'exploration';
export type AdventureSetting =
  | 'derelict_ship'
  | 'space_station'
  | 'planet_surface'
  | 'anomaly'
  | 'unknown';

export interface StandaloneScenario {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  tone: AdventureTone;
  setting: AdventureSetting;
  recommendedCrewSize: number;
  acts: Act[];
  /** Full source text (e.g. a loaded module PDF). GM-only reference — never shown to players. */
  sourceText?: string;
  /** Present only if the module contains distinct, unconnected / standalone scenarios */
  standaloneScenarios?: StandaloneScenario[];
  selectedScenarioId?: string;
}

export interface Act {
  id: string;
  title: string;
  description: string;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  location: string;
  description: string;
  encounters: Encounter[];
  npcs: NPC[];
  clues: string[];
  nextActId?: string;
}

// ─── Encounter ───────────────────────────────────────────────────────────────

export type EncounterType = 'threat' | 'environment' | 'social' | 'puzzle' | 'discovery';

export interface Encounter {
  id: string;
  type: EncounterType;
  title: string;
  description: string;
  difficulty: number; // 1-5
  stressOnFailure: number;
  stressOnSuccess: number;
  resolution?: string;
}

// ─── NPC ─────────────────────────────────────────────────────────────────────

export type NPCType = 'crew' | 'threat' | 'ally' | 'neutral';

export interface NPC {
  id: string;
  name: string;
  type: NPCType;
  description: string;
  role?: string;
  isAlive: boolean;
  stress?: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────

export interface GameState {
  id: string;
  timestamp: number;
  crew: CrewMember[];
  ship: Ship;
  adventure?: Adventure;
  adventureProgress: AdventureProgress;
  narrativeState: string;
  playerActions: PlayerAction[];
}

export interface AdventureProgress {
  currentActId: string;
  currentSceneId: string;
  completedScenes: string[];
  discoveredClues: string[];
}

export interface PlayerAction {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  action: string;
  skillCheck?: SkillCheckResult;
  stressCheck?: StressCheckResult;
  outcome: string;
}

// ─── Save State ──────────────────────────────────────────────────────────────

export interface SaveState {
  version: string;
  timestamp: number;
  game: GameState;
}

// ─── Multiplayer ─────────────────────────────────────────────────────────────

export type PlayerRole = 'host' | 'player';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  crewMemberId?: string;
  isConnected: boolean;
}

export interface LobbyState {
  id: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isFull: boolean;
  isStarted: boolean;
}
