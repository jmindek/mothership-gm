import { WebSocket, WebSocketServer } from 'ws';

// ─── Multiplayer WebSocket Server ────────────────────────────────────────────

export interface PlayerSummary {
  id: string;
  name: string;
  isConnected: boolean;
}

export type ServerEvent =
  | { type: 'LOBBY_CREATED'; lobbyId: string }
  | { type: 'LOBBY_JOINED'; lobbyId: string; players: PlayerSummary[] }
  | { type: 'PLAYER_CONNECTED'; playerId: string; playerName: string }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string }
  | { type: 'ACTION_SENT'; playerId: string; playerName: string; action: string }
  | { type: 'WARDEN_RESPONSE'; response: string }
  | { type: 'GAME_STATE_UPDATE'; state: string }
  | { type: 'ERROR'; message: string };

export interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  isConnected: boolean;
}

const PORT = 3001;

let wss: WebSocketServer | null = null;
const players: Map<string, Player> = new Map();

/**
 * Start the multiplayer server.
 */
export function startServer(): Promise<WebSocketServer> {
  return new Promise((resolve, reject) => {
    wss = new WebSocketServer({ port: PORT }, () => {
      console.log(`Mothership GM server running on ws://localhost:${PORT}`);
      resolve(wss!);
    });

    wss.on('error', reject);
  });
}

/**
 * Handle incoming WebSocket connections.
 */
export function setupConnection(ws: WebSocket): void {
  let playerId: string | null = null;
  let playerName: string | null = null;

  ws.on('message', (data) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
      return;
    }

    handleClientMessage(
      ws,
      message,
      playerId,
      (id) => { playerId = id; },
      (name) => { playerName = name; },
    );
  });

  ws.on('close', () => {
    if (playerId) {
      players.delete(playerId);
      broadcast({ type: 'PLAYER_DISCONNECTED', playerId });
    }
  });

  ws.on('error', () => {
    if (playerId) players.delete(playerId);
  });
}

function handleClientMessage(
  ws: WebSocket,
  message: ClientMessage,
  currentId: string | null,
  assignId: (id: string) => void,
  assignName: (name: string) => void,
): void {
  switch (message.type) {
    case 'JOIN_LOBBY': {
      const id = generateId();
      const name = message.name || 'Unknown Survivor';
      assignId(id);
      assignName(name);
      const player: Player = { id, name, ws, isConnected: true };
      players.set(id, player);
      ws.send(JSON.stringify({ type: 'LOBBY_JOINED', lobbyId: 'default', players: getPlayerList() }));
      broadcast({ type: 'PLAYER_CONNECTED', playerId: id, playerName: name });
      break;
    }
    case 'SEND_ACTION': {
      if (currentId && message.action) {
        const player = players.get(currentId);
        if (player) {
          broadcast({ type: 'ACTION_SENT', playerId: player.id, playerName: player.name, action: message.action });
        }
      }
      break;
    }
    case 'REQUEST_STATE': {
      if (currentId) {
        const player = players.get(currentId);
        if (player) {
          // Host would send full state here
        }
      }
      break;
    }
  }
}

function getPlayerList(): PlayerSummary[] {
  return Array.from(players.values()).map((p) => ({ id: p.id, name: p.name, isConnected: p.isConnected }));
}

function broadcast(event: ServerEvent): void {
  const data = JSON.stringify(event);
  players.forEach((player) => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// ─── Client Messages ─────────────────────────────────────────────────────────

interface ClientMessage {
  type: 'JOIN_LOBBY' | 'SEND_ACTION' | 'REQUEST_STATE';
  name?: string;
  action?: string;
}
