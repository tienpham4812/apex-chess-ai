/**
 * Chess Master UI & Interaction Controller
 * Coordinates the board UI, move generation, drag-and-drop, click-to-move,
 * audio playback, AI calculations, evaluation bar, and game clocks.
 */

class ChessApp {
  constructor() {
    this.game = new ChessGame();
    this.ai = new ChessAI(this.game);

    // Settings
    this.playerSide = 'w'; // 'w', 'b', or 'spectate'
    this.difficulty = 3;   // 1 to 4
    this.timeControl = 600; // seconds (0 = untimed)
    this.boardFlipped = false;

    // Clocks
    this.whiteTime = 600;
    this.blackTime = 600;
    this.clockInterval = null;

    // UI State
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.lastMove = null;
    this.hintMove = null;
    this.previewIndex = -1; // -1 means live position, >= 0 is historical step
    this.isAiThinking = false;
    this.pendingPromotionMove = null;

    // DOM Elements
    this.boardEl = document.getElementById('chess-board');
    this.evalFillWhite = document.getElementById('eval-fill-white');
    this.evalFillBlack = document.getElementById('eval-fill-black');
    this.evalScoreTag = document.getElementById('eval-score-tag');
    this.movesListEl = document.getElementById('moves-list');
    this.moveTableContainer = document.getElementById('move-table-container');

    this.aiStatusText = document.getElementById('ai-status-text');
    this.aiIndicatorPulse = document.getElementById('ai-indicator-pulse');
    this.aiDepthEl = document.getElementById('ai-telemetry-depth');
    this.aiNodesEl = document.getElementById('ai-telemetry-nodes');

    this.whiteClockEl = document.getElementById('user-clock');
    this.blackClockEl = document.getElementById('opponent-clock');
    this.whiteCard = document.getElementById('user-card');
    this.blackCard = document.getElementById('opponent-card');

    this.userCapturedTray = document.getElementById('user-captured-tray');
    this.oppCapturedTray = document.getElementById('opponent-captured-tray');

    this.opponentName = document.getElementById('opponent-name');
    this.opponentElo = document.getElementById('opponent-elo');
    this.opponentAvatar = document.getElementById('opponent-avatar');
    this.userName = document.getElementById('user-name');
    this.userElo = document.getElementById('user-elo');
    this.userAvatar = document.getElementById('user-avatar');

    // Modals
    this.promoModal = document.getElementById('promo-modal');
    this.promoChoicesContainer = document.getElementById('promo-choices-container');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.fenPgnModal = document.getElementById('fen-pgn-modal');
    this.fenInput = document.getElementById('fen-input');

    this.initEventListeners();
    this.startNewGame();
  }

  initEventListeners() {
    // Top Controls
    document.getElementById('board-theme-select').addEventListener('change', (e) => {
      document.body.setAttribute('data-board-theme', e.target.value);
    });

    document.getElementById('btn-toggle-sound').addEventListener('click', (e) => {
      chessAudio.enabled = !chessAudio.enabled;
      const btn = document.getElementById('btn-toggle-sound');
      btn.classList.toggle('active', chessAudio.enabled);
      this.showToast(chessAudio.enabled ? 'Sound Enabled 🔊' : 'Sound Muted 🔇');
    });

    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.startNewGame();
    });

    document.getElementById('btn-undo').addEventListener('click', () => {
      this.handleUndo();
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      this.provideHint();
    });

    document.getElementById('btn-flip').addEventListener('click', () => {
      this.boardFlipped = !this.boardFlipped;
      this.renderBoard();
    });

    // Settings Dropdowns
    const selectDifficulty = document.getElementById('select-difficulty');
    selectDifficulty.addEventListener('change', (e) => {
      this.difficulty = parseInt(e.target.value, 10);
      this.updatePlayerLabels();
      this.showToast(`AI difficulty set to Level ${this.difficulty}`);
    });

    const selectSide = document.getElementById('select-side');
    selectSide.addEventListener('change', (e) => {
      this.playerSide = e.target.value;
      this.boardFlipped = (this.playerSide === 'b');
      this.updatePlayerLabels();
      this.startNewGame();
    });

    const selectTimeControl = document.getElementById('select-time-control');
    selectTimeControl.addEventListener('change', (e) => {
      this.timeControl = parseInt(e.target.value, 10);
      this.resetClocks();
    });

    // History Nav buttons
    document.getElementById('nav-first').addEventListener('click', () => this.navigateHistory(0));
    document.getElementById('nav-prev').addEventListener('click', () => {
      const target = this.previewIndex === -1 ? this.game.history.length - 2 : this.previewIndex - 1;
      this.navigateHistory(Math.max(0, target));
    });
    document.getElementById('nav-next').addEventListener('click', () => {
      if (this.previewIndex !== -1) {
        if (this.previewIndex + 1 >= this.game.history.length) {
          this.navigateHistory(-1); // Back to live
        } else {
          this.navigateHistory(this.previewIndex + 1);
        }
      }
    });
    document.getElementById('nav-last').addEventListener('click', () => this.navigateHistory(-1));

    // PGN / FEN Modal
    document.getElementById('btn-fen-pgn').addEventListener('click', () => {
      this.fenInput.value = this.game.getFen();
      this.fenPgnModal.classList.add('active');
    });

    document.getElementById('btn-close-fen-modal').addEventListener('click', () => {
      this.fenPgnModal.classList.remove('active');
    });

    document.getElementById('btn-copy-fen').addEventListener('click', () => {
      navigator.clipboard.writeText(this.game.getFen()).then(() => {
        this.showToast('FEN copied to clipboard! 📋');
      });
    });

    document.getElementById('btn-load-fen').addEventListener('click', () => {
      const fen = this.fenInput.value.trim();
      if (this.game.loadFen(fen)) {
        this.previewIndex = -1;
        this.lastMove = null;
        this.selectedSquare = null;
        this.fenPgnModal.classList.remove('active');
        this.renderBoard();
        this.updateUI();
        this.showToast('Board state loaded successfully!');
        this.checkAiTurn();
      } else {
        alert('Invalid FEN string format!');
      }
    });

    document.getElementById('btn-export-pgn').addEventListener('click', () => {
      this.exportPgn();
    });

    // Game Over modal buttons
    document.getElementById('modal-btn-new-game').addEventListener('click', () => {
      this.gameOverModal.classList.remove('active');
      this.startNewGame();
    });

    document.getElementById('modal-btn-close').addEventListener('click', () => {
      this.gameOverModal.classList.remove('active');
    });
  }

  updatePlayerLabels() {
    const eloMap = { 1: 800, 2: 1200, 3: 1600, 4: 2100 };
    const elo = eloMap[this.difficulty] || 1600;

    if (this.playerSide === 'w') {
      this.opponentName.textContent = 'Nova AI (Black)';
      this.opponentElo.textContent = `ELO ${elo}`;
      this.opponentAvatar.textContent = '🤖';
      this.userName.textContent = 'You (White)';
      this.userElo.textContent = 'Human';
      this.userAvatar.textContent = '👤';
    } else if (this.playerSide === 'b') {
      this.opponentName.textContent = 'Nova AI (White)';
      this.opponentElo.textContent = `ELO ${elo}`;
      this.opponentAvatar.textContent = '🤖';
      this.userName.textContent = 'You (Black)';
      this.userElo.textContent = 'Human';
      this.userAvatar.textContent = '👤';
    } else {
      this.opponentName.textContent = 'White AI';
      this.opponentElo.textContent = `ELO ${elo}`;
      this.opponentAvatar.textContent = '🤖';
      this.userName.textContent = 'Black AI';
      this.userElo.textContent = `ELO ${elo}`;
      this.userAvatar.textContent = '👾';
    }
  }

  startNewGame() {
    this.game = new ChessGame();
    this.ai = new ChessAI(this.game);
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.lastMove = null;
    this.hintMove = null;
    this.previewIndex = -1;
    this.isAiThinking = false;

    this.gameOverModal.classList.remove('active');
    this.promoModal.classList.remove('active');

    this.resetClocks();
    this.updatePlayerLabels();
    this.renderBoard();
    this.updateUI();

    this.showToast('New match started! Good luck! ♟️');

    this.checkAiTurn();
  }

  resetClocks() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.whiteTime = this.timeControl;
    this.blackTime = this.timeControl;
    this.updateClockDisplays();

    if (this.timeControl > 0) {
      this.clockInterval = setInterval(() => this.tickClock(), 1000);
    }
  }

  tickClock() {
    if (this.game.isGameOver() || this.previewIndex !== -1) return;

    if (this.game.turn === 'w') {
      this.whiteTime = Math.max(0, this.whiteTime - 1);
      if (this.whiteTime === 0) {
        this.handleTimeout('w');
      }
    } else {
      this.blackTime = Math.max(0, this.blackTime - 1);
      if (this.blackTime === 0) {
        this.handleTimeout('b');
      }
    }
    this.updateClockDisplays();
  }

  formatTime(secs) {
    if (secs === 0 && this.timeControl === 0) return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  updateClockDisplays() {
    const isW = this.playerSide !== 'b';
    const myClock = isW ? this.whiteClockEl : this.blackClockEl;
    const oppClock = isW ? this.blackClockEl : this.whiteClockEl;
    const myTime = isW ? this.whiteTime : this.blackTime;
    const oppTime = isW ? this.blackTime : this.whiteTime;

    myClock.textContent = this.formatTime(myTime);
    oppClock.textContent = this.formatTime(oppTime);

    myClock.classList.toggle('low-time', myTime > 0 && myTime <= 30);
    oppClock.classList.toggle('low-time', oppTime > 0 && oppTime <= 30);
  }

  handleTimeout(color) {
    clearInterval(this.clockInterval);
    const loser = color === 'w' ? 'White' : 'Black';
    const winner = color === 'w' ? 'Black' : 'White';
    chessAudio.playGameOver(winner === (this.playerSide === 'w' ? 'White' : 'Black'));
    this.showGameOverModal('Time Out!', `${loser} ran out of time. ${winner} wins on time!`);
  }

  renderBoard() {
    this.boardEl.innerHTML = '';
    const activeBoard = this.getActiveDisplayBoard();
    const isCheck = this.game.isInCheck(this.game.turn);
    const kingPos = isCheck ? this.game.findKing(this.game.turn) : null;

    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      for (let colIdx = 0; colIdx < 8; colIdx++) {
        // Handle board flip
        const r = this.boardFlipped ? 7 - rowIdx : rowIdx;
        const c = this.boardFlipped ? 7 - colIdx : colIdx;
        const isLight = (r + c) % 2 === 0;

        const square = document.createElement('div');
        square.className = `square ${isLight ? 'light' : 'dark'}`;
        square.dataset.r = r;
        square.dataset.c = c;
        square.id = `sq-${r}-${c}`;

        // Last move highlight
        if (this.lastMove) {
          if ((this.lastMove.from.r === r && this.lastMove.from.c === c) ||
              (this.lastMove.to.r === r && this.lastMove.to.c === c)) {
            square.classList.add('last-move');
          }
        }

        // Selected square highlight
        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          square.classList.add('selected');
        }

        // Hint square highlight
        if (this.hintMove) {
          if ((this.hintMove.from.r === r && this.hintMove.from.c === c) ||
              (this.hintMove.to.r === r && this.hintMove.to.c === c)) {
            square.classList.add('hint');
          }
        }

        // King in check red radial glow
        if (kingPos && kingPos.r === r && kingPos.c === c) {
          square.classList.add('check');
        }

        // Add coordinate notation labels on border squares
        if (this.boardFlipped ? r === 0 : r === 7) {
          const fileLabel = document.createElement('span');
          fileLabel.className = 'coord-file';
          fileLabel.textContent = String.fromCharCode('a'.charCodeAt(0) + c);
          square.appendChild(fileLabel);
        }
        if (this.boardFlipped ? c === 7 : c === 0) {
          const rankLabel = document.createElement('span');
          rankLabel.className = 'coord-rank';
          rankLabel.textContent = 8 - r;
          square.appendChild(rankLabel);
        }

        // Render Chess Piece
        const piece = activeBoard[r][c];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'chess-piece';
          pieceEl.innerHTML = getPieceSvg(piece);
          pieceEl.draggable = true;

          // Drag Events
          pieceEl.addEventListener('dragstart', (e) => this.handleDragStart(e, r, c));
          pieceEl.addEventListener('dragend', (e) => this.handleDragEnd(e));

          square.appendChild(pieceEl);
        }

        // Legal Move Dot or Capture Ring
        if (this.legalMovesForSelected.some(m => m.to.r === r && m.to.c === c)) {
          const isCapture = !!piece || (this.game.enPassant && this.game.enPassant.r === r && this.game.enPassant.c === c && this.selectedSquare && activeBoard[this.selectedSquare.r][this.selectedSquare.c].toLowerCase() === 'p');
          const indicator = document.createElement('div');
          indicator.className = isCapture ? 'legal-capture-ring' : 'legal-dot';
          square.appendChild(indicator);
        }

        // Drop & Click listeners
        square.addEventListener('dragover', (e) => e.preventDefault());
        square.addEventListener('drop', (e) => this.handleDrop(e, r, c));
        square.addEventListener('click', () => this.handleSquareClick(r, c));

        this.boardEl.appendChild(square);
      }
    }
  }

  getActiveDisplayBoard() {
    if (this.previewIndex !== -1 && this.previewIndex < this.game.history.length) {
      return this.game.history[this.previewIndex].stateSnapshot.board;
    }
    return this.game.board;
  }

  handleDragStart(e, r, c) {
    if (this.previewIndex !== -1 || this.isAiThinking) {
      e.preventDefault();
      return;
    }
    if (!this.isPlayerTurn()) {
      e.preventDefault();
      return;
    }

    const piece = this.game.board[r][c];
    if (!piece || this.game.getColor(piece) !== this.game.turn) {
      e.preventDefault();
      return;
    }

    this.selectedSquare = { r, c };
    this.legalMovesForSelected = this.game.getLegalMoves(this.game.turn)
      .filter(m => m.from.r === r && m.from.c === c);
    this.renderBoard();
    e.dataTransfer.setData('text/plain', `${r},${c}`);
  }

  handleDragEnd(e) {
    // Clean up if needed
  }

  handleDrop(e, tr, tc) {
    e.preventDefault();
    if (!this.selectedSquare) return;
    this.executePlayerMove(this.selectedSquare.r, this.selectedSquare.c, tr, tc);
  }

  handleSquareClick(r, c) {
    if (this.previewIndex !== -1) {
      this.navigateHistory(-1); // Return to live game
      return;
    }

    if (this.isAiThinking || !this.isPlayerTurn()) return;

    const piece = this.game.board[r][c];

    // If already selected, try to move to clicked target
    if (this.selectedSquare) {
      const match = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (match) {
        this.executePlayerMove(this.selectedSquare.r, this.selectedSquare.c, r, c);
        return;
      }
    }

    // Select new piece of current player's color
    if (piece && this.game.getColor(piece) === this.game.turn) {
      this.selectedSquare = { r, c };
      this.hintMove = null;
      this.legalMovesForSelected = this.game.getLegalMoves(this.game.turn)
        .filter(m => m.from.r === r && m.from.c === c);
      this.renderBoard();
    } else {
      // Clicked on empty or opponent square without valid move
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.renderBoard();
    }
  }

  isPlayerTurn() {
    if (this.playerSide === 'spectate') return false;
    return this.game.turn === this.playerSide;
  }

  executePlayerMove(fr, fc, tr, tc) {
    const candidateMoves = this.legalMovesForSelected.filter(m => m.to.r === tr && m.to.c === tc);
    if (candidateMoves.length === 0) {
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.renderBoard();
      return;
    }

    // Check if move is pawn promotion
    const isPromo = candidateMoves.some(m => m.promotion);
    if (isPromo) {
      this.promptPromotionModal(candidateMoves);
      return;
    }

    const move = candidateMoves[0];
    this.applyMove(move);
  }

  promptPromotionModal(promoMoves) {
    this.pendingPromotionMove = promoMoves;
    this.promoChoicesContainer.innerHTML = '';
    const color = this.game.turn;
    const pieces = ['q', 'r', 'b', 'n'];

    for (const p of pieces) {
      const char = color === 'w' ? p.toUpperCase() : p;
      const btn = document.createElement('button');
      btn.className = 'promo-choice-btn';
      btn.innerHTML = getPieceSvg(char);
      btn.title = `Promote to ${p.toUpperCase()}`;
      btn.addEventListener('click', () => {
        this.promoModal.classList.remove('active');
        const chosen = this.pendingPromotionMove.find(m => m.promotion === char);
        if (chosen) {
          this.applyMove(chosen);
        }
      });
      this.promoChoicesContainer.appendChild(btn);
    }

    this.promoModal.classList.add('active');
  }

  applyMove(move) {
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.hintMove = null;
    this.lastMove = move;

    // Make move in rules engine
    const san = this.game.makeMove(move);

    // Audio Playback
    if (this.game.isCheckmate()) {
      chessAudio.playGameOver(this.game.turn !== (this.playerSide === 'w' ? 'w' : 'b'));
    } else if (this.game.isInCheck(this.game.turn)) {
      chessAudio.playCheck();
    } else if (move.promotion) {
      chessAudio.playPromotion();
    } else if (move.isCastle) {
      chessAudio.playCastle();
    } else if (move.captured) {
      chessAudio.playCapture();
    } else {
      chessAudio.playMove();
    }

    this.renderBoard();
    this.updateUI();

    // Check game over
    const status = this.game.getGameStatus();
    if (status.over) {
      setTimeout(() => {
        this.showGameOverModal(status.result, status.reason);
      }, 350);
      return;
    }

    // Proceed to AI if it's AI turn
    this.checkAiTurn();
  }

  async checkAiTurn() {
    if (this.game.isGameOver()) return;

    const isAi = (this.playerSide === 'spectate') || (this.game.turn !== this.playerSide);
    if (!isAi) {
      this.aiStatusText.textContent = 'Your turn to move';
      this.aiIndicatorPulse.className = 'ai-indicator-pulse';
      return;
    }

    this.isAiThinking = true;
    this.aiStatusText.textContent = `Nova AI is calculating...`;
    this.aiIndicatorPulse.className = 'ai-indicator-pulse thinking';

    // Add brief ergonomic pause so human perceives move transition
    await new Promise(r => setTimeout(r, 280));

    const result = await this.ai.getBestMove(this.difficulty);
    this.isAiThinking = false;

    if (result && result.move) {
      this.aiDepthEl.textContent = `Depth ${result.depth}`;
      this.aiNodesEl.textContent = `${result.nodes.toLocaleString()} nodes (${result.timeMs}ms)`;
      this.aiStatusText.textContent = `Ready for your move`;
      this.aiIndicatorPulse.className = 'ai-indicator-pulse';

      this.applyMove(result.move);
    }
  }

  handleUndo() {
    if (this.isAiThinking || this.game.history.length === 0) return;

    // If human vs AI, undo 2 moves (AI move + human move)
    if (this.playerSide === 'w' || this.playerSide === 'b') {
      if (this.game.turn !== this.playerSide) {
        // AI is currently thinking or turn was somehow off
        this.game.undoMove();
      } else {
        // Undo both moves
        this.game.undoMove();
        if (this.game.history.length > 0 && this.game.turn !== this.playerSide) {
          this.game.undoMove();
        }
      }
    } else {
      this.game.undoMove();
    }

    this.previewIndex = -1;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.hintMove = null;
    this.lastMove = this.game.history.length > 0 ? this.game.history[this.game.history.length - 1].move : null;

    this.renderBoard();
    this.updateUI();
    this.showToast('Undid last turn ↩️');
  }

  async provideHint() {
    if (this.isAiThinking || this.game.isGameOver()) return;
    this.showToast('Calculating best tactical move... 💡');

    const result = await this.ai.getBestMove(Math.max(3, this.difficulty));
    if (result && result.move) {
      this.hintMove = result.move;
      this.renderBoard();
      const fromSq = this.game.coordsToSquare(result.move.from.r, result.move.from.c);
      const toSq = this.game.coordsToSquare(result.move.to.r, result.move.to.c);
      this.showToast(`Recommended: ${fromSq} ➔ ${toSq}`);
    }
  }

  navigateHistory(index) {
    if (this.game.history.length === 0) return;

    if (index === -1 || index >= this.game.history.length) {
      this.previewIndex = -1; // Live position
    } else {
      this.previewIndex = Math.max(0, index);
    }

    this.renderBoard();
    this.updateMoveTableActiveHighlight();
  }

  updateUI() {
    // Turn highlighting on player cards
    const isW = this.playerSide !== 'b';
    const isWhiteTurn = this.game.turn === 'w';

    if (isW) {
      this.whiteCard.classList.toggle('active-turn', isWhiteTurn);
      this.blackCard.classList.toggle('active-turn', !isWhiteTurn);
    } else {
      this.whiteCard.classList.toggle('active-turn', !isWhiteTurn);
      this.blackCard.classList.toggle('active-turn', isWhiteTurn);
    }

    // Update captured pieces & material difference
    this.renderCapturedPieces();

    // Update Evaluation Bar
    this.updateEvalBar();

    // Update Move History table
    this.renderMoveHistory();
  }

  renderCapturedPieces() {
    const { whiteCaptured, blackCaptured, materialDiff } = this.game.getCapturedPieces();

    const renderTray = (container, pieces, isWhitePerspective) => {
      container.innerHTML = '';
      // Group and sort pieces by value
      const sortOrder = ['q', 'r', 'b', 'n', 'p', 'Q', 'R', 'B', 'N', 'P'];
      pieces.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));

      pieces.forEach(p => {
        const mini = document.createElement('span');
        mini.className = 'captured-piece-mini';
        mini.innerHTML = getPieceSvg(p);
        container.appendChild(mini);
      });

      const diff = isWhitePerspective ? materialDiff : -materialDiff;
      if (diff > 0) {
        const badge = document.createElement('span');
        badge.className = 'material-diff';
        badge.textContent = `+${diff}`;
        container.appendChild(badge);
      }
    };

    const isW = this.playerSide !== 'b';
    if (isW) {
      renderTray(this.userCapturedTray, whiteCaptured, true);
      renderTray(this.oppCapturedTray, blackCaptured, false);
    } else {
      renderTray(this.userCapturedTray, blackCaptured, false);
      renderTray(this.oppCapturedTray, whiteCaptured, true);
    }
  }

  updateEvalBar() {
    const score = this.ai.evaluate(this.game.board);
    // Sigmoid curve mapping centipawns to percentage: 0 cp = 50%
    const whiteProb = 1 / (1 + Math.exp(-0.0035 * score));
    const whitePercent = Math.round(whiteProb * 100);
    const blackPercent = 100 - whitePercent;

    this.evalFillWhite.style.height = `${whitePercent}%`;
    this.evalFillBlack.style.height = `${blackPercent}%`;

    const cp = (Math.abs(score) / 100).toFixed(1);
    const sign = score > 0 ? '+' : (score < 0 ? '-' : '');
    this.evalScoreTag.textContent = `${sign}${cp}`;
  }

  renderMoveHistory() {
    this.movesListEl.innerHTML = '';
    const history = this.game.history;

    for (let i = 0; i < history.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const row = document.createElement('div');
      row.className = 'move-row';

      const numEl = document.createElement('span');
      numEl.className = 'move-num';
      numEl.textContent = `${moveNum}.`;
      row.appendChild(numEl);

      // White move
      const whiteSan = document.createElement('span');
      whiteSan.className = 'move-san';
      whiteSan.textContent = history[i].san;
      whiteSan.addEventListener('click', () => this.navigateHistory(i));
      row.appendChild(whiteSan);

      // Black move
      if (i + 1 < history.length) {
        const blackSan = document.createElement('span');
        blackSan.className = 'move-san';
        blackSan.textContent = history[i + 1].san;
        blackSan.addEventListener('click', () => this.navigateHistory(i + 1));
        row.appendChild(blackSan);
      }

      this.movesListEl.appendChild(row);
    }

    this.updateMoveTableActiveHighlight();

    // Auto-scroll to bottom of history table
    this.moveTableContainer.scrollTop = this.moveTableContainer.scrollHeight;
  }

  updateMoveTableActiveHighlight() {
    const sans = this.movesListEl.querySelectorAll('.move-san');
    sans.forEach((el, idx) => {
      el.classList.toggle('active', idx === this.previewIndex);
    });
  }

  exportPgn() {
    let pgn = `[Event "Apex Chess AI Match"]\n`;
    pgn += `[Site "Local Browser"]\n`;
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
    pgn += `[White "${this.playerSide === 'b' ? 'Nova AI' : 'User'}"]\n`;
    pgn += `[Black "${this.playerSide === 'w' ? 'Nova AI' : 'User'}"]\n`;
    const status = this.game.getGameStatus();
    pgn += `[Result "${status.over ? status.result : '*'}"]\n\n`;

    const moves = this.game.history;
    for (let i = 0; i < moves.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      pgn += `${num}. ${moves[i].san} `;
      if (i + 1 < moves.length) {
        pgn += `${moves[i + 1].san} `;
      }
    }
    pgn += status.over ? status.result : '*';

    navigator.clipboard.writeText(pgn).then(() => {
      this.showToast('PGN match record copied to clipboard! 📋');
    });
  }

  showGameOverModal(title, desc) {
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-desc').textContent = desc;

    const isWin = title.includes('1-0') && this.playerSide === 'w' ||
                  title.includes('0-1') && this.playerSide === 'b';
    document.getElementById('game-over-icon').textContent = isWin ? '🏆' : '♟️';

    this.gameOverModal.classList.add('active');
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Instantiate application on window load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ChessApp();
});
