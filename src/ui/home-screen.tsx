import React from 'react';
import type { SavedGameSummary } from '../core/session';

interface HomeScreenProps {
  onStartNewGame: () => void;
  onContinueGame: (saveId: string) => void;
  onDeleteGame: (saveId: string) => void;
  onOpenConfig: () => void;
  savedGames: SavedGameSummary[];
}

export function HomeScreen({
  onStartNewGame,
  onContinueGame,
  onDeleteGame,
  onOpenConfig,
  savedGames,
}: HomeScreenProps) {
  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div style={styles.page}>
      <div className="hazard-stripe-bar" />

      <main style={styles.mainContainer}>
        {/* Header Branding */}
        <header style={styles.header}>
          <div style={styles.badgeRow}>
            <span className="mosh-tag mosh-tag-yellow">CORE SYSTEM ONLINE</span>
            <span className="mosh-tag mosh-tag-muted">CLASSIFIED // WARDEN EYES ONLY</span>
            <span className="mosh-tag mosh-tag-cyan">TKG-MOSH-1E</span>
          </div>

          <h1 style={styles.title}>
            MOTHERSHIP
            <span style={styles.titleSub}> // VIRTUAL WARDEN</span>
          </h1>

          <p style={styles.tagline}>
            SURVIVE. SOLVE. SAVE. PICK ONE.
          </p>

          <p style={styles.intro}>
            Tactical mission control & AI game master interface for Mothership sci-fi horror RPG.
            Deploy crews, process PDF adventure modules, manage psychological stress, and confront the void.
          </p>
        </header>

        {/* Primary Mission Actions Grid */}
        <div style={styles.grid}>
          {/* Action 1: Start New Game */}
          <section style={styles.cardPrimary}>
            <div style={styles.cardHeader}>
              <span className="mosh-tag mosh-tag-yellow">[ PHASE 01 ]</span>
              <span style={styles.cardHeaderTitle}>NEW EXPEDITION</span>
            </div>

            <div style={styles.cardBody}>
              <h2 style={styles.cardTitle}>INITIATE NEW MISSION</h2>
              <p style={styles.cardDesc}>
                Assemble a survivor squad, establish ship manifest, and supply your Mothership
                adventure module as a PDF.
              </p>

              <div style={styles.specsList}>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>ENGINE:</span>
                  <span style={styles.specVal}>Mothership 1e Panic & Stat Core</span>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>MODULE:</span>
                  <span style={styles.specVal}>PDF Dossier Extraction</span>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>ROSTER:</span>
                  <span style={styles.specVal}>Marine, Android, Scientist, Teamster</span>
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <button
                onClick={onStartNewGame}
                className="mosh-btn mosh-btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                + START NEW MISSION
              </button>
            </div>
          </section>

          {/* Action 2: Continue Game / Saved Sessions */}
          <section style={styles.cardSecondary}>
            <div style={styles.cardHeader}>
              <span className="mosh-tag mosh-tag-cyan">[ LOGS ]</span>
              <span style={styles.cardHeaderTitle}>SAVED EXPEDITIONS ({savedGames.length})</span>
            </div>

            <div style={styles.cardBody}>
              <h2 style={styles.cardTitle}>CONTINUE GAME</h2>
              <p style={styles.cardDesc}>
                Resume an existing expedition with your current ship telemetry, crew psychological records,
                and mission history.
              </p>

              {savedGames.length === 0 ? (
                <div style={styles.emptySaves}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                    // NO STORED TELEMETRY DETECTED //
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Start a new mission and upload a module PDF to begin your first campaign log.
                  </p>
                </div>
              ) : (
                <div style={styles.savesList}>
                  {savedGames.map((save) => (
                    <div key={save.id} style={styles.saveItem}>
                      <div style={styles.saveItemHeader}>
                        <div>
                          <div style={styles.saveShipName}>
                            {save.shipName || 'Unknown Vessel'}
                          </div>
                          <div style={styles.saveAdventureTitle}>
                            MODULE: {save.adventureTitle}
                          </div>
                        </div>
                        <span className="mosh-tag mosh-tag-muted">
                          {save.crewCount} CREW ACTIVE
                        </span>
                      </div>

                      <div style={styles.saveDate}>
                        LOGGED: {formatDate(save.timestamp)}
                      </div>

                      <div style={styles.saveActionRow}>
                        <button
                          onClick={() => onContinueGame(save.id)}
                          className="mosh-btn mosh-btn-cyan"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '11px' }}
                        >
                          RESUME EXPEDITION &rarr;
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Purge telemetry for "${save.shipName}"?`)) {
                              onDeleteGame(save.id);
                            }
                          }}
                          className="mosh-btn mosh-btn-danger"
                          style={{ padding: '8px 12px', fontSize: '11px' }}
                          title="Purge save data"
                        >
                          PURGE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* System Bar Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            <span className="mosh-led-green mosh-led-blink" />
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              WARDEN SUBSYSTEM // OPERATIONAL
            </span>
          </div>

          <div style={styles.footerRight}>
            <button
              onClick={onOpenConfig}
              className="mosh-btn"
              style={{ padding: '6px 12px', fontSize: '11px' }}
            >
              [ WARDEN LINK CONFIG ]
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-space)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer: {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '36px 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    width: '100%',
  },
  header: {
    borderLeft: '4px solid var(--mosh-yellow)',
    paddingLeft: '20px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    marginBottom: '6px',
  },
  titleSub: {
    color: 'var(--mosh-yellow)',
  },
  tagline: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: 'var(--mosh-amber)',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  intro: {
    color: 'var(--text-muted)',
    maxWidth: '720px',
    fontSize: '13px',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
  },
  cardPrimary: {
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-medium)',
    borderTop: '3px solid var(--mosh-yellow)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  cardSecondary: {
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-medium)',
    borderTop: '3px solid var(--mosh-cyan)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  cardHeader: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-console)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardHeaderTitle: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  cardBody: {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    letterSpacing: '0.05em',
    color: 'var(--text-primary)',
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: 'var(--bg-inset)',
    padding: '12px',
    border: '1px solid var(--border-subtle)',
    marginTop: 'auto',
  },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  specLabel: {
    color: 'var(--text-dim)',
  },
  specVal: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  cardFooter: {
    padding: '16px 20px',
    backgroundColor: 'var(--bg-console)',
    borderTop: '1px solid var(--border-subtle)',
  },
  emptySaves: {
    padding: '32px 16px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-inset)',
    border: '1px dashed var(--border-subtle)',
  },
  savesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '340px',
    overflowY: 'auto',
  },
  saveItem: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  saveItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saveShipName: {
    fontWeight: 700,
    fontSize: '13px',
    color: 'var(--mosh-cyan)',
    letterSpacing: '0.04em',
  },
  saveAdventureTitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  saveDate: {
    fontSize: '10px',
    color: 'var(--text-dim)',
  },
  saveActionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-subtle)',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};
