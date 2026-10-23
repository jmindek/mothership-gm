import type { Adventure } from '../types';

// ─── Adventure Loader ────────────────────────────────────────────────────────

/**
 * Load a pre-made adventure from a JSON object.
 * Validates structure and returns the adventure.
 */
export function loadAdventure(data: unknown): Adventure {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid adventure data: must be an object');
  }

  const adventure = data as Partial<Adventure>;

  // Validate required fields
  if (!adventure.id || typeof adventure.id !== 'string') {
    throw new Error('Invalid adventure: missing id');
  }
  if (!adventure.title || typeof adventure.title !== 'string') {
    throw new Error('Invalid adventure: missing title');
  }
  if (!adventure.acts || !Array.isArray(adventure.acts)) {
    throw new Error('Invalid adventure: missing acts array');
  }

  // Validate acts
  for (const act of adventure.acts) {
    if (!act.id || !act.title || !act.scenes) {
      throw new Error(`Invalid adventure: act "${act.id || 'unknown'}" is missing required fields`);
    }
    for (const scene of act.scenes) {
      if (!scene.id || !scene.title || !scene.location) {
        throw new Error(`Invalid adventure: scene "${scene.id || 'unknown'}" in act "${act.id}" is missing required fields`);
      }
    }
  }

  return {
    id: adventure.id,
    title: adventure.title,
    description: adventure.description || '',
    tone: adventure.tone || 'horror',
    setting: adventure.setting || 'unknown',
    recommendedCrewSize: adventure.recommendedCrewSize || 3,
    sourceText: (adventure as any).sourceText,
    acts: adventure.acts,
  };
}

/**
 * Load an adventure from a JSON string.
 */
export function loadAdventureFromJSON(json: string): Adventure {
  try {
    const data = JSON.parse(json);
    return loadAdventure(data);
  } catch (e) {
    throw new Error(`Failed to parse adventure JSON: ${e instanceof Error ? e.message : 'unknown error'}`);
  }
}

/**
 * Get the first scene of an adventure.
 */
export function getFirstScene(adventure: Adventure): { actId: string; sceneId: string } {
  const firstAct = adventure.acts[0];
  const firstScene = firstAct.scenes[0];
  return {
    actId: firstAct.id,
    sceneId: firstScene.id,
  };
}

/**
 * Get a scene by act and scene ID.
 */
export function getScene(
  adventure: Adventure,
  actId: string,
  sceneId: string,
): (typeof adventure.acts)[0]['scenes'][0] | null {
  const act = adventure.acts.find((a) => a.id === actId);
  if (!act) return null;
  return act.scenes.find((s) => s.id === sceneId) || null;
}

/**
 * Get the next act ID from a scene (for branching).
 */
export function getNextActId(adventure: Adventure, sceneId: string): string | null {
  for (const act of adventure.acts) {
    for (const scene of act.scenes) {
      if (scene.id === sceneId && scene.nextActId) {
        return scene.nextActId;
      }
    }
  }
  return null;
}

/**
 * Extract a structured Adventure from parsed PDF text.
 */
export function extractAdventureFromPdf(
  rawText: string,
  filename: string,
  pageCount: number
): Adventure {
  // Check if text starts or contains a JSON payload
  const jsonMatch = rawText.match(/\{[\s\S]*"acts"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return loadAdventure(parsed);
    } catch {
      // Continue to text parsing
    }
  }

  // Derive title from filename or prominent text
  const cleanFilename = filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\bv\d+(\.\d+)?\b/gi, '')
    .trim();
  const title = cleanFilename || 'Unknown Mothership Module';

  // Clean out common repetitive running tab headers found in Mothership booklets
  const cleanedText = rawText.replace(
    /SCENARIO\s+1\s+SCENARIO\s+2\s+SCENARIO\s+3\s+SCENARIO\s+4/gi,
    ''
  );

  // Look for standalone scenarios (e.g., Scenario 1: Distress Signals)
  const scenarioRegex = /Scenario\s+(\d+)[\s:–-]+([A-Za-z0-9\s'’-]{3,40})(?=\s{2,}|The Job|What|Overview|\n|$)/gi;
  const matches = [...cleanedText.matchAll(scenarioRegex)];

  const defaultScenarioDescs: Record<string, string> = {
    '1': 'Greta Base Terraforming Colony has gone silent. Investigate the distress signal and recover surviving personnel.',
    '2': 'Infiltrate the infested reactor complex and rescue the surviving squad of Marines.',
    '3': 'Ascend the Samsa VI mountains to locate and explore the downed alien Carc vessel.',
    '4': 'Survive the catastrophic planetary storm and the final hive assault to secure extraction.',
  };

  const detectedScenarios: import('../types').StandaloneScenario[] = [];
  const seenNumbers = new Set<string>();

  for (const m of matches) {
    const num = m[1];
    let name = m[2].trim().replace(/\s+/g, ' ');
    // Title Case formatting
    name = name
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    if (!seenNumbers.has(num) && name.length >= 3 && !name.toLowerCase().includes('scenario')) {
      seenNumbers.add(num);
      detectedScenarios.push({
        id: `scenario-${num}`,
        number: num,
        title: `Scenario ${num}: ${name}`,
        description:
          defaultScenarioDescs[num] ||
          `Operational scenario ${num} from ${title}.`,
      });
    }
  }

  // Sort scenarios by number (1, 2, 3...)
  detectedScenarios.sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10));

  // Determine if this module is an anthology with multiple standalone scenarios
  const hasMultipleStandalone = detectedScenarios.length > 1;

  let acts: import('../types').Act[] = [];

  if (hasMultipleStandalone) {
    acts = detectedScenarios.map((s, idx) => ({
      id: `act-${s.number}`,
      title: s.title,
      description: s.description,
      scenes: [
        {
          id: `scene-${s.number}-1`,
          title: `${s.title} - Deployment`,
          location: 'Operational Area',
          description: `The squad initiates operations for ${s.title}.`,
          encounters: [],
          npcs: [],
          clues: [],
        },
      ],
    }));
  } else {
    // Single continuous adventure: use classified operational phases
    acts = [
      {
        id: 'act-1',
        title: 'Phase 1: Infiltration & Discovery',
        description: 'The landing party arrives and surveys the operational area.',
        scenes: [
          {
            id: 'scene-1',
            title: 'Point of Entry',
            location: 'Airlock / Perimeter',
            description: 'The crew enters the designated coordinates. Environmental seals disengaged.',
            encounters: [],
            npcs: [],
            clues: [],
          },
        ],
      },
      {
        id: 'act-2',
        title: 'Phase 2: Escalation & Hazard',
        description: 'Hostile contact, contagion, or facility breakdown occurs.',
        scenes: [
          {
            id: 'scene-2',
            title: 'Core Sector',
            location: 'Interior Complex',
            description: 'The situation deteriorates rapidly. Survival instincts tested.',
            encounters: [],
            npcs: [],
            clues: [],
          },
        ],
      },
      {
        id: 'act-3',
        title: 'Phase 3: The Climax & Evacuation',
        description: 'Final confrontation or desperate retreat to the extraction craft.',
        scenes: [
          {
            id: 'scene-3',
            title: 'Extraction Vector',
            location: 'Hangar / Escape Pods',
            description: 'All systems failing. Survive, solve, save: pick one.',
            encounters: [],
            npcs: [],
            clues: [],
          },
        ],
      },
    ];
  }

  return {
    id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    description: `Official Mothership RPG module loaded from PDF (${pageCount} pages, ~${Math.round(rawText.split(/\s+/).length)} words). The Warden will adjudicate situations, encounters, and environments directly from this confidential text.`,
    tone: 'horror',
    setting: 'unknown',
    recommendedCrewSize: 4,
    sourceText: rawText,
    acts,
    standaloneScenarios: hasMultipleStandalone ? detectedScenarios : undefined,
    selectedScenarioId: hasMultipleStandalone ? detectedScenarios[0]?.id : undefined,
  };
}
