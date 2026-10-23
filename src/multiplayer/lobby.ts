import type { LobbyState, Player } from '../types';

// ─── Lobby Management ────────────────────────────────────────────────────────

const MAX_PLAYERS = 5; // 1 host + 4 players

export function createLobby(hostName: string): LobbyState {
  const hostId = generateId();
  return {
    id: generateId(),
    hostId,
    players: [
      { id: hostId, name: hostName, role: 'host', isConnected: true },
    ],
    maxPlayers: MAX_PLAYERS,
    isFull: false,
    isStarted: false,
  };
}

export function joinLobby(
  lobby: LobbyState,
  playerName: string,
): { lobby: LobbyState; player: Player } | null {
  if (lobby.isFull || lobby.isStarted) return null;
  if (lobby.players.length >= lobby.maxPlayers) return null;

  const playerId = generateId();
  const player: Player = { id: playerId, name: playerName, role: 'player', isConnected: true };
  const newPlayers = [...lobby.players, player];

  return {
    lobby: {
      ...lobby,
      players: newPlayers,
      isFull: newPlayers.length >= lobby.maxPlayers,
    },
    player,
  };
}

export function leaveLobby(
  lobby: LobbyState,
  playerId: string,
): LobbyState | null {
  const newPlayers = lobby.players.filter((p) => p.id !== playerId);
  if (newPlayers.length === 0) return null;

  // If host leaves, assign new host
  let newHostId = lobby.hostId;
  if (playerId === lobby.hostId && newPlayers.length > 0) {
    newHostId = newPlayers[0].id;
    newPlayers[0].role = 'host';
  }

  return {
    ...lobby,
    players: newPlayers,
    hostId: newHostId,
    isFull: false,
  };
}

export function startGame(lobby: LobbyState): LobbyState {
  return { ...lobby, isStarted: true };
}

export function isLobbyFull(lobby: LobbyState): boolean {
  return lobby.players.length >= lobby.maxPlayers;
}

export function getPlayerCount(lobby: LobbyState): number {
  return lobby.players.length;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
