import type { Adventure, AdventureTone, AdventureSetting, Act, Scene, Encounter, NPC } from '../types';
import { generateEncounters } from '../content/encounters';
import { generateLocations } from '../content/locations';
import { generateNPCs } from '../content/npcs';
import { generatePlotHooks } from '../content/plot-hooks';

// ─── Procedural Adventure Generator ──────────────────────────────────────────

export interface AdventureRequest {
  tone: AdventureTone;
  setting: AdventureSetting;
  crewSize: number;
  length: 'short' | 'medium' | 'long';
}

/**
 * Generate a procedural adventure based on user characteristics.
 */
export function generateAdventure(request: AdventureRequest): Adventure {
  const plotHook = generatePlotHook(request);
  const numActs = getNumActs(request.length);
  const acts: Act[] = [];

  for (let i = 0; i < numActs; i++) {
    const act = generateAct(request, i, numActs, plotHook);
    acts.push(act);
  }

  return {
    id: generateId(),
    title: plotHook.title,
    description: plotHook.description,
    tone: request.tone,
    setting: request.setting,
    recommendedCrewSize: request.crewSize,
    acts,
  };
}

function generateAct(
  request: AdventureRequest,
  index: number,
  totalActs: number,
  plotHook: { title: string; description: string },
): Act {
  const locations = generateLocations(request.setting, 3);
  const location = locations[index % locations.length];
  const numScenes = getNumScenes(request.length, index, totalActs);
  const scenes: Scene[] = [];

  for (let i = 0; i < numScenes; i++) {
    const sceneLocation = locations[(index + i) % locations.length];
    const encounters = generateEncounters(request.tone, request.setting, 1 + Math.floor(Math.random() * 2));
    const npcs = generateNPCs(request.tone, request.setting, 1 + Math.floor(Math.random() * 3));

    scenes.push({
      id: `act-${index}-scene-${i}`,
      title: `${sceneLocation} - Scene ${i + 1}`,
      location: sceneLocation,
      description: generateSceneDescription(request, index, i),
      encounters,
      npcs,
      clues: generateClues(request, index, i),
      nextActId: i === numScenes - 1 && index < totalActs - 1 ? `act-${index + 1}` : undefined,
    });
  }

  return {
    id: `act-${index}`,
    title: `Act ${index + 1}: ${getActTitle(request, index)}`,
    description: `Act ${index + 1} of the adventure.`,
    scenes,
  };
}

function generateSceneDescription(request: AdventureRequest, actIndex: number, sceneIndex: number): string {
  const descriptions = [
    `The crew arrives at ${request.setting}. The atmosphere is tense.`,
    `Something is wrong. The crew investigates the source of the disturbance.`,
    `A new threat emerges from the darkness.`,
    `The crew discovers something unexpected.`,
    `Tensions rise as the crew faces a difficult choice.`,
  ];
  return descriptions[(actIndex + sceneIndex) % descriptions.length];
}

function generateClues(request: AdventureRequest, actIndex: number, sceneIndex: number): string[] {
  const clueTemplates = [
    `A cryptic message found in ${request.setting}.`,
    `Evidence of a previous crew's fate.`,
    `A warning left by someone who knew what was coming.`,
    `A map or log entry pointing to something deeper.`,
  ];
  return [clueTemplates[(actIndex + sceneIndex) % clueTemplates.length]];
}

function generatePlotHook(request: AdventureRequest): { title: string; description: string } {
  const hooks = generatePlotHooks(request.tone, request.setting, 1);
  return {
    title: hooks[0]?.title || 'Unknown Mission',
    description: hooks[0]?.description || 'The crew is sent on a mission.',
  };
}

function getNumActs(length: 'short' | 'medium' | 'long'): number {
  switch (length) {
    case 'short': return 2;
    case 'medium': return 3;
    case 'long': return 4;
  }
}

function getNumScenes(length: 'short' | 'medium' | 'long', actIndex: number, totalActs: number): number {
  if (length === 'short') return 2;
  if (length === 'medium') return actIndex === 0 ? 2 : 3;
  return 3;
}

function getActTitle(request: AdventureRequest, index: number): string {
  const titles: Record<string, string[]> = {
    horror: ['The Descent', 'Into the Dark', 'No Way Out', 'The End'],
    action: ['First Contact', 'The Chase', 'The Battle', 'Final Stand'],
    mystery: ['The Clue', 'The Investigation', 'The Revelation', 'The Truth'],
    exploration: ['Discovery', 'The Unknown', 'The Deep', 'Home'],
  };
  const actTitles = titles[request.tone] || titles.horror;
  return actTitles[index] || `Act ${index + 1}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
