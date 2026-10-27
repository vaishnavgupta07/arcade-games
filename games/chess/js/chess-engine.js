/**
 * Royal Kingdom Chess - Rules & Game State Engine
 * Robust wrapper around chess.js ensuring 100% standards-compliant chess logic.
 */

class ChessEngine {
    constructor() {
        if (typeof Chess === 'undefined') {
            throw new Error('chess.js library is required for ChessEngine.');
        }
        this.chess = new Chess();
        this.moveHistory = []; // Array of detailed move records
        this.capturedPieces = { w: [], b: [] };
    }

    reset() {
        this.chess.reset();
        this.moveHistory = [];
        this.capturedPieces = { w: [], b: [] };
    }

    loadFen(fen) {
        const valid = this.chess.load(fen);
        if (valid) {
            this.recalculateCaptures();
        }
        return valid;
    }

    getFen() {
        return this.chess.fen();
    }

    turn() {
        return this.chess.turn(); // 'w' or 'b'
    }

    inCheck() {
        return this.chess.in_check();
    }

    inCheckmate() {
        return this.chess.in_checkmate();
    }

    inStalemate() {
        return this.chess.in_stalemate();
    }

    inThreefoldRepetition() {
        return this.chess.in_threefold_repetition();
    }

    inDraw() {
        return this.chess.in_draw();
    }

    insufficientMaterial() {
        return this.chess.insufficient_material();
    }

    halfMoves() {
        // Half-move clock for 50-move rule
        const tokens = this.getFen().split(' ');
        return parseInt(tokens[4] || 0, 10);
    }

    isGameOver() {
        if (this.chess.in_checkmate()) {
            const winner = this.chess.turn() === 'w' ? 'b' : 'w';
            return {
                isOver: true,
                result: winner === 'w' ? 'white_win' : 'black_win',
                winner: winner,
                reason: 'checkmate'
            };
        }

        if (this.chess.in_stalemate()) {
            return {
                isOver: true,
                result: 'draw',
                winner: null,
                reason: 'stalemate'
            };
        }

        if (this.chess.in_threefold_repetition()) {
            return {
                isOver: true,
                result: 'draw',
                winner: null,
                reason: 'threefold_repetition'
            };
        }

        if (this.chess.insufficient_material()) {
            return {
                isOver: true,
                result: 'draw',
                winner: null,
                reason: 'insufficient_material'
            };
        }

        if (this.halfMoves() >= 100) {
            return {
                isOver: true,
                result: 'draw',
                winner: null,
                reason: 'fifty_move_rule'
            };
        }

        if (this.chess.in_draw()) {
            return {
                isOver: true,
                result: 'draw',
                winner: null,
                reason: 'draw'
            };
        }

        return { isOver: false, result: null, winner: null, reason: null };
    }

    // Returns array of legal moves for a given square
    getLegalMoves(square) {
        if (!square) return [];
        return this.chess.moves({ square: square, verbose: true });
    }

    // All legal moves for current turn
    getAllLegalMoves() {
        return this.chess.moves({ verbose: true });
    }

    // Execute move: { from: 'e2', to: 'e4', promotion: 'q' }
    makeMove(moveObj) {
        const move = this.chess.move(moveObj);
        if (!move) return null;

        // Track captured piece
        if (move.captured) {
            const victimColor = move.color === 'w' ? 'b' : 'w';
            this.capturedPieces[victimColor].push(move.captured);
        }

        this.moveHistory.push({
            san: move.san,
            from: move.from,
            to: move.to,
            piece: move.piece,
            color: move.color,
            captured: move.captured || null,
            promotion: move.promotion || null,
            flags: move.flags,
            fen: this.chess.fen()
        });

        return move;
    }

    undo() {
        const undone = this.chess.undo();
        if (undone) {
            this.moveHistory.pop();
            this.recalculateCaptures();
        }
        return undone;
    }

    recalculateCaptures() {
        // Calculate captures from original full set of 16 pieces per side
        const initialCounts = {
            p: 8, r: 2, n: 2, b: 2, q: 1, k: 1
        };

        const currentCounts = {
            w: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 },
            b: { p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 }
        };

        const board = this.chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    currentCounts[piece.color][piece.type]++;
                }
            }
        }

        this.capturedPieces = { w: [], b: [] };
        ['w', 'b'].forEach(color => {
            Object.keys(initialCounts).forEach(type => {
                const missing = Math.max(0, initialCounts[type] - currentCounts[color][type]);
                for (let i = 0; i < missing; i++) {
                    this.capturedPieces[color].push(type);
                }
            });
        });
    }

    getMaterialDifference() {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        let whiteScore = 0;
        let blackScore = 0;

        const board = this.chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    if (piece.color === 'w') whiteScore += values[piece.type];
                    else blackScore += values[piece.type];
                }
            }
        }

        return {
            white: whiteScore,
            black: blackScore,
            difference: whiteScore - blackScore // Positive: White is ahead, Negative: Black is ahead
        };
    }

    getPieceAt(square) {
        return this.chess.get(square);
    }

    getBoardMatrix() {
        return this.chess.board();
    }

    // Convert file/rank index (0..7, 0..7) to chess square string 'a8'..'h1'
    static coordsToSquare(fileIdx, rankIdx) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[fileIdx] + ranks[rankIdx];
    }

    // Convert 'e4' to { fileIdx: 4, rankIdx: 4 }
    static squareToCoords(square) {
        const fileIdx = square.charCodeAt(0) - 97;
        const rankIdx = 8 - parseInt(square[1], 10);
        return { fileIdx, rankIdx };
    }
}
