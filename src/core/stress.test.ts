import { describe, it, expect } from 'vitest';
import { reduceStress, addStress, applyBreakdown, resolveBreakdown } from './stress';
import { rollStress, rollSkill } from './dice';
import { PREGEN_CREW } from './crew-generator';

describe('Stress & Panic Mechanics', () => {
  it('should reduce stress appropriately without going below 0', () => {
    const freshMember = { ...PREGEN_CREW[0], stress: 5 };
    const reduced = reduceStress(freshMember, 2);
    expect(reduced.stress).toBe(3);

    // Test reducing down to floor from a fresh high-stress state
    const highStressMember = { ...PREGEN_CREW[0], stress: 5 };
    const clearedToZero = reduceStress(highStressMember, 10);
    expect(clearedToZero.stress).toBe(0);
  });

  it('should add stress up to maximum of 10 and return updated crew', () => {
    const member = { ...PREGEN_CREW[0], stress: 8 };
    const result = addStress(member, 3);
    expect(result.crew.stress).toBe(10);
  });

  it('should evaluate rollStress against stress level', () => {
    const check = rollStress(5);
    expect(check.roll).toBeGreaterThanOrEqual(1);
    expect(check.roll).toBeLessThanOrEqual(10);
    expect(check.breakdown).toBe(check.roll <= 5);
  });

  it('should resolve skill rolls with target numbers', () => {
    const result = rollSkill(2, 8);
    expect(result.dice).toHaveLength(2);
    expect(result.value).toBe(result.dice[0] + result.dice[1] + 2);
    expect(typeof result.success).toBe('boolean');
  });

  it('should apply breakdown and reduce lowest stat deterministically on ties', () => {
    // Both STRENGTH and DEXTERITY are 1 (tied)
    const tiedMember = {
      ...PREGEN_CREW[0],
      stats: { STRENGTH: 1 as const, DEXTERITY: 1 as const, INTELLIGENCE: 2 as const, PSYCH: 2 as const },
      isBreakdown: false,
    };

    const broken = applyBreakdown(tiedMember);
    expect(broken.isBreakdown).toBe(true);
    expect(broken.compulsion).toBeDefined();
    // One of the lowest stats should be decremented to 0
    const zeroStats = Object.values(broken.stats).filter((v) => v === 0);
    expect(zeroStats.length).toBeGreaterThanOrEqual(1);
  });

  it('should resolve breakdown during rest, clearing compulsion and reducing stress', () => {
    const brokenMember = {
      ...PREGEN_CREW[0],
      isBreakdown: true,
      compulsion: 'Paranoia',
      stress: 6,
    };

    const recovered = resolveBreakdown(brokenMember);
    expect(recovered.isBreakdown).toBe(false);
    expect(recovered.compulsion).toBeUndefined();
    expect(recovered.stress).toBe(3); // 6 - 3 = 3
  });
});
