import { describe, it, expect } from 'vitest';
import { PREGEN_CREW, generateQuickCrewSquad, generateQuickCrewMember } from './crew-generator';

describe('Crew Generator', () => {
  it('should have 4 pre-gen crew members with valid Mothership 1e classes', () => {
    expect(PREGEN_CREW).toHaveLength(4);

    const roles = PREGEN_CREW.map((c) => c.role);
    expect(roles).toContain('MARINE');
    expect(roles).toContain('SCIENTIST');
    expect(roles).toContain('ANDROID');
    expect(roles).toContain('TEAMSTER');

    for (const member of PREGEN_CREW) {
      expect(member.name).toBeTruthy();
      expect(member.loadout).toBeTruthy();
      expect(member.patch).toBeTruthy();
      expect(member.trinket).toBeTruthy();
      expect(member.health).toBeGreaterThan(0);
      expect(member.maxWounds).toBeGreaterThanOrEqual(2);
    }
  });

  it('should generate a randomized quick squad with all 4 classes', () => {
    const squad = generateQuickCrewSquad();
    expect(squad).toHaveLength(4);

    const roles = squad.map((c) => c.role);
    expect(roles).toEqual(['MARINE', 'SCIENTIST', 'ANDROID', 'TEAMSTER']);

    for (const member of squad) {
      expect(member.name.length).toBeGreaterThan(2);
      expect(member.stats.STRENGTH).toBeDefined();
      expect(member.stats.DEXTERITY).toBeDefined();
      expect(member.stats.INTELLIGENCE).toBeDefined();
      expect(member.stats.PSYCH).toBeDefined();
      expect(member.health).toBeGreaterThanOrEqual(11);
      expect(member.health).toBeLessThanOrEqual(20);
    }
  });

  it('should set Android stress to 0 and human stress to 2', () => {
    const android = generateQuickCrewMember('ANDROID', 0);
    expect(android.stress).toBe(0);

    const marine = generateQuickCrewMember('MARINE', 1);
    expect(marine.stress).toBe(2);
  });
});
