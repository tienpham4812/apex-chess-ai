/**
 * Chess AI Engine
 * Minimax with Alpha-Beta Pruning, Quiescence Search, Move Ordering (MVV-LVA),
 * and PeSTO Piece-Square Tables evaluation with opening-to-endgame phase interpolation.
 */

// Piece-Square Tables (White perspective, rank 0 is 8th rank, rank 7 is 1st rank)
// For Black, the table is mirrored vertically: pst[7 - r][c]
const PST = {
  // Pawns (Midgame)
  P_mg: [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [ 50,  50,  50,  50,  50,  50,  50,  50],
    [ 10,  10,  20,  30,  30,  20,  10,  10],
    [  5,   5,  10,  25,  25,  10,   5,   5],
    [  0,   0,   0,  20,  20,   0,   0,   0],
    [  5,  -5, -10,   0,   0, -10,  -5,   5],
    [  5,  10,  10, -20, -20,  10,  10,   5],
    [  0,   0,   0,   0,   0,   0,   0,   0]
  ],
  // Pawns (Endgame)
  P_eg: [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [ 80,  80,  80,  80,  80,  80,  80,  80],
    [ 50,  50,  50,  50,  50,  50,  50,  50],
    [ 30,  30,  30,  30,  30,  30,  30,  30],
    [ 20,  20,  20,  20,  20,  20,  20,  20],
    [ 10,  10,  10,  10,  10,  10,  10,  10],
    [ 10,  10,  10,  10,  10,  10,  10,  10],
    [  0,   0,   0,   0,   0,   0,   0,   0]
  ],
  // Knights
  N_mg: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   0,   0,   0, -20, -40],
    [-30,   0,  10,  15,  15,  10,   0, -30],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   0,  15,  20,  20,  15,   0, -30],
    [-30,   5,  10,  15,  15,  10,   5, -30],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  N_eg: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   0,   0,   0, -20, -40],
    [-30,   0,  10,  15,  15,  10,   0, -30],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   0,  15,  20,  20,  15,   0, -30],
    [-30,   5,  10,  15,  15,  10,   5, -30],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  // Bishops
  B_mg: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,  10,  10,   5,   0, -10],
    [-10,   5,   5,  10,  10,   5,   5, -10],
    [-10,   0,  10,  10,  10,  10,   0, -10],
    [-10,  10,  10,  10,  10,  10,  10, -10],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  B_eg: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,  10,  10,   5,   0, -10],
    [-10,   5,   5,  10,  10,   5,   5, -10],
    [-10,   0,  10,  10,  10,  10,   0, -10],
    [-10,  10,  10,  10,  10,  10,  10, -10],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  // Rooks
  R_mg: [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [  5,  10,  10,  10,  10,  10,  10,   5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [  0,   0,   0,   5,   5,   0,   0,   0]
  ],
  R_eg: [
    [  0,   0,   0,   0,   0,   0,   0,   0],
    [  5,  10,  10,  10,  10,  10,  10,   5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [ -5,   0,   0,   0,   0,   0,   0,  -5],
    [  0,   0,   0,   5,   5,   0,   0,   0]
  ],
  // Queens
  Q_mg: [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   0,   0,   0,   0,   0, -10],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [ -5,   0,   5,   5,   5,   5,   0,  -5],
    [  0,   0,   5,   5,   5,   5,   0,  -5],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
  ],
  Q_eg: [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [-10,   5,  10,  15,  15,  10,   5, -10],
    [ -5,   5,  15,  20,  20,  15,   5,  -5],
    [ -5,   5,  15,  20,  20,  15,   5,  -5],
    [-10,   5,  10,  15,  15,  10,   5, -10],
    [-10,   0,   5,   5,   5,   5,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
  ],
  // King (Midgame: Stay safe in the castled corner)
  K_mg: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [ 20,  20,   0,   0,   0,   0,  20,  20],
    [ 20,  30,  10,   0,   0,  10,  30,  20]
  ],
  // King (Endgame: Centralize and guide pawns)
  K_eg: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10,   0,   0, -10, -20, -30],
    [-30, -10,  20,  30,  30,  20, -10, -30],
    [-30, -10,  30,  40,  40,  30, -10, -30],
    [-30, -10,  30,  40,  40,  30, -10, -30],
    [-30, -10,  20,  30,  30,  20, -10, -30],
    [-30, -30,   0,   0,   0,   0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50]
  ]
};

class ChessAI {
  constructor(game) {
    this.game = game;
    this.nodesEvaluated = 0;
    this.killerMoves = [];
  }

  getPieceSquareValue(piece, r, c, phase) {
    const isW = piece === piece.toUpperCase();
    const type = piece.toUpperCase();
    const row = isW ? r : 7 - r;
    const col = c;

    const mgKey = `${type}_mg`;
    const egKey = `${type}_eg`;

    if (!PST[mgKey]) return 0;

    const mgVal = PST[mgKey][row][col];
    const egVal = PST[egKey][row][col];

    // Linear interpolation between midgame (phase 24) and endgame (phase 0)
    // phase goes from 0 (bare king endgame) to 24 (all pieces present)
    const val = Math.round((mgVal * phase + egVal * (24 - phase)) / 24);
    return isW ? val : -val;
  }

  getGamePhase(board) {
    // Phase weights: Knight: 1, Bishop: 1, Rook: 2, Queen: 4
    let phase = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const t = p.toLowerCase();
        if (t === 'n' || t === 'b') phase += 1;
        else if (t === 'r') phase += 2;
        else if (t === 'q') phase += 4;
      }
    }
    return Math.min(24, phase);
  }

  evaluate(board = this.game.board) {
    let score = 0;
    const phase = this.getGamePhase(board);

    let whiteBishops = 0;
    let blackBishops = 0;
    const whitePawnFiles = Array(8).fill(0);
    const blackPawnFiles = Array(8).fill(0);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const isW = piece === piece.toUpperCase();
        const baseVal = PIECE_VALUES[piece];
        const pstVal = this.getPieceSquareValue(piece, r, c, phase);

        if (isW) {
          score += baseVal + pstVal;
          if (piece === 'B') whiteBishops++;
          if (piece === 'P') whitePawnFiles[c]++;
        } else {
          score -= baseVal;
          score += pstVal;
          if (piece === 'b') blackBishops++;
          if (piece === 'p') blackPawnFiles[c]++;
        }
      }
    }

    // Bishop pair bonus (+30 centipawns)
    if (whiteBishops >= 2) score += 30;
    if (blackBishops >= 2) score -= 30;

    // Pawn structure penalty: doubled pawns (-15 cp per doubled pawn)
    for (let c = 0; c < 8; c++) {
      if (whitePawnFiles[c] > 1) score -= (whitePawnFiles[c] - 1) * 15;
      if (blackPawnFiles[c] > 1) score += (blackPawnFiles[c] - 1) * 15;
    }

    return score;
  }

  scoreMove(move, ply) {
    // Move ordering heuristic:
    // 1. Promotions
    // 2. MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
    // 3. Killer moves
    let score = 0;

    if (move.promotion) {
      score += 9000;
    }

    if (move.captured) {
      const victimValue = PIECE_VALUES[move.captured] || 100;
      const attackerValue = PIECE_VALUES[move.piece] || 100;
      score += 10000 + (victimValue * 10 - attackerValue);
    }

    if (move.isCastle) {
      score += 200;
    }

    return score;
  }

  orderMoves(moves, ply) {
    return moves.sort((a, b) => this.scoreMove(b, ply) - this.scoreMove(a, ply));
  }

  quiescence(game, alpha, beta, color) {
    this.nodesEvaluated++;
    const isW = color === 'w';
    const standPat = isW ? this.evaluate(game.board) : -this.evaluate(game.board);

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Only search captures in quiescence
    const legalMoves = game.getLegalMoves(color);
    const captures = legalMoves.filter(m => m.captured || m.promotion);
    const ordered = this.orderMoves(captures, 0);

    for (const move of ordered) {
      game.makeMove(move);
      const score = -this.quiescence(game, -beta, -alpha, color === 'w' ? 'b' : 'w');
      game.undoMove();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  minimax(game, depth, alpha, beta, color, ply) {
    this.nodesEvaluated++;

    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        // Prefer faster mates (higher ply is worse)
        return -30000 + ply;
      }
      return 0; // Draw
    }

    if (depth <= 0) {
      return this.quiescence(game, alpha, beta, color);
    }

    const moves = game.getLegalMoves(color);
    if (moves.length === 0) {
      return game.isInCheck(color) ? -30000 + ply : 0;
    }

    const ordered = this.orderMoves(moves, ply);

    for (const move of ordered) {
      game.makeMove(move);
      const score = -this.minimax(game, depth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', ply + 1);
      game.undoMove();

      if (score >= beta) {
        return beta; // Alpha-beta cutoff
      }
      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }

  async getBestMove(level = 3) {
    this.nodesEvaluated = 0;
    const startTime = performance.now();
    const color = this.game.turn;
    const moves = this.game.getLegalMoves(color);

    if (moves.length === 0) return null;

    // Level 1: Novice (~800 ELO)
    // High randomness + occasional blunder or basic capture
    if (level === 1) {
      // 35% chance to play random move, else pick best depth 1 move with noise
      if (Math.random() < 0.35) {
        return {
          move: moves[Math.floor(Math.random() * moves.length)],
          score: 0,
          depth: 1,
          nodes: moves.length,
          timeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    let searchDepth = 3;
    let evalNoise = 0;

    switch (level) {
      case 1:
        searchDepth = 1;
        evalNoise = 90;
        break;
      case 2:
        searchDepth = 2;
        evalNoise = 20;
        break;
      case 3:
        searchDepth = 3;
        evalNoise = 0;
        break;
      case 4:
        searchDepth = 4;
        evalNoise = 0;
        break;
      default:
        searchDepth = 3;
    }

    const ordered = this.orderMoves(moves, 0);
    let bestMove = ordered[0];
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    // Async iteration over root moves to allow UI updates
    for (const move of ordered) {
      this.game.makeMove(move);
      let score = -this.minimax(this.game, searchDepth - 1, -beta, -alpha, color === 'w' ? 'b' : 'w', 1);
      this.game.undoMove();

      if (evalNoise > 0) {
        score += (Math.random() * 2 - 1) * evalNoise;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score;
      }

      // Small tick delay to keep browser responsive
      await new Promise(r => setTimeout(r, 0));
    }

    const duration = Math.round(performance.now() - startTime);

    return {
      move: bestMove,
      score: color === 'w' ? bestScore : -bestScore, // Return from White's perspective
      depth: searchDepth,
      nodes: this.nodesEvaluated,
      timeMs: duration
    };
  }
}
