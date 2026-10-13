/**
 * Bulletproof Chess Rules Engine
 * Implements standard FIDE rules:
 * - Legal move generation for all pieces
 * - Castling (kingside/queenside with safety checks)
 * - En passant captures
 * - Pawn promotions (Q, R, B, N)
 * - Pin/check detection, checkmate, stalemate
 * - 50-move rule, threefold repetition, insufficient material
 * - Full move stack for lossless undo/redo
 * - Standard Algebraic Notation (SAN) generation & FEN parser
 */

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_VALUES = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
  P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000
};

class ChessGame {
  constructor(fen = STARTING_FEN) {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.turn = 'w';
    this.castling = { K: true, Q: true, k: true, q: true };
    this.enPassant = null; // { r, c }
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = []; // Array of { move, stateSnapshot, san, fen }
    this.positionCounts = new Map(); // For threefold repetition
    this.loadFen(fen);
  }

  isWhite(piece) {
    return piece && piece === piece.toUpperCase();
  }

  isBlack(piece) {
    return piece && piece === piece.toLowerCase();
  }

  getColor(piece) {
    if (!piece) return null;
    return this.isWhite(piece) ? 'w' : 'b';
  }

  cloneBoard(board = this.board) {
    return board.map(row => [...row]);
  }

  loadFen(fen) {
    const parts = fen.trim().split(/\s+/);
    if (parts.length < 4) return false;

    const [rowsFen, turn, castlingStr, epStr, halfmove, fullmove] = parts;
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    const ranks = rowsFen.split('/');

    if (ranks.length !== 8) return false;

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of ranks[r]) {
        if (ch >= '1' && ch <= '8') {
          c += parseInt(ch, 10);
        } else {
          newBoard[r][c] = ch;
          c++;
        }
      }
    }

    this.board = newBoard;
    this.turn = turn === 'b' ? 'b' : 'w';
    this.castling = {
      K: castlingStr.includes('K'),
      Q: castlingStr.includes('Q'),
      k: castlingStr.includes('k'),
      q: castlingStr.includes('q')
    };

    if (epStr && epStr !== '-') {
      this.enPassant = this.squareToCoords(epStr);
    } else {
      this.enPassant = null;
    }

    this.halfmoveClock = halfmove ? parseInt(halfmove, 10) : 0;
    this.fullmoveNumber = fullmove ? parseInt(fullmove, 10) : 1;
    this.history = [];
    this.positionCounts = new Map();
    this.recordPosition();
    return true;
  }

  getFen() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += piece;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${this.turn} `;

    let castling = '';
    if (this.castling.K) castling += 'K';
    if (this.castling.Q) castling += 'Q';
    if (this.castling.k) castling += 'k';
    if (this.castling.q) castling += 'q';
    fen += (castling || '-') + ' ';

    if (this.enPassant) {
      fen += this.coordsToSquare(this.enPassant.r, this.enPassant.c);
    } else {
      fen += '-';
    }

    fen += ` ${this.halfmoveClock} ${this.fullmoveNumber}`;
    return fen;
  }

  getPositionKey() {
    // FEN without halfmove and fullmove counts for threefold repetition
    return this.getFen().split(' ').slice(0, 4).join(' ');
  }

  recordPosition() {
    const key = this.getPositionKey();
    const count = (this.positionCounts.get(key) || 0) + 1;
    this.positionCounts.set(key, count);
  }

  unrecordPosition(key) {
    const count = (this.positionCounts.get(key) || 1) - 1;
    if (count <= 0) {
      this.positionCounts.delete(key);
    } else {
      this.positionCounts.set(key, count);
    }
  }

  coordsToSquare(r, c) {
    const file = String.fromCharCode('a'.charCodeAt(0) + c);
    const rank = 8 - r;
    return `${file}${rank}`;
  }

  squareToCoords(sq) {
    if (!sq || sq.length < 2) return null;
    const c = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const r = 8 - parseInt(sq[1], 10);
    if (r < 0 || r > 7 || c < 0 || c > 7) return null;
    return { r, c };
  }

  findKing(color, board = this.board) {
    const kingChar = color === 'w' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingChar) {
          return { r, c };
        }
      }
    }
    return null;
  }

  isSquareAttacked(r, c, byColor, board = this.board) {
    // Check knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    const knightChar = byColor === 'w' ? 'N' : 'n';
    for (const [dr, dc] of knightMoves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (board[nr][nc] === knightChar) return true;
      }
    }

    // Check pawn attacks
    const pawnChar = byColor === 'w' ? 'P' : 'p';
    const pawnDir = byColor === 'w' ? 1 : -1; // White pawn attacks up (from r+1), Black attacks down (from r-1)
    const pr = r + pawnDir;
    if (pr >= 0 && pr < 8) {
      if (c - 1 >= 0 && board[pr][c - 1] === pawnChar) return true;
      if (c + 1 < 8 && board[pr][c + 1] === pawnChar) return true;
    }

    // Check king attacks (adjacent 1 square)
    const kingChar = byColor === 'w' ? 'K' : 'k';
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const kr = r + dr, kc = c + dc;
        if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8) {
          if (board[kr][kc] === kingChar) return true;
        }
      }
    }

    // Check orthogonal rays (Rook or Queen)
    const rookChar = byColor === 'w' ? 'R' : 'r';
    const queenChar = byColor === 'w' ? 'Q' : 'q';
    const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of orthoDirs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p) {
          if (p === rookChar || p === queenChar) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    // Check diagonal rays (Bishop or Queen)
    const bishopChar = byColor === 'w' ? 'B' : 'b';
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p) {
          if (p === bishopChar || p === queenChar) return true;
          break;
        }
        nr += dr;
        nc += dc;
      }
    }

    return false;
  }

  isInCheck(color = this.turn, board = this.board) {
    const king = this.findKing(color, board);
    if (!king) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(king.r, king.c, opponent, board);
  }

  getPseudoLegalMoves(color = this.turn) {
    const moves = [];
    const isW = color === 'w';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece || this.getColor(piece) !== color) continue;

        const type = piece.toLowerCase();

        // Pawns
        if (type === 'p') {
          const dir = isW ? -1 : 1;
          const startRank = isW ? 6 : 1;
          const promoRank = isW ? 0 : 7;

          // 1 square forward
          const f1r = r + dir;
          if (f1r >= 0 && f1r < 8 && !this.board[f1r][c]) {
            if (f1r === promoRank) {
              for (const promo of ['q', 'r', 'b', 'n']) {
                moves.push({ from: { r, c }, to: { r: f1r, c }, piece, promotion: isW ? promo.toUpperCase() : promo });
              }
            } else {
              moves.push({ from: { r, c }, to: { r: f1r, c }, piece });
            }

            // 2 squares forward from start rank
            const f2r = r + 2 * dir;
            if (r === startRank && !this.board[f2r][c]) {
              moves.push({ from: { r, c }, to: { r: f2r, c }, piece, isDoublePawn: true });
            }
          }

          // Diagonal captures & En Passant
          for (const dc of [-1, 1]) {
            const tc = c + dc;
            const tr = r + dir;
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
              const target = this.board[tr][tc];
              if (target && this.getColor(target) !== color) {
                if (tr === promoRank) {
                  for (const promo of ['q', 'r', 'b', 'n']) {
                    moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target, promotion: isW ? promo.toUpperCase() : promo });
                  }
                } else {
                  moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target });
                }
              } else if (this.enPassant && this.enPassant.r === tr && this.enPassant.c === tc) {
                // En passant
                moves.push({
                  from: { r, c },
                  to: { r: tr, c: tc },
                  piece,
                  isEnPassant: true,
                  captured: isW ? 'p' : 'P'
                });
              }
            }
          }
        }

        // Knights
        else if (type === 'n') {
          const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
          ];
          for (const [dr, dc] of knightMoves) {
            const tr = r + dr, tc = c + dc;
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
              const target = this.board[tr][tc];
              if (!target || this.getColor(target) !== color) {
                moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target || null });
              }
            }
          }
        }

        // Bishops & Queens (diagonals)
        if (type === 'b' || type === 'q') {
          const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
          for (const [dr, dc] of diagDirs) {
            let tr = r + dr, tc = c + dc;
            while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
              const target = this.board[tr][tc];
              if (!target) {
                moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece });
              } else {
                if (this.getColor(target) !== color) {
                  moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target });
                }
                break;
              }
              tr += dr;
              tc += dc;
            }
          }
        }

        // Rooks & Queens (orthogonals)
        if (type === 'r' || type === 'q') {
          const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dr, dc] of orthoDirs) {
            let tr = r + dr, tc = c + dc;
            while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
              const target = this.board[tr][tc];
              if (!target) {
                moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece });
              } else {
                if (this.getColor(target) !== color) {
                  moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target });
                }
                break;
              }
              tr += dr;
              tc += dc;
            }
          }
        }

        // Kings
        else if (type === 'k') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const tr = r + dr, tc = c + dc;
              if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                const target = this.board[tr][tc];
                if (!target || this.getColor(target) !== color) {
                  moves.push({ from: { r, c }, to: { r: tr, c: tc }, piece, captured: target || null });
                }
              }
            }
          }

          // Castling
          const opp = isW ? 'b' : 'w';
          if (!this.isSquareAttacked(r, c, opp, this.board)) {
            // Kingside (e1->g1 or e8->g8)
            const kRight = isW ? this.castling.K : this.castling.k;
            const rookChar = isW ? 'R' : 'r';
            if (kRight && this.board[r][7] === rookChar && !this.board[r][5] && !this.board[r][6]) {
              if (!this.isSquareAttacked(r, 5, opp, this.board) && !this.isSquareAttacked(r, 6, opp, this.board)) {
                moves.push({
                  from: { r, c },
                  to: { r, c: 6 },
                  piece,
                  isCastle: true,
                  castleSide: 'k'
                });
              }
            }

            // Queenside (e1->c1 or e8->c8)
            const qRight = isW ? this.castling.Q : this.castling.q;
            if (qRight && this.board[r][0] === rookChar && !this.board[r][1] && !this.board[r][2] && !this.board[r][3]) {
              if (!this.isSquareAttacked(r, 3, opp, this.board) && !this.isSquareAttacked(r, 2, opp, this.board)) {
                moves.push({
                  from: { r, c },
                  to: { r, c: 2 },
                  piece,
                  isCastle: true,
                  castleSide: 'q'
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }

  getLegalMoves(color = this.turn) {
    const pseudo = this.getPseudoLegalMoves(color);
    const legal = [];

    for (const move of pseudo) {
      if (this.testMoveLegality(move, color)) {
        legal.push(move);
      }
    }

    return legal;
  }

  testMoveLegality(move, color) {
    const { from, to, isCastle, isEnPassant } = move;
    const opp = color === 'w' ? 'b' : 'w';

    // Simple board copy for simulation
    const savedFrom = this.board[from.r][from.c];
    const savedTo = this.board[to.r][to.c];
    let savedEpPawn = null;

    this.board[to.r][to.c] = move.promotion || savedFrom;
    this.board[from.r][from.c] = null;

    if (isEnPassant) {
      const epRow = from.r;
      savedEpPawn = this.board[epRow][to.c];
      this.board[epRow][to.c] = null;
    }

    // Now check if current king is in check
    const inCheck = this.isInCheck(color, this.board);

    // Restore board
    this.board[from.r][from.c] = savedFrom;
    this.board[to.r][to.c] = savedTo;
    if (isEnPassant) {
      this.board[from.r][to.c] = savedEpPawn;
    }

    return !inCheck;
  }

  makeMove(move) {
    const { from, to, piece, captured, promotion, isCastle, castleSide, isEnPassant, isDoublePawn } = move;

    // Snapshot state for undo
    const stateSnapshot = {
      board: this.cloneBoard(),
      turn: this.turn,
      castling: { ...this.castling },
      enPassant: this.enPassant ? { ...this.enPassant } : null,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
      positionKey: this.getPositionKey()
    };

    // Calculate SAN before applying state update
    const san = this.generateSan(move);

    // Apply move to board
    this.board[from.r][from.c] = null;

    if (isCastle) {
      this.board[to.r][to.c] = piece;
      if (castleSide === 'k') {
        this.board[to.r][5] = this.board[to.r][7];
        this.board[to.r][7] = null;
      } else {
        this.board[to.r][3] = this.board[to.r][0];
        this.board[to.r][0] = null;
      }
    } else if (isEnPassant) {
      this.board[to.r][to.c] = piece;
      this.board[from.r][to.c] = null; // Remove captured pawn
    } else if (promotion) {
      this.board[to.r][to.c] = promotion;
    } else {
      this.board[to.r][to.c] = piece;
    }

    // Update castling rights if King or Rook moved or rook was captured
    if (piece === 'K') { this.castling.K = false; this.castling.Q = false; }
    if (piece === 'k') { this.castling.k = false; this.castling.q = false; }
    if (from.r === 7 && from.c === 7) this.castling.K = false;
    if (from.r === 7 && from.c === 0) this.castling.Q = false;
    if (from.r === 0 && from.c === 7) this.castling.k = false;
    if (from.r === 0 && from.c === 0) this.castling.q = false;

    if (to.r === 7 && to.c === 7) this.castling.K = false;
    if (to.r === 7 && to.c === 0) this.castling.Q = false;
    if (to.r === 0 && to.c === 7) this.castling.k = false;
    if (to.r === 0 && to.c === 0) this.castling.q = false;

    // En passant square update
    if (isDoublePawn) {
      const epRow = (from.r + to.r) / 2;
      this.enPassant = { r: epRow, c: from.c };
    } else {
      this.enPassant = null;
    }

    // 50-move clock: reset on pawn move or capture
    if (piece.toLowerCase() === 'p' || captured) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    // Fullmove number
    if (this.turn === 'b') {
      this.fullmoveNumber++;
    }

    // Switch turn
    this.turn = this.turn === 'w' ? 'b' : 'w';

    // Record position for repetition
    this.recordPosition();

    // Store in history
    this.history.push({
      move,
      stateSnapshot,
      san,
      fen: this.getFen()
    });

    return san;
  }

  undoMove() {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    const snap = last.stateSnapshot;

    // Unrecord current position count
    this.unrecordPosition(this.getPositionKey());

    this.board = snap.board;
    this.turn = snap.turn;
    this.castling = snap.castling;
    this.enPassant = snap.enPassant;
    this.halfmoveClock = snap.halfmoveClock;
    this.fullmoveNumber = snap.fullmoveNumber;

    return last.move;
  }

  generateSan(move) {
    if (move.isCastle) {
      return move.castleSide === 'k' ? 'O-O' : 'O-O-O';
    }

    const { from, to, piece, captured, promotion } = move;
    const type = piece.toLowerCase();
    const dest = this.coordsToSquare(to.r, to.c);

    let san = '';

    if (type === 'p') {
      if (captured || move.isEnPassant) {
        const fromFile = String.fromCharCode('a'.charCodeAt(0) + from.c);
        san = `${fromFile}x${dest}`;
      } else {
        san = dest;
      }
      if (promotion) {
        san += `=${promotion.toUpperCase()}`;
      }
    } else {
      san = piece.toUpperCase();

      // Disambiguation: find other pieces of same type that could legally move here
      const legals = this.getLegalMoves(this.turn);
      const ambig = legals.filter(m =>
        m.piece === piece &&
        m.to.r === to.r && m.to.c === to.c &&
        (m.from.r !== from.r || m.from.c !== from.c)
      );

      if (ambig.length > 0) {
        const sameFile = ambig.some(m => m.from.c === from.c);
        const sameRank = ambig.some(m => m.from.r === from.r);
        const fileChar = String.fromCharCode('a'.charCodeAt(0) + from.c);
        const rankChar = 8 - from.r;

        if (!sameFile) {
          san += fileChar;
        } else if (!sameRank) {
          san += rankChar;
        } else {
          san += `${fileChar}${rankChar}`;
        }
      }

      if (captured) {
        san += `x${dest}`;
      } else {
        san += dest;
      }
    }

    // Check / Checkmate suffix simulation
    // We can simulate on temporary board to see check or mate
    const nextTurn = this.turn === 'w' ? 'b' : 'w';
    // Temporarily make move
    const savedFrom = this.board[from.r][from.c];
    const savedTo = this.board[to.r][to.c];
    let savedEpPawn = null;

    this.board[to.r][to.c] = promotion || savedFrom;
    this.board[from.r][from.c] = null;
    if (move.isEnPassant) {
      savedEpPawn = this.board[from.r][to.c];
      this.board[from.r][to.c] = null;
    }

    const inCheck = this.isInCheck(nextTurn, this.board);
    if (inCheck) {
      // Check if mate: are there any legal responses?
      // Simple test
      let hasLegal = false;
      const pseudo = this.getPseudoLegalMoves(nextTurn);
      for (const m of pseudo) {
        if (this.testMoveLegality(m, nextTurn)) {
          hasLegal = true;
          break;
        }
      }
      san += hasLegal ? '+' : '#';
    }

    // Revert temporary move
    this.board[from.r][from.c] = savedFrom;
    this.board[to.r][to.c] = savedTo;
    if (move.isEnPassant) {
      this.board[from.r][to.c] = savedEpPawn;
    }

    return san;
  }

  isCheckmate() {
    return this.isInCheck(this.turn) && this.getLegalMoves(this.turn).length === 0;
  }

  isStalemate() {
    return !this.isInCheck(this.turn) && this.getLegalMoves(this.turn).length === 0;
  }

  isThreefoldRepetition() {
    const key = this.getPositionKey();
    return (this.positionCounts.get(key) || 0) >= 3;
  }

  isFiftyMoveRule() {
    return this.halfmoveClock >= 100; // 50 full moves = 100 half moves
  }

  isInsufficientMaterial() {
    const pieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push({ p, r, c });
      }
    }

    // King vs King
    if (pieces.length === 2) return true;

    // King + Bishop vs King or King + Knight vs King
    if (pieces.length === 3) {
      return pieces.some(item => ['b', 'n', 'B', 'N'].includes(item.p));
    }

    // King + Bishop vs King + Bishop with same colored squares
    if (pieces.length === 4) {
      const bishops = pieces.filter(item => item.p.toLowerCase() === 'b');
      if (bishops.length === 2 && this.getColor(bishops[0].p) !== this.getColor(bishops[1].p)) {
        const colorSquare1 = (bishops[0].r + bishops[0].c) % 2;
        const colorSquare2 = (bishops[1].r + bishops[1].c) % 2;
        if (colorSquare1 === colorSquare2) return true;
      }
    }

    return false;
  }

  isGameOver() {
    return this.isCheckmate() || this.isStalemate() || this.isThreefoldRepetition() || this.isFiftyMoveRule() || this.isInsufficientMaterial();
  }

  getGameStatus() {
    if (this.isCheckmate()) {
      const winner = this.turn === 'w' ? 'Black' : 'White';
      return { over: true, result: winner === 'White' ? '1-0' : '0-1', reason: `Checkmate! ${winner} wins.` };
    }
    if (this.isStalemate()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Stalemate.' };
    }
    if (this.isThreefoldRepetition()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Threefold Repetition.' };
    }
    if (this.isFiftyMoveRule()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by 50-Move Rule.' };
    }
    if (this.isInsufficientMaterial()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by Insufficient Material.' };
    }
    if (this.isInCheck(this.turn)) {
      return { over: false, check: true, reason: 'Check!' };
    }
    return { over: false, check: false, reason: 'In progress' };
  }

  getCapturedPieces() {
    const startCounts = { p: 8, n: 2, b: 2, r: 2, q: 1, P: 8, N: 2, B: 2, R: 2, Q: 1 };
    const currentCounts = { p: 0, n: 0, b: 0, r: 0, q: 0, P: 0, N: 0, B: 0, R: 0, Q: 0 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.toLowerCase() !== 'k') {
          currentCounts[piece] = (currentCounts[piece] || 0) + 1;
        }
      }
    }

    const whiteCaptured = []; // Black pieces captured by white
    const blackCaptured = []; // White pieces captured by black

    for (const [p, count] of Object.entries(startCounts)) {
      const lost = count - (currentCounts[p] || 0);
      if (lost > 0) {
        for (let i = 0; i < lost; i++) {
          if (p === p.toLowerCase()) {
            whiteCaptured.push(p);
          } else {
            blackCaptured.push(p);
          }
        }
      }
    }

    // Material difference
    let whiteScore = 0, blackScore = 0;
    for (const p of whiteCaptured) whiteScore += (PIECE_VALUES[p] || 0);
    for (const p of blackCaptured) blackScore += (PIECE_VALUES[p] || 0);

    return {
      whiteCaptured,
      blackCaptured,
      materialDiff: (whiteScore - blackScore) / 100
    };
  }
}
