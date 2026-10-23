import type { CrewMember, StressCheckResult } from '../types';
import { rollStress } from './dice';

// ─── Stress Management ───────────────────────────────────────────────────────

/**
 * Add stress to a crew member.
 * Returns updated crew member and whether a stress check was triggered.
 */
export function addStress(
  crew: CrewMember,
  amount: number,
): { crew: CrewMember; stressCheck?: StressCheckResult } {
  const newStress = Math.min(10, crew.stress + amount);
  const updated = { ...crew, stress: newStress };

  // Trigger stress check when stress increases
  const stressCheck = rollStress(newStress);

  if (stressCheck.breakdown) {
    return {
      crew: applyBreakdown(updated),
      stressCheck,
    };
  }

  return { crew: updated, stressCheck };
}

/**
 * Reduce stress through downtime or medical treatment.
 */
export function reduceStress(crew: CrewMember, amount: number): CrewMember {
  return {
    ...crew,
    stress: Math.max(0, crew.stress - amount),
  };
}

/**
 * Apply breakdown consequences: lose 1 stat point, gain compulsion.
 */
function applyBreakdown(crew: CrewMember): CrewMember {
  // Find lowest stat to reduce
  const stats = Object.entries(crew.stats) as [keyof typeof crew.stats, number][];
  const lowestStat = stats.reduce<{ name: keyof typeof crew.stats; value: number }>(
    (min, [name, value]) => (value < min.value ? { name, value } : min),
    { name: stats[0][0], value: stats[0][1] }
  );

  // Generate compulsion based on psych level
  const compulsions = [
    'Paranoia',
    'Hallucinations',
    'Isolation',
    'Rage',
    'Apathy',
    'Obsession',
  ];
  const compulsion = compulsions[Math.floor(Math.random() * compulsions.length)];

  return {
    ...crew,
    isBreakdown: true,
    compulsion,
    stats: {
      ...crew.stats,
      [lowestStat.name]: Math.max(
        0,
        crew.stats[lowestStat.name] - 1,
      ),
    },
  };
}

/**
 * Resolve breakdown: crew member recovers after downtime.
 */
export function resolveBreakdown(crew: CrewMember): CrewMember {
  return {
    ...crew,
    isBreakdown: false,
    compulsion: undefined,
    stress: Math.max(0, crew.stress - 3),
  };
}
