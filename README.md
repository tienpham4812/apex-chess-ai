# ♟️ Apex Chess AI

> An advanced, browser-based Chess game featuring a master-strength heuristic AI engine, dynamic live evaluation bar, procedural Web Audio sound effects, and a luxury dark glassmorphic interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Play Online](https://img.shields.io/badge/Live%20Demo-Play%20Now-success.svg)](https://tienpham4812.github.io/apex-chess-ai/)
[![Pure Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6-blue.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg)]()

🎮 **Play Online Directly in Browser**:

---

## ✨ Features

- 🧠 **Smart Chess Engine**:
  - **Minimax with Alpha-Beta Pruning** to efficiently evaluate deep move trees.
  - **Quiescence Search**: Solves the Horizon Effect by evaluating tactical capture sequences until a quiet position is reached.
  - **MVV-LVA Move Ordering**: Prioritizes Most Valuable Victim / Least Valuable Attacker for fast cutoffs.
  - **PeSTO Piece-Square Tables (PST)**: Opening, midgame, and endgame phase interpolation.
  - **4 Difficulty Levels**: From Novice (~800 ELO) up to Master (~2000+ ELO).
- 📏 **Full FIDE Rules Compliance**:
  - Legal moves for all pieces with pin and check detection.
  - Castling (Kingside & Queenside with transit square attack safety).
  - En Passant pawn captures.
  - Interactive Pawn Promotion modal (Queen, Rook, Bishop, Knight).
  - Checkmate, Stalemate, 50-move rule, Threefold repetition, and Insufficient material draws.
- 📊 **Real-Time Dynamic Evaluation Bar**:
  - Vertical animated score bar indicating White vs. Black advantage in centipawns.
- 🔊 **Synthesized Web Audio (Zero Audio Assets)**:
  - Acoustic wooden taps, capture snaps, castling slides, check alert chimes, promotion arpeggios, and game over victory/defeat chords.
- 🎨 **Luxury Dark UI & Custom Themes**:
  - Obsidian Neon (default)
  - Classic Wood
  - Royal Azure
  - Tournament Green
  - High-contrast Staunton vector SVG pieces.
- ⏱️ **Clocks & Time Controls**: Untimed, Bullet (3m), Blitz (5m), Rapid (10m), Standard (15m).
- 📜 **Interactive Notation History & Tools**:
  - Standard Algebraic Notation (SAN) table with step-by-step history preview controls (`⏮ ◀ ▶ ⏭`).
  - Engine Hint button (tactical suggestion).
  - Board flip perspective.
  - FEN import/export and PGN match export.

---

## 🚀 Live Demo & Getting Started

### Play Locally
Apex Chess AI is built with pure web technologies and has zero external dependencies or build steps.

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/apex-chess-ai.git
   cd apex-chess-ai
   ```

2. Open `index.html` directly in your browser:
   - Double-click `index.html`, OR
   - Run a quick local server:
     ```bash
     python -m http.server 8080
     ```
   - Open `http://localhost:8080/` in your browser.

---

## 📁 Project Architecture

```
apex-chess-ai/
├── index.html       # Semantic HTML layout and modal structures
├── css/
│   └── style.css    # Complete design system, themes, and glassmorphic styling
└── js/
    ├── pieces.js    # Staunton vector SVG piece definitions
    ├── audio.js     # Web Audio API sound synthesizer
    ├── rules.js     # Complete FIDE rules engine and SAN generator
    ├── ai.js        # Minimax, Alpha-Beta, PST evaluation engine
    └── app.js       # UI controller, event bindings, and clock management
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
