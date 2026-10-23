import type { GameState, SaveState, PlayerAction } from '../types';

const SAVE_VERSION = '1.0.0';
const STORAGE_KEY = 'mothership-saves';

// ─── Create New Game ─────────────────────────────────────────────────────────

export function createNewGame(
  crew: import('../types').CrewMember[],
  ship: import('../types').Ship,
): GameState {
  return {
    id: generateId(),
    timestamp: Date.now(),
    crew,
    ship,
    adventureProgress: {
      currentActId: '',
      currentSceneId: '',
      completedScenes: [],
      discoveredClues: [],
    },
    narrativeState: '',
    playerActions: [],
  };
}

// ─── Save / Load ─────────────────────────────────────────────────────────────

/**
 * Save game state to localStorage.
 */
export function saveGame(game: GameState): void {
  const save: SaveState = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    game,
  };

  const existing = getSavedGames();
  existing[game.id] = save;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Load game state from localStorage by game ID.
 */
export function loadGame(gameId: string): GameState | null {
  const existing = getSavedGames();
  const save = existing[gameId];
  if (!save) return null;
  return save.game;
}

export interface SavedGameSummary {
  id: string;
  title: string;
  shipName: string;
  adventureTitle: string;
  crewCount: number;
  timestamp: number;
}

/**
 * List all saved games.
 */
export function listSavedGames(): SavedGameSummary[] {
  const existing = getSavedGames();
  return Object.entries(existing).map(([id, save]) => ({
    id,
    title: save.game.adventure?.title || save.game.ship.name,
    shipName: save.game.ship.name,
    adventureTitle: save.game.adventure?.title || 'Unknown Sector',
    crewCount: save.game.crew.length,
    timestamp: save.timestamp,
  }));
}

/**
 * Delete a saved game.
 */
export function deleteSave(gameId: string): void {
  const existing = getSavedGames();
  delete existing[gameId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/**
 * Export game state as JSON string (for sharing/backup).
 */
export function exportGame(game: GameState): string {
  const save: SaveState = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    game,
  };
  return JSON.stringify(save, null, 2);
}

/**
 * Import game state from JSON string.
 */
export function importGame(json: string): GameState | null {
  try {
    const save: SaveState = JSON.parse(json);
    if (save.version !== SAVE_VERSION) {
      console.warn(`Save version ${save.version} does not match current ${SAVE_VERSION}`);
    }
    return save.game;
  } catch {
    return null;
  }
}

// ─── Game State Updates ──────────────────────────────────────────────────────

/**
 * Record a player action and update game state.
 */
export function recordAction(
  game: GameState,
  action: Omit<PlayerAction, 'id' | 'timestamp'>,
): GameState {
  const playerAction: PlayerAction = {
    ...action,
    id: generateId(),
    timestamp: Date.now(),
  };

  return {
    ...game,
    playerActions: [...game.playerActions, playerAction],
    timestamp: Date.now(),
  };
}

/**
 * Update crew members in game state.
 */
export function updateCrew(game: GameState, crew: import('../types').CrewMember[]): GameState {
  return {
    ...game,
    crew,
    timestamp: Date.now(),
  };
}

/**
 * Update ship in game state.
 */
export function updateShip(game: GameState, ship: import('../types').Ship): GameState {
  return {
    ...game,
    ship,
    timestamp: Date.now(),
  };
}

/**
 * Update adventure progress.
 */
export function updateAdventureProgress(
  game: GameState,
  progress: Partial<import('../types').AdventureProgress>,
): GameState {
  return {
    ...game,
    adventureProgress: { ...game.adventureProgress, ...progress },
    timestamp: Date.now(),
  };
}

/**
 * Update narrative state (Warden's internal context).
 */
export function updateNarrativeState(game: GameState, narrativeState: string): GameState {
  return {
    ...game,
    narrativeState,
    timestamp: Date.now(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getSavedGames(): Record<string, SaveState> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}
