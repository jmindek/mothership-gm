# Mothership GM // Virtual Warden

[![CI](https://github.com/jmindek/mothership-gm/actions/workflows/ci.yml/badge.svg)](https://github.com/jmindek/mothership-gm/actions/workflows/ci.yml)

An AI-directed Game Master and tactical mission console for the **Mothership Sci-Fi Horror RPG (1st Edition)**.

Mothership GM parses official and third-party Mothership adventure modules (PDFs), briefs an AI Warden with confidential GM reference material, manages live survivor vitals and psychological stress, and drives atmospheric survival-horror expeditions through an industrial retro-terminal interface.

> *"SURVIVE. SOLVE. SAVE. PICK ONE."*

---

## Requirements

### Runtime & System
- **Node.js**: `v20.0.0` or higher (LTS recommended)
- **Package Manager**: `npm` (v9+)
- **Modern Web Browser**: Chrome, Firefox, Edge, or Safari with WebAssembly / Canvas support (for PDF parsing and local worker execution)

### AI / LLM Backend
An OpenAI-compatible LLM endpoint (local or cloud) running an instruction-following model:
- **Local (Recommended)**:
  - [Ollama](https://ollama.ai) (`http://localhost:11434/v1`) with models like `qwen2.5:32b`, `llama3.1:70b`, or `command-r`
  - [LiteLLM Proxy](https://github.com/BerriAI/litellm) (`http://localhost:4000`)
  - [vLLM](https://github.com/vllm-project/vllm) (`http://localhost:8000/v1`)
  - [LM Studio](https://lmstudio.ai) (`http://localhost:1234/v1`)
- **Cloud**:
  - OpenRouter, OpenAI, or any endpoint accepting OpenAI `/chat/completions` schema.
  - API Key can be entered directly in the in-app **Warden Link Config** modal.

### Optional (For Development & Contributing)
- **uv** or **pre-commit**: For local pre-commit git hooks (`uv tool run pre-commit install`)

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/jmindek/mothership-gm.git
cd mothership-gm
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Deploy Your First Expedition
1. Click **`+ START NEW MISSION`**.
2. Supply your Mothership adventure module PDF (e.g. *Another Bug Hunt*).
3. If an anthology module is detected, select your target operational scenario (e.g. *Scenario 1: Distress Signals*).
4. Choose between the **Pre-Gen Squad** or hit **`🎲 QUICK CREW ROLL`** to generate randomized 1e survivors with gear, patches, and trinkets.
5. Click **`INITIALIZE COMMAND CONSOLE // DEPLOY CREW`** to begin.

---

## Core Features

- **PDF Module Ingestion**: Fast, client-side PDF parser with page-by-page progress. Keeps confidential monster stats, GM tips, and maps restricted to the AI Warden while providing spoiler-shield protection to players.
- **Anthology Scenario Detection**: Automatically parses multi-part campaign anthologies into selectable operational missions.
- **Mothership 1e Tactical Mechanics**:
  - 4 Core Classes: Marine, Scientist, Android, Teamster.
  - Live Stress tracking with visual warning thresholds and Panic Checks (1d20).
  - Integrated Tactical Dice Tray: d100 Stat checks (with double-digit criticals) and 2d6.
  - Ship system integrity gauges and damage telemetry.
- **Warden Tactical Terminal**: Encrypted narrative communications log with ambient styling, quick tactical prompt chips, and instant manual quick-saving to local storage.
- **Save Management**: Resume past expeditions with restored crew vitals, adventure progress, and dialogue logs.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port 5173 |
| `npm run build` | Runs TypeScript typecheck (`tsc`) and bundles production build (`vite build`) |
| `npm test` | Runs the unit test suite with Vitest |
| `npm run preview` | Previews the production build locally |

---

## CI/CD & Code Quality

- **Pre-commit**: Local git hooks validate `tsc`, `vitest`, and production build integrity on every commit.
- **GitHub Actions (`.github/workflows/ci.yml`)**:
  - Gitleaks Secret Scanning (blocking gate).
  - TypeScript strict type checking.
  - Vitest test suite execution.
  - Vite production build artifact creation.

---

## License

MIT License. Mothership RPG is a trademark of Tuesday Knight Games. This project is an independent companion tool designed for use with the Mothership Sci-Fi Horror RPG.
