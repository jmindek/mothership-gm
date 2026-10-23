import React, { useState, useCallback, useEffect } from 'react';
import { HomeScreen } from './ui/home-screen';
import { PdfAdventureUpload } from './ui/pdf-adventure-upload';
import { CommandConsole } from './ui/command-console';
import { ConfigPanel } from './ui/config';
import { createShip } from './core/ship';
import {
  createNewGame,
  saveGame,
  loadGame,
  listSavedGames,
  deleteSave,
  exportGame,
  recordAction,
  updateShip,
} from './core/session';
import { initProgress } from './adventures/progress';
import { getFirstScene } from './adventures/loader';
import { Warden } from './ai/warden';
import { DEFAULT_LITELLM_CONFIG, type LLMConfig } from './ai/llm/openai-compatible';
import type { GameState, CrewMember, ShipSystemName, Adventure } from './types';

type AppView = 'home' | 'new-game-pdf' | 'console';

export function App() {
  const [view, setView] = useState<AppView>('home');
  const [game, setGame] = useState<GameState | null>(null);
  const [warden, setWarden] = useState<Warden | null>(null);
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_LITELLM_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [savedGamesList, setSavedGamesList] = useState(listSavedGames());
  const [wardenResponses, setWardenResponses] = useState<
    { type: 'warden' | 'player' | 'system'; content: string; playerName?: string; timestamp?: number }[]
  >([]);

  // Refresh saved games whenever returning home or saving
  const refreshSavedGames = useCallback(() => {
    setSavedGamesList(listSavedGames());
  }, []);

  useEffect(() => {
    refreshSavedGames();
  }, [refreshSavedGames, view]);

  // AC 1: Start a new game -> goes to PDF upload
  const handleStartNewGame = useCallback(() => {
    setView('new-game-pdf');
  }, []);

  // AC 2: Continue a game -> loads save and transitions directly to console
  const handleContinueGame = useCallback((saveId: string) => {
    const loaded = loadGame(saveId);
    if (!loaded) return;

    setGame(loaded);

    // Initialize Warden with the loaded adventure
    const loadedWarden = new Warden(config);
    loadedWarden.initialize(loaded.adventure || null);
    setWarden(loadedWarden);

    // Reconstruct conversation history from stored actions
    const history: { type: 'warden' | 'player' | 'system'; content: string; playerName?: string; timestamp?: number }[] = [];

    history.push({
      type: 'warden',
      content: `[EXPEDITION RESUMED // ${loaded.adventure?.title || 'SECTOR LOG'}]\nTelemetry loaded for vessel: ${loaded.ship.name}. Active crew count: ${loaded.crew.length}. Awaiting survivor orders.`,
      timestamp: loaded.timestamp,
    });

    if (loaded.playerActions && loaded.playerActions.length > 0) {
      for (const act of loaded.playerActions) {
        history.push({
          type: 'player',
          content: act.action,
          playerName: act.playerName || 'Player',
          timestamp: act.timestamp,
        });
        if (act.outcome) {
          history.push({
            type: 'warden',
            content: act.outcome,
            timestamp: act.timestamp,
          });
        }
      }
    }

    setWardenResponses(history);
    setView('console');
  }, [config]);

  // Delete a saved game
  const handleDeleteGame = useCallback((saveId: string) => {
    deleteSave(saveId);
    refreshSavedGames();
  }, [refreshSavedGames]);

  // AC 3 & AC 4: Complete PDF upload and take user to command console
  const handleAdventurePdfComplete = useCallback(
    (adventure: Adventure, shipName: string, crew: CrewMember[]) => {
      const initialShip = createShip(shipName);
      const newGame = createNewGame(crew, initialShip);

      const progress = initProgress(adventure.id);
      const firstScene = getFirstScene(adventure);

      let activeActId = firstScene.actId;
      let activeSceneId = firstScene.sceneId;
      let activeTitle = adventure.acts[0]?.title || 'Phase 1: Infiltration';

      const selectedScenario = adventure.standaloneScenarios?.find(
        (s) => s.id === adventure.selectedScenarioId
      );

      if (selectedScenario) {
        const matchingAct = adventure.acts.find(
          (a) => a.id === `act-${selectedScenario.number}`
        );
        if (matchingAct) {
          activeActId = matchingAct.id;
          activeSceneId = matchingAct.scenes[0]?.id || `scene-${selectedScenario.number}-1`;
          activeTitle = matchingAct.title;
        }
      }

      newGame.adventure = adventure;
      newGame.adventureProgress = {
        ...progress,
        currentActId: activeActId,
        currentSceneId: activeSceneId,
      };

      setGame(newGame);

      // Initialize Warden AI with the full module context
      const newWarden = new Warden(config);
      newWarden.initialize(adventure);
      setWarden(newWarden);

      // Save initial state to memory
      saveGame(newGame);
      refreshSavedGames();

      // Atmospheric welcome transmission
      const scenarioNotice = selectedScenario
        ? `\nACTIVE MISSION: ${selectedScenario.title.toUpperCase()}\nMISSION BRIEFING: ${selectedScenario.description}\n`
        : '';

      const initialBriefing =
        `[MISSION TRANSMISSION INITIALIZED // ${adventure.title.toUpperCase()}]\n\n` +
        `Welcome aboard the ${shipName}. The Warden AI has parsed and synchronized the mission dossier (${Math.round((adventure.sourceText?.length || 0) / 1024)} KB indexed).\n` +
        scenarioNotice +
        `\nCURRENT OBJECTIVE: ${activeTitle}.\n` +
        `All systems operational. The void is cold and silent. Report your tactical actions, survivors.`;

      setWardenResponses([
        {
          type: 'warden',
          content: initialBriefing,
          timestamp: Date.now(),
        },
      ]);

      // AC 4: Taken to the command console
      setView('console');
    },
    [config, refreshSavedGames]
  );

  // Process player actions inside command console
  const handleAction = useCallback(
    async (action: string) => {
      if (!game || !warden) return;
      setIsProcessing(true);

      // Optimistically append player action
      setWardenResponses((prev) => [
        ...prev,
        { type: 'player', content: action, playerName: 'Commander', timestamp: Date.now() },
      ]);

      try {
        const result = await warden.processAction(action, game, 'Commander', 'player-1');

        const updatedGame = recordAction(game, {
          playerId: 'player-1',
          playerName: 'Commander',
          action,
          outcome: result.response,
        });

        setGame(updatedGame);
        saveGame(updatedGame);

        setWardenResponses((prev) => [
          ...prev,
          { type: 'warden', content: result.response, timestamp: Date.now() },
        ]);
      } catch (error) {
        setWardenResponses((prev) => [
          ...prev,
          {
            type: 'system',
            content: `[WARDEN COMM ERROR]: ${error instanceof Error ? error.message : 'Connection interrupted'}. Ensure local LLM server is reachable via Config.`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [game, warden]
  );

  // Quick save
  const handleSave = useCallback(() => {
    if (game) {
      saveGame(game);
      refreshSavedGames();
    }
  }, [game, refreshSavedGames]);

  // Export save JSON to clipboard
  const handleExport = useCallback(() => {
    if (game) {
      const json = exportGame(game);
      navigator.clipboard.writeText(json);
      setWardenResponses((prev) => [
        ...prev,
        {
          type: 'system',
          content: '[TELEMETRY COPIED]: Full expedition telemetry exported to clipboard.',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [game]);

  // Ship system repair
  const handleRepair = useCallback(
    (system: ShipSystemName) => {
      if (!game) return;
      const repairedShip = {
        ...game.ship,
        systems: {
          ...game.ship.systems,
          [system]: {
            ...game.ship.systems[system],
            integrity: Math.min(10, game.ship.systems[system].integrity + 3),
            isFunctional: true,
          },
        },
      };
      const updatedGame = updateShip(game, repairedShip);
      setGame(updatedGame);
      saveGame(updatedGame);
      setWardenResponses((prev) => [
        ...prev,
        {
          type: 'system',
          content: `[MAINTENANCE REPORT]: System [${system.replace('_', ' ')}] repaired. Integrity restored to ${repairedShip.systems[system].integrity}/10.`,
          timestamp: Date.now(),
        },
      ]);
    },
    [game]
  );

  // Update crew stress
  const handleUpdateCrewStress = useCallback(
    (crewId: string, delta: number) => {
      if (!game) return;
      const updatedCrew = game.crew.map((member) => {
        if (member.id !== crewId) return member;
        const newStress = Math.max(0, Math.min(10, member.stress + delta));
        const isBreakdown = newStress >= 10 || member.isBreakdown;
        return {
          ...member,
          stress: newStress,
          sanity: Math.max(0, 10 - newStress),
          isBreakdown,
        };
      });

      const updatedGame = {
        ...game,
        crew: updatedCrew,
      };
      setGame(updatedGame);
      saveGame(updatedGame);
    },
    [game]
  );

  // Test LLM connection
  const handleTestLLM = async () => {
    try {
      const res = await fetch(`${config.baseUrl}/models`, {
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* View 1: Home Screen */}
      {view === 'home' && (
        <HomeScreen
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onDeleteGame={handleDeleteGame}
          onOpenConfig={() => setShowConfigModal(true)}
          savedGames={savedGamesList}
        />
      )}

      {/* View 2: PDF Adventure Upload */}
      {view === 'new-game-pdf' && (
        <PdfAdventureUpload
          onComplete={handleAdventurePdfComplete}
          onCancel={() => setView('home')}
        />
      )}

      {/* View 3: Tactical Command Console */}
      {view === 'console' && game && (
        <CommandConsole
          game={game}
          wardenResponses={wardenResponses}
          isProcessing={isProcessing}
          onAction={handleAction}
          onSave={handleSave}
          onExport={handleExport}
          onRepair={handleRepair}
          onUpdateCrewStress={handleUpdateCrewStress}
          onOpenConfig={() => setShowConfigModal(true)}
          onReturnHome={() => setView('home')}
        />
      )}

      {/* Global Config Modal */}
      {showConfigModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <ConfigPanel
              config={config}
              onSave={(newCfg) => setConfig(newCfg)}
              onTest={handleTestLLM}
              isAvailable={true}
              onClose={() => setShowConfigModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalCard: {
    maxWidth: '560px',
    width: '100%',
  },
};
