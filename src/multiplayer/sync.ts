import type { GameState } from '../types';

// ─── State Synchronization ───────────────────────────────────────────────────

/**
 * Serialize game state for transmission.
 */
export function serializeState(game: GameState): string {
  return JSON.stringify(game);
}

/**
 * Deserialize game state from transmission.
 */
export function deserializeState(json: string): GameState | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Compute a checksum for state change detection.
 */
export function getStateChecksum(game: GameState): string {
  return `${game.id}-${game.timestamp}`;
}

/**
 * Check if two game states are identical.
 */
export function isStateEqual(a: GameState, b: GameState): boolean {
  return a.id === b.id && a.timestamp === b.timestamp;
}

/**
 * Merge player action into game state.
 */
export function mergeAction(game: GameState, action: import('../types').PlayerAction): GameState {
  return {
    ...game,
    playerActions: [...game.playerActions, action],
    timestamp: Date.now(),
  };
}

/**
 * Merge crew updates into game state.
 */
export function mergeCrew(game: GameState, crew: import('../types').CrewMember[]): GameState {
  return {
    ...game,
    crew,
    timestamp: Date.now(),
  };
}

/**
 * Merge ship updates into game state.
 */
export function mergeShip(game: GameState, ship: import('../types').Ship): GameState {
  return {
    ...game,
    ship,
    timestamp: Date.now(),
  };
}

/**
 * Merge adventure progress into game state.
 */
export function mergeAdventureProgress(
  game: GameState,
  progress: Partial<import('../types').AdventureProgress>,
): GameState {
  return {
    ...game,
    adventureProgress: { ...game.adventureProgress, ...progress },
    timestamp: Date.now(),
  };
}
