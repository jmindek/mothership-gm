import { describe, it, expect } from 'vitest';
import {
  extractAdventureFromPdf,
  loadAdventureFromJSON,
  getFirstScene,
  getScene,
  getNextActId,
} from './loader';
import type { Adventure } from '../types';

describe('Adventure Loader (PDF Module Extraction)', () => {
  it('should clean title and detect anthology scenarios with mixed-case and title-case titles', () => {
    const sampleText = `
      SCENARIO 1   SCENARIO 2   SCENARIO 3   SCENARIO 4
      OVERVIEW
      Scenario 1: Distress Signals
      The Job: Greta Base Terraforming Colony has gone dark.
      Scenario 2: The Fall of Carter
      Infiltrate the infected complex and rescue marines.
      Scenario 3 - The Queen's Lair
      Explore the downed alien ship.
      Scenario 4: Final Escape Vector
      Evacuate during the final planetary storm.
    `;

    const result = extractAdventureFromPdf(sampleText, 'Another-Bug-Hunt-v1.2.pdf', 44);

    expect(result.title).toBe('Another Bug Hunt');
    expect(result.standaloneScenarios).toBeDefined();
    expect(result.standaloneScenarios?.length).toBe(4);
    expect(result.standaloneScenarios?.[0].title).toContain('Distress Signals');
    expect(result.standaloneScenarios?.[1].title).toContain('The Fall Of Carter');
    expect(result.standaloneScenarios?.[2].title).toContain("The Queen's Lair");
    expect(result.standaloneScenarios?.[3].title).toContain('Final Escape Vector');
  });

  it('should not leak standalone scenarios for single continuous modules', () => {
    const singleModuleText = `
      THE HAUNTING OF YPSILON 14
      Mining Facility on an asteroid. A strange transmission was received.
      The airlock is open and the crew is missing.
    `;

    const result = extractAdventureFromPdf(singleModuleText, 'The-Haunting-of-Ypsilon-14.pdf', 16);

    expect(result.title).toBe('The Haunting of Ypsilon 14');
    // Spoiler protection: should not populate standaloneScenarios
    expect(result.standaloneScenarios).toBeUndefined();
    expect(result.acts.length).toBeGreaterThan(0);
  });

  it('should load a valid adventure from JSON string', () => {
    const validJson = JSON.stringify({
      id: 'adv-custom-1',
      title: 'Dead Planet',
      description: 'Survive on a graveyard planet.',
      acts: [
        {
          id: 'act-1',
          title: 'Act 1: The Crash',
          scenes: [
            {
              id: 'scene-1',
              title: 'Crash Site',
              location: 'Desert Basin',
              description: 'The ship has crash-landed.',
              encounters: [],
              npcs: [],
              clues: ['Scattered debris'],
              nextActId: 'act-2',
            },
          ],
        },
      ],
    });

    const adv = loadAdventureFromJSON(validJson);
    expect(adv.id).toBe('adv-custom-1');
    expect(adv.title).toBe('Dead Planet');
    expect(adv.acts).toHaveLength(1);
  });

  it('should retrieve first scene, specific scene, and next act ID accurately', () => {
    const mockAdventure: Adventure = {
      id: 'adv-test',
      title: 'Test Sector',
      description: 'Testing',
      tone: 'horror',
      setting: 'space_station',
      recommendedCrewSize: 3,
      acts: [
        {
          id: 'act-alpha',
          title: 'Alpha Act',
          description: 'Beginning',
          scenes: [
            {
              id: 'scene-alpha-1',
              title: 'Alpha Scene 1',
              location: 'Docking Arm',
              description: 'Docking',
              encounters: [],
              npcs: [],
              clues: [],
              nextActId: 'act-beta',
            },
          ],
        },
        {
          id: 'act-beta',
          title: 'Beta Act',
          description: 'Middle',
          scenes: [
            {
              id: 'scene-beta-1',
              title: 'Beta Scene 1',
              location: 'Command Deck',
              description: 'Command',
              encounters: [],
              npcs: [],
              clues: [],
            },
          ],
        },
      ],
    };

    const first = getFirstScene(mockAdventure);
    expect(first).toEqual({ actId: 'act-alpha', sceneId: 'scene-alpha-1' });

    const scene = getScene(mockAdventure, 'act-beta', 'scene-beta-1');
    expect(scene?.title).toBe('Beta Scene 1');

    const nextAct = getNextActId(mockAdventure, 'scene-alpha-1');
    expect(nextAct).toBe('act-beta');
  });
});
