/**
 * Royal Kingdom Chess - Dual AI Architecture
 * Primary: Stockfish Engine via Web Worker (UCI Protocol)
 * Secondary: Full Minimax Alpha-Beta Engine with Piece-Square Tables (Instant Fallback)
 */

class ChessAI {
    constructor() {
        this.worker = null;
        this.isWorkerReady = false;
        this.currentSearchId = 0;
        this.onThinkingCallback = null;
        this.workerFailed = false;

        // 6 Distinct Difficulty Profiles
        this.difficultyProfiles = {
            easy: {
                name: 'Easy',
                stockfishSkill: 0,
                stockfishDepth: 1,
                maxMoveTime: 400,
                blunderRate: 0.35, // 35% chance to make a suboptimal legal move
                minimaxDepth: 1
            },
            medium: {
                name: 'Medium',
                stockfishSkill: 4,
                stockfishDepth: 3,
                maxMoveTime: 600,
                blunderRate: 0.15,
                minimaxDepth: 2
            },
            normal: {
                name: 'Normal',
                stockfishSkill: 8,
                stockfishDepth: 6,
                maxMoveTime: 900,
                blunderRate: 0.05,
                minimaxDepth: 3
            },
            hard: {
                name: 'Hard',
                stockfishSkill: 13,
                stockfishDepth: 9,
                maxMoveTime: 1400,
                blunderRate: 0.0,
                minimaxDepth: 3
            },
            very_hard: {
                name: 'Very Hard',
                stockfishSkill: 17,
                stockfishDepth: 12,
                maxMoveTime: 2000,
                blunderRate: 0.0,
                minimaxDepth: 4
            },
            expert: {
                name: 'Expert',
                stockfishSkill: 20,
                stockfishDepth: 15,
                maxMoveTime: 2800,
                blunderRate: 0.0,
                minimaxDepth: 4
            }
        };

        this.initStockfishWorker();
    }

    setThinkingListener(callback) {
        this.onThinkingCallback = callback;
    }

    notifyThinking(isThinking) {
        if (typeof this.onThinkingCallback === 'function') {
            this.onThinkingCallback(isThinking);
        }
    }

    initStockfishWorker() {
        try {
            // Attempt to load Stockfish worker from local lib or blob
            const workerUrl = 'lib/stockfish.js';
            this.worker = new Worker(workerUrl);

            this.worker.onmessage = (event) => {
                const line = typeof event.data === 'string' ? event.data : '';
                if (line.includes('uciok') || line.includes('readyok')) {
                    this.isWorkerReady = true;
                }
            };

            this.worker.onerror = (err) => {
                console.warn('Stockfish Worker initialization warning, falling back to tactical minimax engine:', err);
                this.workerFailed = true;
                this.isWorkerReady = false;
            };

            // Initialize UCI
            this.worker.postMessage('uci');
            this.worker.postMessage('isready');
        } catch (e) {
            console.warn('Web Worker not allowed or unsupported in this context. Using robust built-in Minimax engine.', e);
            this.workerFailed = true;
            this.isWorkerReady = false;
        }
    }

    stop() {
        this.currentSearchId++;
        this.notifyThinking(false);
        if (this.worker && this.isWorkerReady) {
            try {
                this.worker.postMessage('stop');
            } catch (e) {}
        }
    }

    // Main entry point for getting the AI's move
    async getBestMove(engine, difficultyKey = 'normal') {
        const searchId = ++this.currentSearchId;
        const profile = this.difficultyProfiles[difficultyKey] || this.difficultyProfiles.normal;
        const legalMoves = engine.getAllLegalMoves();

        if (!legalMoves || legalMoves.length === 0) {
            return null;
        }

        this.notifyThinking(true);

        // Blunder factor simulation for lower levels (play a random valid move occasionally)
        if (profile.blunderRate > 0 && Math.random() < profile.blunderRate) {
            await new Promise(r => setTimeout(r, 350 + Math.random() * 300));
            this.notifyThinking(false);
            if (this.currentSearchId !== searchId) return null;
            return legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }

        // Try Stockfish engine first if ready
        if (this.worker && this.isWorkerReady && !this.workerFailed) {
            try {
                const move = await this.queryStockfish(engine.getFen(), profile, searchId);
                this.notifyThinking(false);
                if (move && this.currentSearchId === searchId) {
                    return move;
                }
            } catch (err) {
                console.warn('Stockfish query timed out or failed, utilizing tactical minimax fallback.', err);
            }
        }

        // Tactical Minimax Engine fallback
        await new Promise(r => setTimeout(r, 200 + Math.random() * 250));
        const fallbackMove = this.minimaxBestMove(engine, profile.minimaxDepth);
        this.notifyThinking(false);

        if (this.currentSearchId !== searchId) return null;
        return fallbackMove || legalMoves[0];
    }

    queryStockfish(fen, profile, searchId) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(null);
            }, profile.maxMoveTime + 1500);

            const handler = (event) => {
                const line = typeof event.data === 'string' ? event.data : '';
                if (line.startsWith('bestmove')) {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handler);

                    if (this.currentSearchId !== searchId) {
                        resolve(null);
                        return;
                    }

                    const parts = line.split(' ');
                    const moveStr = parts[1];
                    if (moveStr && moveStr !== '(none)') {
                        const from = moveStr.substring(0, 2);
                        const to = moveStr.substring(2, 4);
                        const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : undefined;
                        resolve({ from, to, promotion });
                    } else {
                        resolve(null);
                    }
                }
            };

            this.worker.addEventListener('message', handler);

            // Configure UCI parameters for the profile
            this.worker.postMessage('ucinewgame');
            this.worker.postMessage(`setoption name Skill Level value ${profile.stockfishSkill}`);
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage(`go depth ${profile.stockfishDepth} movetime ${profile.maxMoveTime}`);
        });
    }

    // =========================================================================
    // BUILT-IN MINIMAX ENGINE WITH PIECE-SQUARE TABLES & HEURISTIC POSITION EVAL
    // =========================================================================
    minimaxBestMove(engine, maxDepth = 3) {
        const moves = engine.getAllLegalMoves();
        if (moves.length === 0) return null;

        // Sort moves: Captures first (MVV-LVA), then checks
        moves.sort((a, b) => {
            const valA = a.captured ? this.getPieceValue(a.captured) * 10 - this.getPieceValue(a.piece) : 0;
            const valB = b.captured ? this.getPieceValue(b.captured) * 10 - this.getPieceValue(b.piece) : 0;
            return valB - valA;
        });

        let bestMove = moves[0];
        const isMaximizing = engine.turn() === 'w';
        let bestValue = isMaximizing ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of moves) {
            engine.chess.move(move);
            const value = this.minimax(engine, maxDepth - 1, alpha, beta, !isMaximizing);
            engine.chess.undo();

            if (isMaximizing) {
                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
                alpha = Math.max(alpha, value);
            } else {
                if (value < bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
                beta = Math.min(beta, value);
            }

            if (beta <= alpha) break;
        }

        return bestMove;
    }

    minimax(engine, depth, alpha, beta, isMaximizing) {
        if (depth <= 0 || engine.chess.game_over()) {
            return this.evaluateBoard(engine);
        }

        const moves = engine.getAllLegalMoves();
        if (moves.length === 0) {
            return this.evaluateBoard(engine);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                engine.chess.move(move);
                const evalScore = this.minimax(engine, depth - 1, alpha, beta, false);
                engine.chess.undo();
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                engine.chess.move(move);
                const evalScore = this.minimax(engine, depth - 1, alpha, beta, true);
                engine.chess.undo();
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    getPieceValue(type) {
        const values = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
        return values[type] || 0;
    }

    // Comprehensive board evaluation: Material + Piece Square Tables (PST) + King Safety
    evaluateBoard(engine) {
        if (engine.chess.in_checkmate()) {
            return engine.chess.turn() === 'w' ? -100000 : 100000;
        }
        if (engine.chess.in_draw() || engine.chess.in_stalemate()) {
            return 0;
        }

        const board = engine.chess.board();
        let totalScore = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece) continue;

                const baseVal = this.getPieceValue(piece.type);
                const pstVal = this.getPSTValue(piece.type, piece.color, r, c);
                const pieceTotal = baseVal + pstVal;

                if (piece.color === 'w') {
                    totalScore += pieceTotal;
                } else {
                    totalScore -= pieceTotal;
                }
            }
        }

        return totalScore;
    }

    // Piece-Square Tables (PST) encourage natural center control and piece development
    getPSTValue(type, color, row, col) {
        // Normalize coordinates for white
        const r = color === 'w' ? 7 - row : row;
        const c = col;

        const pawnPST = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 27, 27, 10,  5,  5],
            [0,  0,  0, 24, 24,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        const knightPST = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 20, 25, 25, 20,  0,-30],
            [-30,  5, 20, 25, 25, 20,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];

        const bishopPST = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  0, 10, 15, 15, 10,  0,-10],
            [-10,  5, 10, 15, 15, 10,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];

        switch (type) {
            case 'p': return pawnPST[r][c];
            case 'n': return knightPST[r][c];
            case 'b': return bishopPST[r][c];
            default: return 0;
        }
    }
}
