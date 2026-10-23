import { describe, it, expect } from 'vitest';
import { extractAdventureFromPdf } from './loader';

describe('Adventure Loader (PDF Module Extraction)', () => {
  it('should clean title and detect anthology scenarios when multiple scenarios exist', () => {
    const sampleText = `
      SCENARIO 1   SCENARIO 2   SCENARIO 3   SCENARIO 4
      OVERVIEW
      Scenario 1 - DISTRESS SIGNALS
      The Job: Greta Base Terraforming Colony has gone dark.
      Scenario 2 - HIVE MIND
      Infiltrate the infected complex and rescue marines.
      Scenario 3 - MOTHERSHIP
      Explore the downed alien ship.
      Scenario 4 - METAMORPHOSIS
      Evacuate during the final planetary storm.
    `;

    const result = extractAdventureFromPdf(sampleText, 'Another-Bug-Hunt-v1.2.pdf', 44);

    expect(result.title).toBe('Another Bug Hunt');
    expect(result.standaloneScenarios).toBeDefined();
    expect(result.standaloneScenarios?.length).toBe(4);
    expect(result.standaloneScenarios?.[0].title).toContain('Distress Signals');
    expect(result.standaloneScenarios?.[1].title).toContain('Hive Mind');
    expect(result.standaloneScenarios?.[2].title).toContain('Mothership');
    expect(result.standaloneScenarios?.[3].title).toContain('Metamorphosis');
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
});
