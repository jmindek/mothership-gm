import type { GameState, Adventure, CrewMember, Ship } from '../types';

// ─── Warden Prompt Templates ─────────────────────────────────────────────────

/**
 * Build the system prompt for the Warden AI.
 */
export function buildSystemPrompt(adventure: Adventure | null): string {
  const selectedScen = adventure?.standaloneScenarios?.find(
    (s) => s.id === adventure?.selectedScenarioId
  );

  const scenarioTarget = selectedScen
    ? `\nACTIVE SCENARIO TARGET: You are specifically running "${selectedScen.title}": ${selectedScen.description}. Confine the operational area and plot to this specific scenario and its encounters.`
    : '';

  const adventureContext = adventure
    ? `You are running the adventure "${adventure.title}": ${adventure.description}
Tone: ${adventure.tone}
Setting: ${adventure.setting}
${scenarioTarget}`
    : 'You are generating a procedural adventure based on player input.';

  // GM-only reference material (e.g. a loaded module PDF). Never reveal verbatim.
  const sourceContext = adventure?.sourceText
    ? `\n\nREFERENCE MATERIAL (GM-ONLY, CONFIDENTIAL):\nYou are running the module from this source text. Use it to set scenes, run NPCs and encounters, and respect its plot and locations. NEVER quote this text verbatim to players, NEVER reveal hidden info, secrets, stat blocks, maps, or anything the players have not discovered. Distill it into in-world narration only.\n\n${adventure.sourceText}`
    : '';

  return `You are the Warden — the AI Game Master for the Mothership RPG, a sci-fi horror tabletop game.

RULES:
- Skill checks: roll 2d6 + stat vs target number (default 8). Roll of 2 = auto critical failure. Roll of 12 = auto critical success.
- Stress checks: when crew takes stress, roll 1d10. If roll <= stress level, they suffer a breakdown (lose 1 stat, gain a compulsion).
- Stats: STRENGTH, DEXTERITY, INTELLIGENCE, PSYCH (0-3).
- Skills: ATHLETICS, COMBAT, ENGINEERING, PILOTING, COMPUTERS, SCIENCE, MEDICINE, NAVIGATION, PERCEPTION, PERSUASION, STEALTH, SURVIVAL.
- Ship systems: LIFE_SUPPORT, NAVIGATION, WEAPONS, SHIELDS, PROPULSION, COMMUNICATIONS, POWER. Each has integrity 0-10.
- When a system reaches 0 integrity, it is non-functional.
- Hull integrity 0 = ship destroyed.

YOUR ROLE:
- Narrate scenes with horror/sci-fi atmosphere
- Run NPCs and enemies
- Resolve player actions using the dice rules above
- Manage ship systems and stress
- Present choices and consequences
- Keep tension high

RESPONSE FORMAT:
When resolving an action, include:
1. Narration (what happens)
2. If a skill check is needed: show the dice roll and result
3. If stress is taken: show the stress check
4. Update game state if needed

${adventureContext}
${sourceContext}

Be creative, be scary, be fair. The crew is counting on you.`;
}

/**
 * Build the user message for a player action.
 */
export function buildUserMessage(
  action: string,
  gameState: GameState,
): string {
  const crewSummary = gameState.crew
    .map(
      (c) =>
        `${c.name} (${c.role}): STR ${c.stats.STRENGTH} DEX ${c.stats.DEXTERITY} INT ${c.stats.INTELLIGENCE} PSY ${c.stats.PSYCH} | Stress: ${c.stress}/10`,
    )
    .join('\n');

  const nonFunctional = Object.values(gameState.ship.systems)
    .filter((s) => !s.isFunctional)
    .map((s) => s.name);

  return `GAME STATE:
Crew:
${crewSummary}

Ship: ${gameState.ship.name}
Hull Integrity: ${gameState.ship.hullIntegrity}/10
Non-functional systems: ${nonFunctional.length > 0 ? nonFunctional.join(', ') : 'None'}

${gameState.adventure ? (() => {
  const act = gameState.adventure.acts.find((a) => a.id === gameState.adventureProgress.currentActId);
  const sceneIndex = act?.scenes.findIndex((s) => s.id === gameState.adventureProgress.currentSceneId) ?? 0;
  return `Adventure Progress: Act ${gameState.adventure.acts.findIndex((a) => a.id === gameState.adventureProgress.currentActId) + 1}, Scene ${sceneIndex + 1}`;
})() : 'No active adventure'}

Player Action: ${action}

Narrate the outcome and resolve any dice rolls.`;
}

/**
 * Build a message for continuing the narrative.
 */
export function buildContinueMessage(gameState: GameState): string {
  return `Continue the narrative. The crew is waiting. Current situation:

${buildUserMessage('Continue the story.', gameState)}`;
}
