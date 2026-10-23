import React, { useState } from 'react';
import { createLobby, joinLobby, isLobbyFull, getPlayerCount } from '../multiplayer/lobby';
import type { LobbyState, Player } from '../types';

// ─── Lobby Screen ────────────────────────────────────────────────────────────

export function LobbyScreen({ onGameStart }: { onGameStart: (lobby: LobbyState) => void }) {
  const [mode, setMode] = useState<'host' | 'join'>('host');
  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  const handleHost = () => {
    if (!hostName.trim()) return;
    const newLobby = createLobby(hostName.trim());
    setLobby(newLobby);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !lobby) return;
    const result = joinLobby(lobby, playerName.trim());
    if (result) {
      setLobby(result.lobby);
    }
  };

  const handleStart = () => {
    if (lobby) {
      onGameStart(lobby);
    }
  };

  if (lobby) {
    return (
      <div style={styles.container}>
        <h2>Lobby</h2>
        <p>Players ({getPlayerCount(lobby)}/{lobby.maxPlayers})</p>
        <ul>
          {lobby.players.map((p) => (
            <li key={p.id} style={styles.playerItem}>
              {p.name} {p.role === 'host' && '(Host)'}
            </li>
          ))}
        </ul>
        <button
          onClick={handleStart}
          disabled={isLobbyFull(lobby)}
          style={styles.button}
        >
          {isLobbyFull(lobby) ? 'Start Game' : 'Waiting for players...'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Mothership GM</h1>
      <div style={styles.modeToggle}>
        <button
          onClick={() => setMode('host')}
          style={mode === 'host' ? styles.activeButton : styles.button}
        >
          Host Game
        </button>
        <button
          onClick={() => setMode('join')}
          style={mode === 'join' ? styles.activeButton : styles.button}
        >
          Join Game
        </button>
      </div>

      {mode === 'host' ? (
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleHost} disabled={!hostName.trim()} style={styles.button}>
            Create Lobby
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleJoin} disabled={!playerName.trim()} style={styles.button}>
            Join Lobby
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    fontFamily: 'monospace',
    color: '#e0e0e0',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
  },
  modeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    marginRight: '10px',
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    color: '#e0e0e0',
    borderRadius: '4px',
    width: '200px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  activeButton: {
    padding: '10px 20px',
    backgroundColor: '#e94560',
    color: '#e0e0e0',
    border: 'none',
    borderRadius: '4px',
  },
  playerItem: {
    padding: '5px 0',
    borderBottom: '1px solid #0f3460',
  },
};
