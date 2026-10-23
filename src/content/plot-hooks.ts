import type { AdventureTone, AdventureSetting } from '../types';

// ─── Procedural Plot Hook Generator ──────────────────────────────────────────

interface PlotHook {
  title: string;
  description: string;
}

const HOOKS: Record<AdventureTone, PlotHook[]> = {
  horror: [
    { title: 'Distress Signal', description: 'A distress signal leads to a derelict ship with no survivors — or so it seems.' },
    { title: 'Missing Crew', description: 'A research station goes silent. The crew who went to investigate never returned.' },
    { title: 'The Signal', description: 'A mysterious signal is broadcasting from an uncharted sector. Something answers back.' },
    { title: 'Cargo', description: 'The crew is hired to transport a sealed container. It starts moving on its own.' },
    { title: 'The Anomaly', description: 'A spatial anomaly appears on sensors. Those who enter don\'t come back the same.' },
  ],
  action: [
    { title: 'Hostile Takeover', description: 'A rival corporation has seized a valuable station. The crew is hired to retake it.' },
    { title: 'Pirate Ambush', description: 'Pirates attack the crew\'s ship. They must fight their way to safety.' },
    { title: 'Rescue Mission', description: 'A distress call from a military outpost under attack.' },
    { title: 'The Heist', description: 'Infiltrate a heavily guarded facility to steal valuable technology.' },
    { title: 'Escape', description: 'The crew is trapped on a hostile world. They must fight their way out.' },
  ],
  mystery: [
    { title: 'The Disappearance', description: 'A ship vanishes without a trace. The crew investigates and finds something unsettling.' },
    { title: 'The Experiment', description: 'A secret experiment has gone wrong. The crew uncovers the truth.' },
    { title: 'The Message', description: 'A cryptic message leads the crew to a forgotten facility.' },
    { title: 'The Conspiracy', description: 'The crew discovers a conspiracy that reaches the highest levels of command.' },
    { title: 'The Artifact', description: 'An alien artifact holds the key to a mystery that spans centuries.' },
  ],
  exploration: [
    { title: 'Uncharted Sector', description: 'A new sector of space has been discovered. The crew is sent to explore it.' },
    { title: 'The Survey', description: 'A routine survey mission reveals something extraordinary.' },
    { title: 'First Contact', description: 'The crew makes first contact with an alien species.' },
    { title: 'The Expedition', description: 'An expedition to a newly discovered planet reveals ancient secrets.' },
    { title: 'The Map', description: 'An ancient map leads to a legendary location.' },
  ],
};

const SETTING_MODIFIERS: Record<AdventureSetting, string> = {
  derelict_ship: ' aboard a derelict ship',
  space_station: ' at a remote space station',
  planet_surface: ' on an uncharted planet',
  anomaly: ' near a spatial anomaly',
  unknown: '',
};

export function generatePlotHooks(tone: AdventureTone, setting: AdventureSetting, count: number): PlotHook[] {
  const hooks = HOOKS[tone] || HOOKS.horror;
  const selected: PlotHook[] = [];
  const used = new Set<number>();

  while (selected.length < count && selected.length < hooks.length) {
    const index = Math.floor(Math.random() * hooks.length);
    if (!used.has(index)) {
      const hook = hooks[index];
      const modifier = SETTING_MODIFIERS[setting] || '';
      selected.push({
        title: hook.title,
        description: hook.description + modifier,
      });
      used.add(index);
    }
  }

  return selected;
}

export function generatePlotHook(tone: AdventureTone, setting: AdventureSetting): PlotHook {
  const hooks = generatePlotHooks(tone, setting, 1);
  return hooks[0] || { title: 'Unknown', description: 'The crew faces the unknown.' };
}
