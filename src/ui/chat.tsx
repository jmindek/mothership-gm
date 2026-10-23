import React, { useState, useRef, useEffect } from 'react';
import type { PlayerAction } from '../types';

// ─── Chat Interface ──────────────────────────────────────────────────────────

interface ChatProps {
  playerName: string;
  playerId: string;
  onAction: (action: string) => void;
  wardenResponses: { type: 'warden' | 'player'; content: string; playerName?: string }[];
  isProcessing: boolean;
}

export function Chat({ playerName, playerId, onAction, wardenResponses, isProcessing }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wardenResponses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onAction(input.trim());
    setInput('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {wardenResponses.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(msg.type === 'warden' ? styles.wardenMessage : styles.playerMessage),
            }}
          >
            {msg.type === 'player' && <span style={styles.playerName}>{msg.playerName}: </span>}
            <span style={styles.messageContent}>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you do?"
          disabled={isProcessing}
          style={styles.input}
        />
        <button type="submit" disabled={isProcessing || !input.trim()} style={styles.button}>
          {isProcessing ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#0a0a1a',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  message: {
    marginBottom: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    maxWidth: '80%',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
  wardenMessage: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
    marginLeft: 'auto',
  },
  playerMessage: {
    backgroundColor: '#16213e',
    border: '1px solid #e94560',
    marginRight: 'auto',
  },
  playerName: {
    color: '#e94560',
    fontWeight: 'bold',
  },
  messageContent: {
    color: '#e0e0e0',
  },
  form: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #0f3460',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    color: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
