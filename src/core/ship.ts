import type { Ship, ShipSystem, ShipSystemName } from '../types';

// ─── Ship System Management ──────────────────────────────────────────────────

/**
 * Create a new ship with default system integrity.
 */
export function createShip(name: string): Ship {
  const systems: Record<ShipSystemName, ShipSystem> = {
    LIFE_SUPPORT: { name: 'LIFE_SUPPORT', integrity: 10, isFunctional: true },
    NAVIGATION: { name: 'NAVIGATION', integrity: 10, isFunctional: true },
    WEAPONS: { name: 'WEAPONS', integrity: 10, isFunctional: true },
    SHIELDS: { name: 'SHIELDS', integrity: 10, isFunctional: true },
    PROPULSION: { name: 'PROPULSION', integrity: 10, isFunctional: true },
    COMMUNICATIONS: { name: 'COMMUNICATIONS', integrity: 10, isFunctional: true },
    POWER: { name: 'POWER', integrity: 10, isFunctional: true },
  };

  return {
    name,
    systems,
    hullIntegrity: 10,
  };
}

/**
 * Damage a ship system. Returns updated ship.
 */
export function damageSystem(
  ship: Ship,
  systemName: ShipSystemName,
  amount: number,
): Ship {
  const system = ship.systems[systemName];
  const newIntegrity = Math.max(0, system.integrity - amount);
  const isFunctional = newIntegrity > 0;

  return {
    ...ship,
    systems: {
      ...ship.systems,
      [systemName]: {
        ...system,
        integrity: newIntegrity,
        isFunctional,
      },
    },
  };
}

/**
 * Damage hull integrity.
 */
export function damageHull(ship: Ship, amount: number): Ship {
  return {
    ...ship,
    hullIntegrity: Math.max(0, ship.hullIntegrity - amount),
  };
}

/**
 * Repair a ship system.
 */
export function repairSystem(
  ship: Ship,
  systemName: ShipSystemName,
  amount: number,
): Ship {
  const system = ship.systems[systemName];
  const newIntegrity = Math.min(10, system.integrity + amount);
  const isFunctional = newIntegrity > 0;

  return {
    ...ship,
    systems: {
      ...ship.systems,
      [systemName]: {
        ...system,
        integrity: newIntegrity,
        isFunctional,
      },
    },
  };
}

/**
 * Check if a critical system is functional.
 */
export function isSystemFunctional(ship: Ship, systemName: ShipSystemName): boolean {
  return ship.systems[systemName].isFunctional;
}

/**
 * Get all non-functional systems.
 */
export function getNonFunctionalSystems(ship: Ship): ShipSystemName[] {
  return Object.values(ship.systems)
    .filter((s) => !s.isFunctional)
    .map((s) => s.name);
}

/**
 * Check if ship is destroyed (hull integrity 0).
 */
export function isShipDestroyed(ship: Ship): boolean {
  return ship.hullIntegrity <= 0;
}
