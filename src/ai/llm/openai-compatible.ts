// ─── OpenAI-Compatible LLM Adapter ───────────────────────────────────────────
// Works with LiteLLM proxy (qwen-35b-hifi), Ollama, vLLM, LM Studio, etc.

export interface LLMConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  finishReason: string;
}

const DEFAULT_CONFIG: Partial<LLMConfig> = {
  temperature: 0.7,
  maxTokens: 2048,
};

// Default LiteLLM proxy settings
export const DEFAULT_LITELLM_CONFIG: LLMConfig = {
  baseUrl: 'http://localhost:4000',
  model: 'qwen-35b-hifi',
  apiKey: 'sk-555-event-horizon',
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * Generate a response from an OpenAI-compatible API.
 */
export async function generate(
  config: LLMConfig,
  messages: LLMMessage[],
): Promise<LLMResponse> {
  const url = `${config.baseUrl}/v1/chat/completions`;

  const body = {
    model: config.model,
    messages,
    temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
    max_tokens: config.maxTokens ?? DEFAULT_CONFIG.maxTokens,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  if (!choice) {
    throw new Error('LLM response: no choices returned');
  }

  return {
    content: choice.message?.content ?? '',
    finishReason: choice.finish_reason ?? 'stop',
  };
}

/**
 * Check if a local LLM server is available.
 */
export async function isAvailable(config: LLMConfig): Promise<boolean> {
  try {
    const url = `${config.baseUrl}/v1/models`;
    const response = await fetch(url, {
      headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
    });
    return response.ok;
  } catch {
    return false;
  }
}
