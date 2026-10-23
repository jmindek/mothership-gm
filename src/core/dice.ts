import type { SkillCheckResult, StressCheckResult, StatValue } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// ─── Skill Checks ────────────────────────────────────────────────────────────

/**
 * Roll a skill check: 2d6 + stat vs target number.
 * - Roll of 2 = automatic critical failure
 * - Roll of 12 = automatic critical success
 * - Default target number is 8
 */
export function rollSkill(
  stat: StatValue,
  targetNumber: number = 8,
): SkillCheckResult {
  const d1 = rollD6();
  const d2 = rollD6();
  const value = d1 + d2 + stat;
  const dice: [number, number] = [d1, d2];

  // Auto crit on 2, auto fail on 12
  const isAutoCrit = d1 + d2 === 12;
  const isAutoFail = d1 + d2 === 2;

  const critical = isAutoCrit || value >= targetNumber + 4;
  const success = isAutoCrit || value >= targetNumber;

  return {
    success,
    critical,
    value,
    dice,
    stat,
    targetNumber,
  };
}

// ─── Stress Checks ───────────────────────────────────────────────────────────

/**
 * Roll a stress check: 1d10.
 * - If roll <= stress level, suffer a breakdown
 * - Stress level ranges from 0-10
 */
export function rollStress(stressLevel: number): StressCheckResult {
  const roll = rollD10();
  const breakdown = roll <= stressLevel;

  return {
    breakdown,
    roll,
    stressLevel,
  };
}
