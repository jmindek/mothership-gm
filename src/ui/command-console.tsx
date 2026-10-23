import React, { useState, useRef, useEffect } from 'react';
import type { GameState, CrewMember, ShipSystemName } from '../types';

interface Message {
  type: 'warden' | 'player' | 'system';
  content: string;
  playerName?: string;
  timestamp?: number;
}

interface CommandConsoleProps {
  game: GameState;
  wardenResponses: Message[];
  isProcessing: boolean;
  onAction: (action: string) => void;
  onSave: () => void;
  onExport: () => void;
  onRepair: (system: ShipSystemName) => void;
  onUpdateCrewStress: (crewId: string, delta: number) => void;
  onOpenConfig: () => void;
  onReturnHome: () => void;
}

export function CommandConsole({
  game,
  wardenResponses,
  isProcessing,
  onAction,
  onSave,
  onExport,
  onRepair,
  onUpdateCrewStress,
  onOpenConfig,
  onReturnHome,
}: CommandConsoleProps) {
  const [input, setInput] = useState('');
  const [showDossier, setShowDossier] = useState(true);
  const [saveToast, setSaveToast] = useState(false);
  const [diceLog, setDiceLog] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wardenResponses, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onAction(input.trim());
    setInput('');
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isProcessing) return;
    onAction(promptText);
  };

  const triggerSaveWithFeedback = () => {
    onSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Tactical Dice Roller Handlers
  const rollD100 = (statName?: string, target?: number) => {
    const roll = Math.floor(Math.random() * 100) + 1;
    const isDouble = roll % 11 === 0 || roll === 100;
    const critText = isDouble ? ' [CRITICAL!]' : '';
    let resultMsg = `DICE // Rolled d100: [ ${roll} ]${critText}`;
    if (statName && target !== undefined) {
      const success = roll <= target;
      resultMsg += ` vs ${statName} (${target}) &rarr; ${success ? 'SUCCESS' : 'FAILURE'}`;
    }
    setDiceLog(resultMsg);
    onAction(`[SURVIVOR ROLLED D100]: ${roll}${critText}`);
  };

  const rollPanic = (crewName: string, stress: number) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const panics = roll <= stress;
    const panicEffects = [
      'Laser Focus (+1 to next roll)',
      'Major Adrenaline Rush',
      'Distrustful (will not accept aid)',
      'Rattled (-1 to next roll)',
      'Flight (must retreat immediately)',
      'Freeze (incapacitated for 1 round)',
      'Scream (increases nearby crew stress +1)',
      'Berserk (attacks nearest target)',
      'Catatonic (faints / unresponsive)',
      'Heart Attack / Total Shock',
    ];
    const effect = panics
      ? panicEffects[Math.min(roll - 1, panicEffects.length - 1)]
      : 'Maintains Composure';

    const resultMsg = `PANIC CHECK // ${crewName} rolled 1d20: [ ${roll} ] vs Stress (${stress}) &rarr; ${
      panics ? `PANIC! Effect: ${effect}` : 'COMPOSED'
    }`;
    setDiceLog(resultMsg);
    onAction(`[PANIC CHECK]: ${crewName} rolled 1d20: ${roll} vs Stress (${stress}). Outcome: ${effect}`);
  };

  const roll2d6 = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const resultMsg = `DICE // Rolled 2d6: [ ${d1} + ${d2} = ${total} ]`;
    setDiceLog(resultMsg);
    onAction(`[SURVIVOR ROLLED 2D6]: ${d1} + ${d2} = ${total}`);
  };

  const activeAct = game.adventure?.acts.find(
    (a) => a.id === game.adventureProgress.currentActId
  ) || game.adventure?.acts[0];

  const selectedScen = game.adventure?.standaloneScenarios?.find(
    (s) => s.id === game.adventure?.selectedScenarioId
  );
  const missionDisplayName = selectedScen
    ? `${game.adventure?.title}: ${selectedScen.title}`
    : (game.adventure?.title || 'DEEP VOID PATROL');

  return (
    <div style={styles.consoleContainer}>
      <div className="hazard-stripe-bar" />

      {/* Top Tactical Command Header */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.brandTag}>
            <span style={{ color: 'var(--mosh-yellow)', fontWeight: 800 }}>MOTHERSHIP</span>
            <span style={{ color: 'var(--text-muted)' }}>// TAC-COM</span>
          </div>

          <div style={styles.missionBadge}>
            <span className="mosh-tag mosh-tag-yellow">MISSION</span>
            <span style={styles.missionTitle}>
              {missionDisplayName}
            </span>
          </div>

          <div style={styles.shipBadge}>
            <span style={{ color: 'var(--text-dim)' }}>VESSEL:</span>
            <span style={{ color: 'var(--mosh-cyan)', fontWeight: 700 }}>
              {game.ship.name}
            </span>
            <span className="mosh-tag mosh-tag-green">
              HULL: {game.ship.hullIntegrity}/10
            </span>
          </div>
        </div>

        <div style={styles.topBarRight}>
          <div style={styles.statusIndicator}>
            <span className="mosh-led-green mosh-led-blink" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WARDEN LINK ACTIVE</span>
          </div>

          <button
            onClick={triggerSaveWithFeedback}
            className="mosh-btn mosh-btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            {saveToast ? 'SAVED!' : 'QUICK SAVE'}
          </button>

          <button
            onClick={onExport}
            className="mosh-btn"
            style={{ padding: '6px 10px', fontSize: '11px' }}
            title="Export save JSON to clipboard"
          >
            EXPORT
          </button>

          <button
            onClick={() => setShowDossier(!showDossier)}
            className={`mosh-btn ${showDossier ? 'mosh-btn-cyan' : ''}`}
            style={{ padding: '6px 10px', fontSize: '11px' }}
          >
            DOSSIER {showDossier ? '[-]' : '[+]'}
          </button>

          <button
            onClick={onOpenConfig}
            className="mosh-btn"
            style={{ padding: '6px 10px', fontSize: '11px' }}
            title="LLM connection settings"
          >
            CONFIG
          </button>

          <button
            onClick={() => {
              if (window.confirm('Return to Mission HQ? Ensure you have saved your telemetry.')) {
                onReturnHome();
              }
            }}
            className="mosh-btn"
            style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)' }}
          >
            HQ
          </button>
        </div>
      </header>

      {/* Main Console Viewport */}
      <div style={styles.mainViewport}>
        {/* Left Column: Tactical Telemetry & Vitals */}
        <aside style={styles.telemetrySidebar}>
          {/* Crew Vitals Section */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span className="mosh-tag mosh-tag-yellow">ROSTER</span>
              <span style={styles.panelHeaderTitle}>SURVIVOR VITALS ({game.crew.length})</span>
            </div>

            <div style={styles.crewList}>
              {game.crew.map((member) => {
                const isHighStress = member.stress >= 7;
                const isCriticalStress = member.stress >= 9;

                return (
                  <div
                    key={member.id}
                    style={{
                      ...styles.crewCard,
                      borderLeft: isCriticalStress
                        ? '3px solid var(--mosh-red)'
                        : isHighStress
                        ? '3px solid var(--mosh-amber)'
                        : '3px solid var(--border-medium)',
                    }}
                  >
                    <div style={styles.crewCardTop}>
                      <div>
                        <div style={styles.memberName}>{member.name}</div>
                        <div style={styles.memberRole}>{member.role}</div>
                      </div>
                      <span
                        className={`mosh-tag ${
                          member.isBreakdown
                            ? 'mosh-tag-red'
                            : isCriticalStress
                            ? 'mosh-tag-red'
                            : isHighStress
                            ? 'mosh-tag-yellow'
                            : 'mosh-tag-muted'
                        }`}
                      >
                        {member.isBreakdown ? 'BREAKDOWN' : `STRESS: ${member.stress}/10`}
                      </span>
                    </div>

                    {/* Stress Pip Meter */}
                    <div style={styles.stressMeter}>
                      <div
                        style={{
                          ...styles.stressMeterFill,
                          width: `${Math.min(member.stress * 10, 100)}%`,
                          backgroundColor:
                            member.stress >= 8
                              ? 'var(--mosh-red)'
                              : member.stress >= 5
                              ? 'var(--mosh-amber)'
                              : 'var(--mosh-green)',
                        }}
                      />
                    </div>

                    {/* Compact Stats */}
                    <div style={styles.statsRow}>
                      <span>STR {member.stats.STRENGTH}</span>
                      <span>DEX {member.stats.DEXTERITY}</span>
                      <span>INT {member.stats.INTELLIGENCE}</span>
                      <span>PSY {member.stats.PSYCH}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span>HP: {member.health || 14}</span>
                      <span>WOUNDS: {member.wounds || 0}/{member.maxWounds || 2}</span>
                      {member.patch && (
                        <span style={{ color: 'var(--mosh-yellow)', fontSize: '9px' }} title={`Patch: "${member.patch}"`}>
                          [{member.patch.slice(0, 15)}...]
                        </span>
                      )}
                    </div>

                    {/* Crew Quick Controls */}
                    <div style={styles.crewControlsRow}>
                      <button
                        onClick={() => onUpdateCrewStress(member.id, 1)}
                        className="mosh-btn"
                        style={{ padding: '2px 6px', fontSize: '10px' }}
                        title="Increase Stress +1"
                      >
                        + STRESS
                      </button>
                      <button
                        onClick={() => onUpdateCrewStress(member.id, -1)}
                        className="mosh-btn"
                        style={{ padding: '2px 6px', fontSize: '10px' }}
                        title="Relieve Stress -1"
                      >
                        - RELIEF
                      </button>
                      <button
                        onClick={() => rollPanic(member.name, member.stress)}
                        className="mosh-btn mosh-btn-danger"
                        style={{ padding: '2px 6px', fontSize: '10px', marginLeft: 'auto' }}
                      >
                        PANIC 1d20
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ship Systems Section */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span className="mosh-tag mosh-tag-cyan">SYSTEMS</span>
              <span style={styles.panelHeaderTitle}>SHIP INTEGRITY</span>
            </div>

            <div style={styles.systemsGrid}>
              {Object.values(game.ship.systems).map((sys) => (
                <div key={sys.name} style={styles.systemRow}>
                  <div style={styles.systemInfo}>
                    <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                      {sys.name.replace('_', ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: sys.integrity <= 3 ? 'var(--mosh-red)' : 'var(--text-muted)',
                      }}
                    >
                      {sys.integrity}/10
                    </span>
                  </div>

                  <div style={styles.systemBar}>
                    <div
                      style={{
                        ...styles.systemBarFill,
                        width: `${sys.integrity * 10}%`,
                        backgroundColor:
                          sys.integrity <= 3
                            ? 'var(--mosh-red)'
                            : sys.integrity <= 6
                            ? 'var(--mosh-amber)'
                            : 'var(--mosh-cyan)',
                      }}
                    />
                  </div>

                  {!sys.isFunctional && (
                    <button
                      onClick={() => onRepair(sys.name)}
                      className="mosh-btn mosh-btn-primary"
                      style={{ padding: '2px 6px', fontSize: '9px', marginTop: '4px' }}
                    >
                      REPAIR
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tactical Dice Roller */}
          <div style={styles.panelSection}>
            <div style={styles.panelHeader}>
              <span className="mosh-tag mosh-tag-yellow">DICE TRAY</span>
              <span style={styles.panelHeaderTitle}>FIELD ROLLER</span>
            </div>

            <div style={styles.diceButtonsRow}>
              <button
                onClick={() => rollD100()}
                className="mosh-btn mosh-btn-primary"
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                ROLL d100
              </button>
              <button
                onClick={() => roll2d6()}
                className="mosh-btn"
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                ROLL 2d6
              </button>
            </div>

            {diceLog && (
              <div style={styles.diceResultBanner}>
                {diceLog}
              </div>
            )}
          </div>
        </aside>

        {/* Center Column: The Warden Terminal (Narrative Log) */}
        <section style={styles.terminalCenter}>
          <div style={styles.terminalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mosh-tag mosh-tag-yellow">TRANSMISSION LOG</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ENCRYPTED WARDEN FREQUENCY // 842.1 MHz
              </span>
            </div>

            {isProcessing && (
              <div style={styles.decodingBadge}>
                <span className="mosh-led-green mosh-led-blink" />
                <span style={{ fontSize: '11px', color: 'var(--mosh-yellow)' }}>
                  RECEIVING TRANSMISSION...
                </span>
              </div>
            )}
          </div>

          {/* Message Stream */}
          <div style={styles.messageStream}>
            {wardenResponses.map((msg, index) => {
              if (msg.type === 'warden') {
                return (
                  <div key={index} style={styles.wardenBubble}>
                    <div style={styles.messageMeta}>
                      <span className="mosh-tag mosh-tag-yellow">[ WARDEN // TRANSMISSION ]</span>
                    </div>
                    <div style={styles.wardenContent}>
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.type === 'player') {
                return (
                  <div key={index} style={styles.playerBubble}>
                    <div style={styles.messageMeta}>
                      <span className="mosh-tag mosh-tag-cyan">
                        [ SURVIVOR // {msg.playerName || 'SURVIVOR'} ]
                      </span>
                    </div>
                    <div style={styles.playerContent}>
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} style={styles.systemBubble}>
                  <span className="mosh-tag mosh-tag-muted">[ SYSTEM TELEMETRY ]</span>
                  <div style={{ color: 'var(--mosh-amber)', marginTop: '4px' }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div style={styles.typingIndicator}>
                <span className="mosh-led-green mosh-led-blink" />
                <span>The Warden is analyzing the operational environment...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Tactical Action Chips */}
          <div style={styles.quickChipsBar}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>
              TACTICAL ACTIONS:
            </span>
            {[
              'Examine immediate area for threats and clues',
              'Scan for bio-signatures or anomalous motion',
              'Inspect and seal the bulkheads',
              'Ready weapons and take defensive posture',
              'Attempt radio contact with dispatch',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isProcessing}
                className="mosh-btn"
                style={{ padding: '3px 8px', fontSize: '10px' }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Action Input Form */}
          <form onSubmit={handleSubmit} style={styles.inputForm}>
            <div style={styles.inputPrefix}>&gt;</div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter orders or action (e.g. 'I unseal the airlock and examine the distress beacon')..."
              disabled={isProcessing}
              style={styles.actionInput}
              autoFocus
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="mosh-btn mosh-btn-primary"
              style={{ padding: '10px 20px', minWidth: '110px' }}
            >
              {isProcessing ? 'TRANSMITTING...' : 'TRANSMIT'}
            </button>
          </form>
        </section>

        {/* Right Column: Mission Dossier (Collapsible) */}
        {showDossier && (
          <aside style={styles.dossierSidebar}>
            <div style={styles.panelSection}>
              <div style={styles.panelHeader}>
                <span className="mosh-tag mosh-tag-yellow">DOSSIER</span>
                <span style={styles.panelHeaderTitle}>MISSION BRIEFING</span>
              </div>

              <div style={styles.dossierContent}>
                <h3 style={styles.dossierTitle}>
                  {game.adventure?.title || 'Unknown Sector'}
                </h3>
                <p style={styles.dossierDesc}>
                  {game.adventure?.description || 'No briefing details.'}
                </p>

                {activeAct && (
                  <div style={styles.actBox}>
                    <div style={styles.actBoxHeader}>
                      <span className="mosh-tag mosh-tag-yellow">CURRENT OBJECTIVE</span>
                    </div>
                    <div style={styles.actTitle}>{activeAct.title}</div>
                    <p style={styles.actDesc}>{activeAct.description}</p>
                  </div>
                )}

                {/* Clues Discovered */}
                <div style={styles.cluesBox}>
                  <div style={styles.cluesHeader}>
                    <span>DISCOVERED INTEL / CLUES</span>
                    <span className="mosh-tag mosh-tag-cyan">
                      {game.adventureProgress.discoveredClues.length}
                    </span>
                  </div>

                  {game.adventureProgress.discoveredClues.length === 0 ? (
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      // No intelligence logged yet. Investigate the environment to uncover clues.
                    </p>
                  ) : (
                    <ul style={styles.clueList}>
                      {game.adventureProgress.discoveredClues.map((clue, i) => (
                        <li key={i} style={styles.clueItem}>
                          {clue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* PDF Module Specs */}
                {game.adventure?.sourceText && (
                  <div style={styles.moduleSpecsBox}>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>
                      CONFIDENTIAL WARDEN REFERENCE:
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--mosh-green)' }}>
                      &bull; Indexed Module Source: {Math.round(game.adventure.sourceText.length / 1024)} KB
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      The AI Warden references this full module text when narrating rooms, traps, secrets, and monsters.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  consoleContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-space)',
    color: 'var(--text-primary)',
    overflow: 'hidden',
  },
  topBar: {
    backgroundColor: 'var(--bg-hull)',
    borderBottom: '1px solid var(--border-subtle)',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  brandTag: {
    display: 'flex',
    gap: '6px',
    fontSize: '12px',
    letterSpacing: '0.06em',
  },
  missionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  missionTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '0.04em',
  },
  shipBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
    backgroundColor: 'var(--bg-inset)',
    padding: '3px 8px',
    border: '1px solid var(--border-subtle)',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginRight: '8px',
  },
  mainViewport: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  telemetrySidebar: {
    width: '320px',
    backgroundColor: 'var(--bg-hull)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '12px',
    gap: '12px',
  },
  panelSection: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-console)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  panelHeaderTitle: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
  },
  crewList: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  crewCard: {
    backgroundColor: 'var(--bg-inset)',
    padding: '8px 10px',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  crewCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberName: {
    fontWeight: 700,
    fontSize: '12px',
  },
  memberRole: {
    fontSize: '10px',
    color: 'var(--text-dim)',
  },
  stressMeter: {
    height: '6px',
    backgroundColor: 'var(--bg-space)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
  stressMeterFill: {
    height: '100%',
    transition: 'width 0.25s ease',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  crewControlsRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    marginTop: '2px',
  },
  systemsGrid: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  systemRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  systemInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemBar: {
    height: '4px',
    backgroundColor: 'var(--bg-space)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
  systemBarFill: {
    height: '100%',
    transition: 'width 0.25s ease',
  },
  diceButtonsRow: {
    padding: '10px',
    display: 'flex',
    gap: '8px',
  },
  diceResultBanner: {
    padding: '8px 10px',
    backgroundColor: 'var(--bg-inset)',
    borderTop: '1px solid var(--border-subtle)',
    fontSize: '11px',
    color: 'var(--mosh-yellow)',
    fontWeight: 600,
  },
  terminalCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-space)',
    overflow: 'hidden',
  },
  terminalHeader: {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-hull)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decodingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  messageStream: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageMeta: {
    marginBottom: '6px',
  },
  wardenBubble: {
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-medium)',
    borderLeft: '4px solid var(--mosh-yellow)',
    padding: '14px 16px',
    maxWidth: '92%',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
  wardenContent: {
    color: 'var(--text-primary)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
  },
  playerBubble: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderLeft: '4px solid var(--mosh-cyan)',
    padding: '12px 16px',
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  playerContent: {
    color: 'var(--mosh-cyan)',
    lineHeight: 1.5,
    fontSize: '13px',
    fontWeight: 600,
  },
  systemBubble: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg-inset)',
    border: '1px dashed var(--border-medium)',
    alignSelf: 'center',
    fontSize: '12px',
    maxWidth: '85%',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--mosh-yellow)',
    fontSize: '12px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-hull)',
    alignSelf: 'flex-start',
  },
  quickChipsBar: {
    padding: '8px 16px',
    backgroundColor: 'var(--bg-hull)',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflowX: 'auto',
  },
  inputForm: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-console)',
    borderTop: '1px solid var(--border-medium)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  inputPrefix: {
    color: 'var(--mosh-yellow)',
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: 800,
  },
  actionInput: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  dossierSidebar: {
    width: '320px',
    backgroundColor: 'var(--bg-hull)',
    borderLeft: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '12px',
    gap: '12px',
  },
  dossierContent: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  dossierTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    color: 'var(--text-primary)',
  },
  dossierDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  actBox: {
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-subtle)',
    padding: '10px',
  },
  actBoxHeader: {
    marginBottom: '6px',
  },
  actTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--mosh-yellow)',
    marginBottom: '4px',
  },
  actDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  cluesBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cluesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-muted)',
  },
  clueList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  clueItem: {
    fontSize: '11px',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-card)',
    padding: '6px 8px',
    borderLeft: '2px solid var(--mosh-cyan)',
  },
  moduleSpecsBox: {
    backgroundColor: 'var(--bg-inset)',
    padding: '10px',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
};
