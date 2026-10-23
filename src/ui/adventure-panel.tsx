import type { Adventure, AdventureProgress } from '../types';

// ─── Adventure Panel ─────────────────────────────────────────────────────────

interface AdventurePanelProps {
  adventure: Adventure | null;
  progress: AdventureProgress;
  onJumpToScene: (actId: string, sceneId: string) => void;
}

export function AdventurePanel({ adventure, progress, onJumpToScene }: AdventurePanelProps) {
  if (!adventure) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>No Active Adventure</h3>
        <p style={styles.text}>Load or generate an adventure to begin.</p>
      </div>
    );
  }

  const currentAct = adventure.acts.find((a) => a.id === progress.currentActId);
  const currentScene = currentAct?.scenes.find((s) => s.id === progress.currentSceneId);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{adventure.title}</h3>
      <p style={styles.text}>{adventure.description}</p>

      <div style={styles.progress}>
        <span>
          Act {adventure.acts.findIndex((a) => a.id === progress.currentActId) + 1} / {adventure.acts.length}
        </span>
        <span>
          Scene {currentAct?.scenes.findIndex((s) => s.id === progress.currentSceneId) ?? 0 + 1} / {currentAct?.scenes.length ?? 0}
        </span>
        <span>Clues: {progress.discoveredClues.length}</span>
      </div>

      {currentScene && (
        <div style={styles.currentScene}>
          <h4 style={styles.sceneTitle}>{currentScene.title}</h4>
          <p style={styles.sceneDesc}>{currentScene.description}</p>
        </div>
      )}

      <div style={styles.clues}>
        <h4 style={styles.subTitle}>Discovered Clues</h4>
        {progress.discoveredClues.length > 0 ? (
          <ul style={styles.clueList}>
            {progress.discoveredClues.map((clue, i) => (
              <li key={i} style={styles.clueItem}>{clue}</li>
            ))}
          </ul>
        ) : (
          <p style={styles.text}>No clues discovered yet.</p>
        )}
      </div>

      <div style={styles.acts}>
        <h4 style={styles.subTitle}>Adventure Structure</h4>
        {adventure.acts.map((act) => (
          <details key={act.id} style={styles.actDetail}>
            <summary style={styles.actSummary}>
              {act.title} {act.id === progress.currentActId && '(Current)'}
            </summary>
            <ul style={styles.sceneList}>
              {act.scenes.map((scene) => (
                <li key={scene.id} style={styles.sceneItem}>
                  {scene.title}
                  {scene.id === progress.currentSceneId && ' (Current)'}
                  {progress.completedScenes.includes(scene.id) && ' ✓'}
                  {act.id !== progress.currentActId && (
                    <button
                      onClick={() => onJumpToScene(act.id, scene.id)}
                      style={styles.jumpButton}
                    >
                      Jump
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
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
    margin: '0 0 8px 0',
    color: '#e94560',
    fontSize: '16px',
  },
  text: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#888',
  },
  progress: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#4ade80',
    marginBottom: '12px',
  },
  currentScene: {
    padding: '12px',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  sceneTitle: {
    margin: '0 0 4px 0',
    color: '#e94560',
    fontSize: '14px',
  },
  sceneDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#888',
  },
  clues: {
    marginBottom: '12px',
  },
  subTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#888',
  },
  clueList: {
    margin: 0,
    paddingLeft: '20px',
  },
  clueItem: {
    fontSize: '12px',
    color: '#f59e0b',
    marginBottom: '4px',
  },
  acts: {},
  actDetail: {
    marginBottom: '8px',
  },
  actSummary: {
    cursor: 'pointer',
    fontSize: '13px',
    color: '#e0e0e0',
  },
  sceneList: {
    margin: '4px 0 0 0',
    paddingLeft: '20px',
  },
  sceneItem: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jumpButton: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
  },
};
