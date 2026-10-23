import React, { useState } from 'react';
import { loadAdventureFromJSON, getFirstScene } from '../adventures/loader';
import { generateAdventure } from '../adventures/generator';
import { initProgress } from '../adventures/progress';
import type { Adventure, AdventureProgress, AdventureTone, AdventureSetting } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker using local bundled worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// ─── Adventure Loader ────────────────────────────────────────────────────────

interface AdventureLoaderProps {
  onLoadAdventure: (adventure: Adventure, progress: AdventureProgress) => void;
  onCancel: () => void;
}

export function AdventureLoader({ onLoadAdventure, onCancel }: AdventureLoaderProps) {
  const [mode, setMode] = useState<'generate' | 'import' | 'pdf'>('generate');
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  // Generation options
  const [tone, setTone] = useState<AdventureTone>('horror');
  const [setting, setSetting] = useState<AdventureSetting>('derelict_ship');
  const [crewSize, setCrewSize] = useState(3);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Simulate async generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const adventure = generateAdventure({ tone, setting, crewSize, length });
      const progress = initProgress(adventure.id);
      const firstScene = getFirstScene(adventure);

      onLoadAdventure(adventure, {
        ...progress,
        currentActId: firstScene.actId,
        currentSceneId: firstScene.sceneId,
      });
    } catch (error) {
      setImportError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleImport = () => {
    try {
      const adventure = loadAdventureFromJSON(jsonInput);
      const progress = initProgress(adventure.id);
      const firstScene = getFirstScene(adventure);

      onLoadAdventure(adventure, {
        ...progress,
        currentActId: firstScene.actId,
        currentSceneId: firstScene.sceneId,
      });
    } catch (error) {
      setImportError(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };

  function filterWardenContent(text: string): string {
    let filtered = text;

    // Remove Warden Educational Support sections
    filtered = filtered.replace(/Hello, Warden\. I am your Warden Educational Support.*?(?=\n\n|\n\n\n)/gs, '');

    // Remove "W" marker sections (Warden-only tips)
    filtered = filtered.replace(/\nW\s+[\s\S]*?(?=\n\n|\n\n\n)/g, '');

    // Remove "What the players know" and "What they don't know" sections
    filtered = filtered.replace(/What the players know\..*?(?=\n\n|\n\n\n)/gs, '');
    filtered = filtered.replace(/What they don't know\..*?(?=\n\n|\n\n\n)/gs, '');

    // Remove "Summarize the left column" instructions
    filtered = filtered.replace(/Summarize the left column.*?(?=\n\n|\n\n\n)/gs, '');

    // Remove page numbers and navigation text like "OVERVIEW SCENARIO 1 SCENARIO 2 SCENARIO 3 SCENARIO 4"
    filtered = filtered.replace(/\b(\d{1,2})\s+(OVERVIEW|SCENARIO\s+\d|MINIMAP|Freedom to Choose)\b/g, '$2');

    // Remove copyright and special thanks sections
    filtered = filtered.replace(/Copyright ©.*?(?=\n\n|\n\n\n)/gs, '');
    filtered = filtered.replace(/Special Thanks to.*?(?=\n\n|\n\n\n)/gs, '');

    // Remove "Visit MOTHERSHIPRPG.COM" lines
    filtered = filtered.replace(/Visit MOTHERSHIPRPG\.COM.*?(?=\n\n|\n\n\n)/gs, '');

    // Clean up multiple newlines
    filtered = filtered.replace(/\n{3,}/g, '\n\n');

    return filtered.trim();
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfLoading(true);
    setPdfError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      // Filter out Warden-only content
      fullText = filterWardenContent(fullText);

      // Try to parse as JSON first
      try {
        const adventureData = JSON.parse(fullText);
        const adventure = loadAdventureFromJSON(JSON.stringify(adventureData));
        const progress = initProgress(adventure.id);
        const firstScene = getFirstScene(adventure);

        onLoadAdventure(adventure, {
          ...progress,
          currentActId: firstScene.actId,
          currentSceneId: firstScene.sceneId,
        });
        return;
      } catch {
        // If not JSON, try to extract adventure data from text
        const adventure = extractAdventureFromText(fullText, file.name);
        if (adventure) {
          const progress = initProgress(adventure.id);
          const firstScene = getFirstScene(adventure);

          onLoadAdventure(adventure, {
            ...progress,
            currentActId: firstScene.actId,
            currentSceneId: firstScene.sceneId,
          });
          return;
        }
      }

      setPdfError('Could not parse adventure data from PDF. Ensure the PDF contains valid adventure JSON or structured text.');
    } catch (error) {
      setPdfError(`PDF loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPdfLoading(false);
    }
  };

  function extractAdventureFromText(text: string, filename: string): Adventure | null {
    // Filter Warden content first
    const filteredText = filterWardenContent(text);

    // Try to find JSON in the text
    const jsonMatch = filteredText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const adventureData = JSON.parse(jsonMatch[0]);
        return loadAdventureFromJSON(JSON.stringify(adventureData));
      } catch {
        // Not valid JSON
      }
    }

    // Fallback: treat the PDF as a published module. Keep full text as GM-only
    // sourceText for the Warden; keep player-visible fields generic so nothing leaks.
    const lines = filteredText.split('\n').filter((line) => line.trim());
    const title = filename.replace('.pdf', '').replace(/[-_]/g, ' ').trim() || lines[0]?.trim() || 'Imported Module';

    return {
      id: `pdf-${Date.now()}`,
      title,
      description: 'A Mothership module loaded from PDF. The Warden will narrate the module based on the source material.',
      tone: 'horror',
      setting: 'unknown',
      recommendedCrewSize: 3,
      sourceText: filteredText,
      acts: [
        {
          id: 'act-1',
          title: 'Act 1: Introduction',
          description: 'Reference module loaded. The Warden runs the module from its source text.',
          scenes: [
            {
              id: 'scene-1',
              title: 'Beginning',
              location: 'Ship',
              description: 'The crew begins. The Warden will set the scene from the module.',
              encounters: [],
              npcs: [],
              clues: [],
            },
          ],
        },
      ],
    };
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Load Adventure</h3>

      <div style={styles.modeToggle}>
        <button
          onClick={() => setMode('generate')}
          style={mode === 'generate' ? styles.activeButton : styles.button}
        >
          Generate Procedural
        </button>
        <button
          onClick={() => setMode('import')}
          style={mode === 'import' ? styles.activeButton : styles.button}
        >
          Import JSON
        </button>
        <button
          onClick={() => setMode('pdf')}
          style={mode === 'pdf' ? styles.activeButton : styles.button}
        >
          Load PDF
        </button>
      </div>

      {mode === 'generate' ? (
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value as AdventureTone)} style={styles.select}>
              <option value="horror">Horror</option>
              <option value="action">Action</option>
              <option value="mystery">Mystery</option>
              <option value="exploration">Exploration</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Setting</label>
            <select value={setting} onChange={(e) => setSetting(e.target.value as AdventureSetting)} style={styles.select}>
              <option value="derelict_ship">Derelict Ship</option>
              <option value="space_station">Space Station</option>
              <option value="planet_surface">Planet Surface</option>
              <option value="anomaly">Anomaly</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Crew Size: {crewSize}</label>
            <input
              type="range"
              min="1"
              max="6"
              value={crewSize}
              onChange={(e) => setCrewSize(parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')} style={styles.select}>
              <option value="short">Short (2 acts)</option>
              <option value="medium">Medium (3 acts)</option>
              <option value="long">Long (4 acts)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            style={styles.button}
          >
            {generating ? 'Generating...' : 'Generate Adventure'}
          </button>
        </div>
      ) : mode === 'import' ? (
        <div style={styles.importSection}>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste adventure JSON here...'
            style={styles.textarea}
          />
          {importError && <p style={styles.error}>{importError}</p>}
          <button
            onClick={handleImport}
            disabled={!jsonInput.trim()}
            style={styles.button}
          >
            Import Adventure
          </button>
        </div>
      ) : (
        <div style={styles.importSection}>
          <label style={styles.fileLabel}>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              style={styles.fileInput}
            />
            {pdfLoading ? 'Loading PDF...' : 'Choose PDF file'}
          </label>
          {pdfError && <p style={styles.error}>{pdfError}</p>}
        </div>
      )}

      <button onClick={onCancel} style={styles.cancelButton}>
        Cancel
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    backgroundColor: '#0a0a1a',
    color: '#e0e0e0',
  },
  title: {
    margin: '0 0 16px 0',
    color: '#e94560',
    fontSize: '16px',
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
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
  activeButton: {
    padding: '10px 20px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    border: '1px solid #e94560',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: '#888',
  },
  select: {
    padding: '8px',
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    color: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '13px',
  },
  slider: {
    width: '100%',
  },
  importSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  textarea: {
    width: '100%',
    height: '120px',
    padding: '8px',
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    color: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  error: {
    color: '#ef4444',
    fontSize: '12px',
    margin: 0,
  },
  cancelButton: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  fileLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  fileInput: {
    display: 'none',
  },
};
