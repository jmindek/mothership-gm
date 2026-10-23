import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { extractAdventureFromPdf } from '../adventures/loader';
import { PREGEN_CREW, generateQuickCrewSquad } from '../core/crew-generator';
import type { Adventure, CrewMember } from '../types';

// Ensure worker is configured locally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfAdventureUploadProps {
  onComplete: (adventure: Adventure, shipName: string, crew: CrewMember[]) => void;
  onCancel: () => void;
}

export function PdfAdventureUpload({ onComplete, onCancel }: PdfAdventureUploadProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedAdventure, setExtractedAdventure] = useState<Adventure | null>(null);
  const [shipName, setShipName] = useState('USC Nostromo');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-1');
  const [isDragging, setIsDragging] = useState(false);
  const [crewMode, setCrewMode] = useState<'pregen' | 'quick-roll'>('pregen');
  const [crewList, setCrewList] = useState<CrewMember[]>(PREGEN_CREW);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPregen = () => {
    setCrewMode('pregen');
    setCrewList(PREGEN_CREW);
  };

  const handleQuickRoll = () => {
    setCrewMode('quick-roll');
    setCrewList(generateQuickCrewSquad());
  };

  const handleNameChange = (index: number, newName: string) => {
    setCrewList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: newName };
      return next;
    });
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please provide an authentic Mothership PDF module.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const totalPages = pdf.numPages;

      let fullText = '';
      for (let i = 1; i <= totalPages; i++) {
        setProgress({ current: i, total: totalPages });
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- [PAGE ${i}] ---\n` + pageText;
      }

      const adventure = extractAdventureFromPdf(fullText, file.name, totalPages);
      setExtractedAdventure(adventure);
      if (adventure.standaloneScenarios && adventure.standaloneScenarios.length > 0) {
        setSelectedScenarioId(adventure.standaloneScenarios[0].id);
      }
    } catch (err) {
      setError(
        `Failed to parse PDF module: ${err instanceof Error ? err.message : 'Unknown parsing error'}`
      );
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLaunch = () => {
    if (!extractedAdventure) return;
    const updatedAdventure: Adventure = {
      ...extractedAdventure,
      selectedScenarioId,
    };
    onComplete(updatedAdventure, shipName.trim() || 'USC Nostromo', crewList);
  };

  return (
    <div style={styles.page}>
      <div className="hazard-stripe-bar" />

      <main style={styles.container}>
        {/* Navigation Breadcrumb */}
        <div style={styles.breadcrumb}>
          <button onClick={onCancel} className="mosh-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>
            &larr; RETURN TO HQ
          </button>
          <span style={{ color: 'var(--text-dim)' }}>//</span>
          <span style={{ color: 'var(--mosh-yellow)', fontSize: '11px', fontWeight: 700 }}>
            PHASE 02: SUPPLY ADVENTURE DOSSIER (PDF)
          </span>
        </div>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.badgeRow}>
            <span className="mosh-tag mosh-tag-yellow">STEP 2 OF 2</span>
            <span className="mosh-tag mosh-tag-muted">MODULE PROVISIONING</span>
          </div>

          <h1 style={styles.title}>SUPPLY MISSION DOSSIER</h1>
          <p style={styles.desc}>
            Upload your Mothership RPG adventure module in PDF format. The system will extract
            location layouts, monster statistics, hazard tables, and narrative hooks to brief the AI Warden.
          </p>
        </header>

        {/* Upload Dropzone */}
        {!extractedAdventure && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...styles.dropzone,
              borderColor: isDragging ? 'var(--mosh-yellow)' : 'var(--border-medium)',
              backgroundColor: isDragging ? 'rgba(255, 230, 0, 0.05)' : 'var(--bg-hull)',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />

            <div style={styles.dropzoneIcon}>
              [ PDF // DOSSIER ]
            </div>

            <div style={styles.dropzoneTitle}>
              {loading ? 'ANALYZING MISSION DOSSIER...' : 'CLICK OR DRAG MOTHERSHIP MODULE PDF HERE'}
            </div>

            <div style={styles.dropzoneHint}>
              Supports official Mothership 1e adventure PDFs (e.g., <em>Another Bug Hunt</em>, <em>Dead Planet</em>, <em>Gradient Descent</em>)
            </div>

            {loading && progress && (
              <div style={styles.progressContainer}>
                <div style={styles.progressLabel}>
                  EXTRACTING MISSION PAGES: {progress.current} / {progress.total}
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!loading && (
              <button
                type="button"
                className="mosh-btn mosh-btn-primary"
                style={{ marginTop: '16px', pointerEvents: 'none' }}
              >
                SELECT PDF MODULE
              </button>
            )}
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            <span className="mosh-tag mosh-tag-red">ERROR</span>
            <span>{error}</span>
          </div>
        )}

        {/* Module Extracted Overview & Manifest Confirmation */}
        {extractedAdventure && (
          <div style={styles.readyCard}>
            <div style={styles.readyHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mosh-tag mosh-tag-green">MODULE PARSED</span>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>
                  {extractedAdventure.title}
                </span>
              </div>
              <button
                onClick={() => setExtractedAdventure(null)}
                className="mosh-btn"
                style={{ padding: '4px 8px', fontSize: '10px' }}
              >
                REPLACE PDF
              </button>
            </div>

            <div style={styles.readyBody}>
              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>ADVENTURE ID:</span>
                  <span style={styles.metaVal}>{extractedAdventure.id}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>MODULE TYPE:</span>
                  <span style={styles.metaVal}>
                    {extractedAdventure.standaloneScenarios && extractedAdventure.standaloneScenarios.length > 1
                      ? `Anthology (${extractedAdventure.standaloneScenarios.length} Scenarios)`
                      : 'Single Mission Arc'}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>TOTAL PAGES:</span>
                  <span style={styles.metaVal}>{progress ? progress.total : 'Indexed'}</span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>INDEXED DOSSIER:</span>
                  <span style={styles.metaVal}>
                    {Math.round((extractedAdventure.sourceText?.length || 0) / 1024)} KB Extracted
                  </span>
                </div>
              </div>

              {/* Conditional: If separate standalone scenarios exist, allow selecting which to run */}
              {extractedAdventure.standaloneScenarios && extractedAdventure.standaloneScenarios.length > 1 ? (
                <div style={styles.scenarioSelectBox}>
                  <div style={styles.scenarioSelectHeader}>
                    <span className="mosh-tag mosh-tag-yellow">SELECT SCENARIO</span>
                    <span style={styles.scenarioSelectTitle}>
                      CHOOSE OPERATIONAL SCENARIO FOR THE VIRTUAL WARDEN:
                    </span>
                  </div>
                  <p style={styles.scenarioSelectSubtitle}>
                    This module contains multiple separate scenarios. Choose which mission the Virtual Warden should execute:
                  </p>

                  <div style={styles.scenarioList}>
                    {extractedAdventure.standaloneScenarios.map((scen) => {
                      const isSelected = selectedScenarioId === scen.id;
                      return (
                        <div
                          key={scen.id}
                          onClick={() => setSelectedScenarioId(scen.id)}
                          style={{
                            ...styles.scenarioCard,
                            borderColor: isSelected ? 'var(--mosh-yellow)' : 'var(--border-subtle)',
                            backgroundColor: isSelected ? 'rgba(255, 230, 0, 0.07)' : 'var(--bg-card)',
                          }}
                        >
                          <div style={styles.scenarioCardTop}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="radio"
                                name="scenarioChoice"
                                checked={isSelected}
                                onChange={() => setSelectedScenarioId(scen.id)}
                                style={{ accentColor: 'var(--mosh-yellow)', cursor: 'pointer' }}
                              />
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  color: isSelected ? 'var(--mosh-yellow)' : 'var(--text-primary)',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {scen.title}
                              </span>
                            </div>

                            {scen.number === '1' && (
                              <span className="mosh-tag mosh-tag-green" style={{ fontSize: '9px' }}>
                                RECOMMENDED START
                              </span>
                            )}
                          </div>

                          <p style={styles.scenarioCardDesc}>
                            {scen.description}
                          </p>
                        </div>
                      );
                    })}

                    {/* Option: Play Full Anthology Campaign in sequence */}
                    <div
                      onClick={() => setSelectedScenarioId('all')}
                      style={{
                        ...styles.scenarioCard,
                        borderColor: selectedScenarioId === 'all' ? 'var(--mosh-yellow)' : 'var(--border-subtle)',
                        backgroundColor: selectedScenarioId === 'all' ? 'rgba(255, 230, 0, 0.07)' : 'var(--bg-card)',
                      }}
                    >
                      <div style={styles.scenarioCardTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="scenarioChoice"
                            checked={selectedScenarioId === 'all'}
                            onChange={() => setSelectedScenarioId('all')}
                            style={{ accentColor: 'var(--mosh-yellow)', cursor: 'pointer' }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: selectedScenarioId === 'all' ? 'var(--mosh-yellow)' : 'var(--text-primary)',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Full Campaign: Run All Scenarios in Sequence
                          </span>
                        </div>

                        <span className="mosh-tag mosh-tag-cyan" style={{ fontSize: '9px' }}>
                          FULL ARC
                        </span>
                      </div>

                      <p style={styles.scenarioCardDesc}>
                        The Virtual Warden will begin with Scenario 1 and smoothly transition the surviving crew into subsequent scenarios as objectives are resolved.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Otherwise: Single continuous adventure — DO NOT reveal upcoming scenes to avoid spoilers! */
                <div style={styles.spoilerShieldBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mosh-tag mosh-tag-cyan">SPOILER SHIELD ACTIVE</span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                      MISSION DOSSIER SEALED // CLASSIFIED WARDEN EYES ONLY
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
                    All operational text, environmental maps, encounter tables, and plot twists have been indexed for the Virtual Warden. Upcoming story scenes remain confidential to protect survival horror suspense.
                  </p>
                </div>
              )}

              {/* Ship Manifest config */}
              <div style={styles.manifestSection}>
                <label style={styles.inputLabel}>
                  VESSEL REGISTRATION NAME:
                </label>
                <input
                  type="text"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  placeholder="e.g. USC Nostromo, CSS Miranda"
                  style={styles.textInput}
                />
              </div>

              {/* Crew Manifest Preview & Generator */}
              <div style={styles.crewSection}>
                <div style={styles.crewHeaderRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.inputLabel}>SURVIVOR SQUAD MANIFEST (4 CREW):</span>
                    <span className="mosh-tag mosh-tag-cyan">MOTHERSHIP 1E ROSTER</span>
                  </div>

                  <div style={styles.crewModeToggle}>
                    <button
                      type="button"
                      onClick={handleSelectPregen}
                      className={`mosh-btn ${crewMode === 'pregen' ? 'mosh-btn-primary' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      PRE-GEN SQUAD
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickRoll}
                      className={`mosh-btn ${crewMode === 'quick-roll' ? 'mosh-btn-primary' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      🎲 QUICK CREW ROLL
                    </button>
                    {crewMode === 'quick-roll' && (
                      <button
                        type="button"
                        onClick={handleQuickRoll}
                        className="mosh-btn mosh-btn-cyan"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        title="Re-roll all characters"
                      >
                        RE-ROLL ALL ↻
                      </button>
                    )}
                  </div>
                </div>

                <div style={styles.crewGrid}>
                  {crewList.map((c, idx) => (
                    <div key={c.id} style={styles.crewCard}>
                      <div style={styles.crewCardHeader}>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => handleNameChange(idx, e.target.value)}
                          style={styles.crewNameInput}
                          title="Click to rename survivor"
                        />
                        <span
                          className={`mosh-tag ${
                            c.role === 'MARINE'
                              ? 'mosh-tag-red'
                              : c.role === 'ANDROID'
                              ? 'mosh-tag-cyan'
                              : c.role === 'SCIENTIST'
                              ? 'mosh-tag-green'
                              : 'mosh-tag-yellow'
                          }`}
                        >
                          {c.role}
                        </span>
                      </div>

                      <div style={styles.crewCardStats}>
                        <span>STR {c.stats.STRENGTH}</span>
                        <span>DEX {c.stats.DEXTERITY}</span>
                        <span>INT {c.stats.INTELLIGENCE}</span>
                        <span>PSY {c.stats.PSYCH}</span>
                      </div>

                      <div style={styles.crewCardVitals}>
                        <span>HP: {c.health || 14}</span>
                        <span>WOUNDS: {c.maxWounds || 2}</span>
                        <span style={{ color: 'var(--mosh-amber)', fontWeight: 700 }}>
                          STRESS: {c.stress}
                        </span>
                      </div>

                      {c.loadout && (
                        <div style={styles.crewFlavorRow}>
                          <span style={styles.flavorLabel}>GEAR:</span>
                          <span style={styles.flavorValue}>{c.loadout}</span>
                        </div>
                      )}

                      {c.patch && (
                        <div style={styles.crewFlavorRow}>
                          <span style={styles.flavorLabel}>PATCH:</span>
                          <span style={{ ...styles.flavorValue, color: 'var(--mosh-yellow)' }}>
                            "{c.patch}"
                          </span>
                        </div>
                      )}

                      {c.trinket && (
                        <div style={styles.crewFlavorRow}>
                          <span style={styles.flavorLabel}>TRINKET:</span>
                          <span style={styles.flavorValue}>{c.trinket}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Launch CTA */}
            <div style={styles.readyFooter}>
              <button
                onClick={handleLaunch}
                className="mosh-btn mosh-btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '13px' }}
              >
                INITIALIZE COMMAND CONSOLE // DEPLOY CREW &rarr;
              </button>
            </div>
          </div>
        )}
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
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '24px 20px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  header: {
    borderLeft: '4px solid var(--mosh-yellow)',
    paddingLeft: '16px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-primary)',
    marginBottom: '8px',
  },
  desc: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    lineHeight: 1.6,
    maxWidth: '720px',
  },
  dropzone: {
    border: '2px dashed var(--border-medium)',
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dropzoneIcon: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--mosh-yellow)',
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  dropzoneTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  dropzoneHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    maxWidth: '480px',
  },
  progressContainer: {
    width: '100%',
    maxWidth: '380px',
    marginTop: '16px',
  },
  progressLabel: {
    fontSize: '11px',
    color: 'var(--mosh-yellow)',
    marginBottom: '6px',
    fontWeight: 700,
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-medium)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--mosh-yellow)',
    transition: 'width 0.1s linear',
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 42, 42, 0.15)',
    border: '1px solid var(--mosh-red)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
  },
  readyCard: {
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-medium)',
    borderTop: '3px solid var(--mosh-green)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  readyHeader: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-console)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readyBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    backgroundColor: 'var(--bg-inset)',
    padding: '12px',
    border: '1px solid var(--border-subtle)',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaLabel: {
    fontSize: '10px',
    color: 'var(--text-dim)',
    fontWeight: 700,
  },
  metaVal: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  scenarioSelectBox: {
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-medium)',
    borderLeft: '3px solid var(--mosh-yellow)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  scenarioSelectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scenarioSelectTitle: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-primary)',
  },
  scenarioSelectSubtitle: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  scenarioList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  scenarioCard: {
    padding: '12px',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  scenarioCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scenarioCardDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    paddingLeft: '24px',
    lineHeight: 1.4,
  },
  spoilerShieldBox: {
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-subtle)',
    borderLeft: '3px solid var(--mosh-cyan)',
    padding: '14px 16px',
  },
  manifestSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
  },
  textInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  crewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  crewHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  crewModeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  crewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  crewCard: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  crewCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  crewNameInput: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: '12px',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    padding: '2px 4px',
    width: '100%',
    outline: 'none',
  },
  crewCardStats: {
    display: 'flex',
    gap: '10px',
    fontSize: '10px',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '6px',
  },
  crewCardVitals: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  crewFlavorRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    fontSize: '10px',
    lineHeight: 1.3,
  },
  flavorLabel: {
    color: 'var(--text-dim)',
    fontWeight: 700,
    fontSize: '9px',
  },
  flavorValue: {
    color: 'var(--text-muted)',
  },
  readyFooter: {
    padding: '16px 20px',
    backgroundColor: 'var(--bg-console)',
    borderTop: '1px solid var(--border-subtle)',
  },
};
