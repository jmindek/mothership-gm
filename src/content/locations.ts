import type { AdventureSetting } from '../types';

// ─── Procedural Location Generator ───────────────────────────────────────────

const DERELICT_SHIP_LOCATIONS = [
  'Bridge', 'Engineering', 'Medbay', 'Cargo Bay', 'Airlock',
  'Crew Quarters', 'Server Room', 'Reactor Core', 'Observation Deck',
  'Maintenance Shaft', 'Armory', 'Hydroponics', 'Command Center',
];

const SPACE_STATION_LOCATIONS = [
  'Control Room', 'Research Lab', 'Living Quarters', 'Docking Bay',
  'Reactor Room', 'Medical Wing', 'Storage', 'Communications',
  'Observation Module', 'Maintenance Corridor', 'Prison Block', 'Server Farm',
];

const PLANET_SURFACE_LOCATIONS = [
  'Cave System', 'Ruined Structure', 'Alien Facility', 'Crater',
  'Forest Clearing', 'Underground Chamber', 'Surface Outpost', 'Research Base',
  'Abandoned Mine', 'Alien Nest', 'Volcanic Region', 'Frozen Wasteland',
];

const ANOMALY_LOCATIONS = [
  'Energy Vortex', 'Spatial Rift', 'Dimensional Tear', 'Gravity Well',
  'Quantum Anomaly', 'Temporal Distortion', 'Dark Matter Cloud', 'Plasma Storm',
  'Void Pocket', 'Reality Shear', 'Energy Cascade', 'Null Zone',
];

const LOCATION_MAP: Record<AdventureSetting, string[]> = {
  derelict_ship: DERELICT_SHIP_LOCATIONS,
  space_station: SPACE_STATION_LOCATIONS,
  planet_surface: PLANET_SURFACE_LOCATIONS,
  anomaly: ANOMALY_LOCATIONS,
  unknown: [...DERELICT_SHIP_LOCATIONS, ...SPACE_STATION_LOCATIONS, ...PLANET_SURFACE_LOCATIONS],
};

export function generateLocations(setting: AdventureSetting, count: number): string[] {
  const locations = LOCATION_MAP[setting] || LOCATION_MAP.unknown;
  const selected: string[] = [];
  const used = new Set<string>();

  while (selected.length < count && selected.length < locations.length) {
    const location = locations[Math.floor(Math.random() * locations.length)];
    if (!used.has(location)) {
      selected.push(location);
      used.add(location);
    }
  }

  return selected;
}
