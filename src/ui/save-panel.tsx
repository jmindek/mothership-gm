import React, { useState } from 'react';
import type { GameState } from '../types';

// ─── Save Panel ──────────────────────────────────────────────────────────────

interface SavePanelProps {
  game: GameState;
  onSave: () => void;
  onLoad: (gameId: string) => void;
  onDelete: (gameId: string) => void;
  onExport: () => void;
  onImport: (json: string) => void;
  savedGames: { id: string; title: string; timestamp: number }[];
}

export function SavePanel({
  game,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
  savedGames,
}: SavePanelProps) {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleImport = () => {
    try {
      onImport(importText);
      setImportError('');
    } catch {
      setImportError('Invalid save data');
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Save / Load</h3>

      <div style={styles.actions}>
        <button onClick={onSave} style={styles.button}>
          Save Game
        </button>
        <button onClick={onExport} style={styles.button}>
          Export
        </button>
      </div>

      <div style={styles.savedGames}>
        <h4 style={styles.subTitle}>Saved Games</h4>
        {savedGames.length === 0 ? (
          <p style={styles.text}>No saved games.</p>
        ) : (
          <ul style={styles.gameList}>
            {savedGames.map((sg) => (
              <li key={sg.id} style={styles.gameItem}>
                <span>{sg.title} ({formatTimestamp(sg.timestamp)})</span>
                <div style={styles.gameActions}>
                  <button onClick={() => onLoad(sg.id)} style={styles.smallButton}>
                    Load
                  </button>
                  <button onClick={() => onDelete(sg.id)} style={styles.deleteButton}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.importSection}>
        <h4 style={styles.subTitle}>Import Save</h4>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste save JSON here"
          style={styles.textarea}
        />
        {importError && <p style={styles.error}>{importError}</p>}
        <button onClick={handleImport} disabled={!importText.trim()} style={styles.button}>
          Import
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#0a0a1a',
    color: '#e0e0e0',
    overflowY: 'auto',
  },
  title: {
    margin: '0 0 12px 0',
    color: '#e94560',
    fontSize: '16px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  savedGames: {
    marginBottom: '16px',
  },
  subTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#888',
  },
  gameList: {
    margin: 0,
    paddingLeft: '20px',
  },
  gameItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    fontSize: '13px',
  },
  gameActions: {
    display: 'flex',
    gap: '4px',
  },
  smallButton: {
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#4ade80',
    color: '#000',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  importSection: {},
  textarea: {
    width: '100%',
    height: '80px',
    padding: '8px',
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    color: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'vertical',
    marginBottom: '8px',
  },
  error: {
    color: '#ef4444',
    fontSize: '12px',
    margin: '0 0 8px 0',
  },
  text: {
    fontSize: '12px',
    color: '#888',
  },
};
