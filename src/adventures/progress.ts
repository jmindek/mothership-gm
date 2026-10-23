import type { AdventureProgress } from '../types';

// ─── Adventure Progress Tracker ──────────────────────────────────────────────

/**
 * Initialize adventure progress for a new adventure.
 */
export function initProgress(adventureId: string): AdventureProgress {
  return {
    currentActId: '',
    currentSceneId: '',
    completedScenes: [],
    discoveredClues: [],
  };
}

/**
 * Mark a scene as completed and advance to the next scene.
 */
export function completeScene(
  progress: AdventureProgress,
  adventure: { acts: { id: string; scenes: { id: string; nextActId?: string }[] }[] },
): AdventureProgress {
  const completedScenes = [...progress.completedScenes, progress.currentSceneId];

  // Find current scene to determine next
  let nextActId = progress.currentActId;
  let nextSceneId = progress.currentSceneId;

  for (const act of adventure.acts) {
    const sceneIndex = act.scenes.findIndex((s) => s.id === progress.currentSceneId);
    if (sceneIndex !== -1) {
      const nextScene = act.scenes[sceneIndex + 1];
      if (nextScene) {
        nextSceneId = nextScene.id;
        nextActId = act.id;
      } else if (act.scenes[sceneIndex].nextActId) {
        nextActId = act.scenes[sceneIndex].nextActId;
        nextSceneId = '';
      }
      break;
    }
  }

  return {
    ...progress,
    currentActId: nextActId,
    currentSceneId: nextSceneId,
    completedScenes,
  };
}

/**
 * Discover a clue during a scene.
 */
export function discoverClue(progress: AdventureProgress, clue: string): AdventureProgress {
  if (progress.discoveredClues.includes(clue)) {
    return progress;
  }
  return {
    ...progress,
    discoveredClues: [...progress.discoveredClues, clue],
  };
}

/**
 * Jump to a specific act and scene (for branching or manual navigation).
 */
export function jumpToScene(
  progress: AdventureProgress,
  actId: string,
  sceneId: string,
): AdventureProgress {
  return {
    ...progress,
    currentActId: actId,
    currentSceneId: sceneId,
  };
}

/**
 * Check if the adventure is complete.
 */
export function isAdventureComplete(progress: AdventureProgress, adventure: { acts: { id: string; scenes: { id: string }[] }[] }): boolean {
  if (!progress.currentActId) return false;

  const currentAct = adventure.acts.find((a) => a.id === progress.currentActId);
  if (!currentAct) return false;

  const lastScene = currentAct.scenes[currentAct.scenes.length - 1];
  return progress.currentSceneId === lastScene.id && progress.completedScenes.length >= adventure.acts.reduce((sum, a) => sum + a.scenes.length, 0) - 1;
}
