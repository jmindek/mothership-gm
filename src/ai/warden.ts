import type { LLMConfig, LLMMessage } from './llm/openai-compatible';
import { generate } from './llm/openai-compatible';
import { buildSystemPrompt, buildUserMessage } from './prompts';
import type { GameState, PlayerAction, Adventure } from '../types';

// ─── Warden (AI Game Master) ─────────────────────────────────────────────────

export class Warden {
  private config: LLMConfig;
  private conversationHistory: LLMMessage[] = [];

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Initialize the Warden with a system prompt.
   */
  initialize(adventure: Adventure | null): void {
    const systemPrompt = buildSystemPrompt(adventure);
    this.conversationHistory = [
      { role: 'system', content: systemPrompt },
    ];
  }

  /**
   * Process a player action and return the Warden's response.
   */
  async processAction(
    action: string,
    gameState: GameState,
    playerName: string,
    playerId: string,
  ): Promise<{ response: string; updatedAction: PlayerAction }> {
    const userMessage = buildUserMessage(action, gameState);
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const response = await generate(this.config, this.conversationHistory);
    this.conversationHistory.push({ role: 'assistant', content: response.content });

    const updatedAction: PlayerAction = {
      id: '',
      timestamp: Date.now(),
      playerId,
      playerName,
      action,
      outcome: response.content,
    };

    return { response: response.content, updatedAction };
  }

  /**
   * Continue the narrative without a new action.
   */
  async continue(gameState: GameState): Promise<string> {
    const userMessage = `Continue the narrative. The crew is waiting.`;
    this.conversationHistory.push({ role: 'user', content: userMessage });

    const response = await generate(this.config, this.conversationHistory);
    this.conversationHistory.push({ role: 'assistant', content: response.content });

    return response.content;
  }

  /**
   * Get conversation history (for debugging/state inspection).
   */
  getHistory(): LLMMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Reset conversation history (keep system prompt).
   */
  reset(): void {
    this.conversationHistory = [this.conversationHistory[0]];
  }
}
