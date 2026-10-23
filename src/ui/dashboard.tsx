import type { CrewMember, Ship, ShipSystemName } from '../types';

// ─── Dashboard ───────────────────────────────────────────────────────────────

interface DashboardProps {
  crew: CrewMember[];
  ship: Ship;
  onRepair: (system: ShipSystemName) => void;
}

export function Dashboard({ crew, ship, onRepair }: DashboardProps) {
  const nonFunctionalSystems = Object.values(ship.systems).filter((s) => !s.isFunctional);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Crew</h3>
        {crew.map((c) => (
          <div key={c.id} style={styles.crewCard}>
            <div style={styles.crewHeader}>
              <span style={styles.crewName}>{c.name}</span>
              <span style={styles.crewRole}>{c.role}</span>
              {c.isBreakdown && <span style={styles.breakdown}>BREAKDOWN</span>}
            </div>
            <div style={styles.statsRow}>
              <span>STR {c.stats.STRENGTH}</span>
              <span>DEX {c.stats.DEXTERITY}</span>
              <span>INT {c.stats.INTELLIGENCE}</span>
              <span>PSY {c.stats.PSYCH}</span>
            </div>
            <div style={styles.stressBar}>
              <div style={{ ...styles.stressFill, width: `${c.stress * 10}%` }} />
              <span style={styles.stressLabel}>Stress: {c.stress}/10</span>
            </div>
            {c.compulsion && <div style={styles.compulsion}>Compulsion: {c.compulsion}</div>}
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Ship: {ship.name}</h3>
        <div style={styles.hullBar}>
          <div style={{ ...styles.hullFill, width: `${ship.hullIntegrity * 10}%` }} />
          <span style={styles.hullLabel}>Hull: {ship.hullIntegrity}/10</span>
        </div>
        <div style={styles.systemsGrid}>
          {Object.values(ship.systems).map((sys) => (
            <div key={sys.name} style={{ ...styles.systemCard, borderColor: sys.isFunctional ? '#4ade80' : '#ef4444' }}>
              <span style={styles.systemName}>{sys.name.replace('_', ' ')}</span>
              <div style={styles.systemBar}>
                <div style={{ ...styles.systemFill, width: `${sys.integrity * 10}%` }} />
              </div>
              <span style={styles.systemIntegrity}>{sys.integrity}/10</span>
              {!sys.isFunctional && (
                <button onClick={() => onRepair(sys.name)} style={styles.repairButton}>
                  Repair
                </button>
              )}
            </div>
          ))}
        </div>
        {nonFunctionalSystems.length > 0 && (
          <div style={styles.warning}>
            Non-functional systems: {nonFunctionalSystems.map((s) => s.name.replace('_', ' ')).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#0a0a1a',
    color: '#e0e0e0',
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '12px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#e94560',
    fontSize: '14px',
    textTransform: 'uppercase',
  },
  crewCard: {
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#16213e',
    borderRadius: '4px',
  },
  crewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  crewName: {
    fontWeight: 'bold',
  },
  crewRole: {
    fontSize: '12px',
    color: '#888',
  },
  breakdown: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#888',
  },
  stressBar: {
    height: '8px',
    backgroundColor: '#0f3460',
    borderRadius: '4px',
    marginTop: '4px',
    position: 'relative',
  },
  stressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  stressLabel: {
    position: 'absolute',
    top: '-16px',
    right: '0',
    fontSize: '10px',
    color: '#888',
  },
  compulsion: {
    fontSize: '11px',
    color: '#f59e0b',
    marginTop: '4px',
  },
  hullBar: {
    height: '12px',
    backgroundColor: '#0f3460',
    borderRadius: '4px',
    marginBottom: '12px',
    position: 'relative',
  },
  hullFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  hullLabel: {
    position: 'absolute',
    top: '-16px',
    right: '0',
    fontSize: '10px',
    color: '#888',
  },
  systemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '8px',
  },
  systemCard: {
    padding: '8px',
    borderRadius: '4px',
    border: '2px solid #4ade80',
  },
  systemName: {
    fontSize: '11px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  systemBar: {
    height: '6px',
    backgroundColor: '#0f3460',
    borderRadius: '3px',
    marginBottom: '2px',
  },
  systemFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: '3px',
  },
  systemIntegrity: {
    fontSize: '10px',
    color: '#888',
  },
  repairButton: {
    marginTop: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  warning: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#7f1d1d',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#fca5a5',
  },
};
