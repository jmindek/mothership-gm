import React, { useState } from 'react';
import { DEFAULT_LITELLM_CONFIG, type LLMConfig } from '../ai/llm/openai-compatible';

// ─── Configuration Panel ─────────────────────────────────────────────────────

interface ConfigPanelProps {
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
  onTest: () => Promise<boolean>;
  isAvailable: boolean;
  onClose?: () => void;
}

export function ConfigPanel({ config, onSave, onTest, isAvailable, onClose }: ConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config || DEFAULT_LITELLM_CONFIG);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    onSave(localConfig);
    setTestResult('Configuration saved to active session');
    setTimeout(() => {
      if (onClose) onClose();
    }, 700);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest();
      setTestResult(result ? 'Connected to Warden endpoint!' : 'Connection failed');
    } catch {
      setTestResult('Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (key: keyof LLMConfig, value: string | number) => {
    setLocalConfig({ ...localConfig, [key]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mosh-tag mosh-tag-yellow">COMM LINK</span>
          <h3 style={styles.title}>WARDEN LLM CONFIGURATION</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="mosh-btn" style={{ padding: '4px 8px', fontSize: '10px' }}>
            [ CLOSE X ]
          </button>
        )}
      </div>

      {isAvailable && (
        <div style={styles.available}>
          <span className="mosh-led-green mosh-led-blink" />
          <span>Local LLM server detected and reachable</span>
        </div>
      )}

      <div style={styles.field}>
        <label style={styles.label}>BASE URL (OPENAI COMPATIBLE)</label>
        <input
          type="text"
          value={localConfig.baseUrl}
          onChange={(e) => updateConfig('baseUrl', e.target.value)}
          placeholder="http://localhost:4000"
          style={styles.input}
        />
        <span style={styles.hint}>
          LiteLLM: http://localhost:4000 | Ollama: http://localhost:11434/v1 | vLLM: http://localhost:8000/v1
        </span>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>MODEL IDENTIFIER</label>
        <input
          type="text"
          value={localConfig.model}
          onChange={(e) => updateConfig('model', e.target.value)}
          placeholder="qwen-35b-hifi"
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>API KEY (OPTIONAL FOR LOCAL SERVERS)</label>
        <input
          type="password"
          value={localConfig.apiKey}
          onChange={(e) => updateConfig('apiKey', e.target.value)}
          placeholder="Leave blank for local Ollama/LiteLLM"
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>TEMPERATURE: {localConfig.temperature}</label>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.05"
          value={localConfig.temperature}
          onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>MAX TOKENS: {localConfig.maxTokens}</label>
        <input
          type="number"
          value={localConfig.maxTokens}
          onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
          style={styles.input}
        />
      </div>

      <div style={styles.actions}>
        <button onClick={handleSave} className="mosh-btn mosh-btn-primary">
          SAVE CONFIGURATION
        </button>
        <button onClick={handleTest} disabled={testing} className="mosh-btn mosh-btn-cyan">
          {testing ? 'TESTING LINK...' : 'TEST CONNECTION'}
        </button>
      </div>

      {testResult && (
        <div
          style={{
            ...styles.testResult,
            backgroundColor: testResult.includes('Connected') || testResult.includes('saved')
              ? 'rgba(16, 232, 133, 0.15)'
              : 'rgba(255, 42, 42, 0.15)',
            borderColor: testResult.includes('Connected') || testResult.includes('saved')
              ? 'var(--mosh-green)'
              : 'var(--mosh-red)',
            color: testResult.includes('Connected') || testResult.includes('saved')
              ? 'var(--mosh-green)'
              : 'var(--mosh-red)',
          }}
        >
          {testResult}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: 'var(--bg-hull)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    letterSpacing: '0.06em',
    color: 'var(--text-primary)',
  },
  available: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(16, 232, 133, 0.1)',
    border: '1px solid var(--mosh-green)',
    fontSize: '11px',
    color: 'var(--mosh-green)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
  },
  input: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-inset)',
    border: '1px solid var(--border-bright)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  hint: {
    fontSize: '10px',
    color: 'var(--text-dim)',
  },
  slider: {
    width: '100%',
    accentColor: 'var(--mosh-yellow)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  testResult: {
    padding: '10px 12px',
    border: '1px solid transparent',
    fontSize: '12px',
    fontWeight: 600,
  },
};
