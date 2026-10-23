import { describe, it, expect } from 'vitest';
import { reduceStress, addStress } from './stress';
import { rollStress, rollSkill } from './dice';
import { PREGEN_CREW } from './crew-generator';

describe('Stress & Panic Mechanics', () => {
  it('should reduce stress appropriately without going below 0', () => {
    const member = { ...PREGEN_CREW[0], stress: 5 };
    const reduced = reduceStress(member, 2);
    expect(reduced.stress).toBe(3);

    const cleared = reduceStress(member, 10);
    expect(cleared.stress).toBe(0);
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
});
