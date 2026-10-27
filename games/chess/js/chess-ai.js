/**
 * Royal Kingdom Chess - Dual AI Architecture with Humanized Cadence
 * Supports Stockfish UCI Worker & Tactical Minimax with Configurable Presentation Speed.
 */

class ChessAI {
    constructor() {
        this.worker = null;
        this.isWorkerReady = false;
        this.currentSearchId = 0;
        this.onThinkingCallback = null;
        this.onThinkingStepCallback = null;
        this.workerFailed = false;

        // Configurable AI response speed: 'fast' (1-1.5s), 'natural' (2.5-3.5s), 'relaxed' (4.5-6.5s)
        this.responseSpeed = localStorage.getItem('rk_ai_speed') || 'natural';

        // 6 Distinct Difficulty Profiles
        this.difficultyProfiles = {
            easy: {
                name: 'Easy',
                stockfishSkill: 0,
                stockfishDepth: 1,
                maxMoveTime: 400,
                blunderRate: 0.35,
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

    setResponseSpeed(speed = 'natural') {
        if (['fast', 'natural', 'relaxed'].includes(speed)) {
            this.responseSpeed = speed;
            localStorage.setItem('rk_ai_speed', speed);
        }
    }

    getResponseSpeed() {
        return this.responseSpeed;
    }

    setThinkingListener(callback) {
        this.onThinkingCallback = callback;
    }

    setThinkingStepListener(callback) {
        this.onThinkingStepCallback = callback;
    }

    notifyThinking(isThinking) {
        if (typeof this.onThinkingCallback === 'function') {
            this.onThinkingCallback(isThinking);
        }
    }

    notifyThinkingStep(msg) {
        if (typeof this.onThinkingStepCallback === 'function') {
            this.onThinkingStepCallback(msg);
        }
    }

    initStockfishWorker() {
        try {
            const workerUrl = 'lib/stockfish.js';
            this.worker = new Worker(workerUrl);

            this.worker.onmessage = (event) => {
                const line = typeof event.data === 'string' ? event.data : '';
                if (line.includes('uciok') || line.includes('readyok')) {
                    this.isWorkerReady = true;
                }
            };

            this.worker.onerror = (err) => {
                console.warn('Stockfish Worker warning, falling back to tactical minimax engine:', err);
                this.workerFailed = true;
                this.isWorkerReady = false;
            };

            this.worker.postMessage('uci');
            this.worker.postMessage('isready');
        } catch (e) {
            console.warn('Using built-in Minimax engine:', e);
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

    // Get Target presentation delay based on selected speed
    getTargetDelay() {
        switch (this.responseSpeed) {
            case 'fast':
                return 800 + Math.random() * 500; // ~0.8s - 1.3s
            case 'relaxed':
                return 4200 + Math.random() * 1800; // ~4.2s - 6.0s
            case 'natural':
            default:
                return 2200 + Math.random() * 1200; // ~2.2s - 3.4s
        }
    }

    async getBestMove(engine, difficultyKey = 'normal') {
        const searchId = ++this.currentSearchId;
        const profile = this.difficultyProfiles[difficultyKey] || this.difficultyProfiles.normal;
        const legalMoves = engine.getAllLegalMoves();

        if (!legalMoves || legalMoves.length === 0) {
            return null;
        }

        const targetDelay = this.getTargetDelay();
        const startTimestamp = Date.now();

        this.notifyThinking(true);
        this.notifyThinkingStep('Analyzing board tactical tension...');

        // Periodic simulated humanized thinking stages
        const stepTimer1 = setTimeout(() => {
            if (this.currentSearchId === searchId) {
                this.notifyThinkingStep('Evaluating piece development & king safety...');
            }
        }, Math.min(800, targetDelay * 0.35));

        const stepTimer2 = setTimeout(() => {
            if (this.currentSearchId === searchId) {
                this.notifyThinkingStep('Calculating royal combinations & counters...');
            }
        }, Math.min(1800, targetDelay * 0.7));

        let chosenMove = null;

        // Blunder factor simulation for lower levels
        if (profile.blunderRate > 0 && Math.random() < profile.blunderRate) {
            chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        } else if (this.worker && this.isWorkerReady && !this.workerFailed) {
            try {
                chosenMove = await this.queryStockfish(engine.getFen(), profile, searchId);
            } catch (err) {
                console.warn('Stockfish query fallback:', err);
            }
        }

        if (!chosenMove && this.currentSearchId === searchId) {
            chosenMove = this.minimaxBestMove(engine, profile.minimaxDepth);
        }

        if (!chosenMove) {
            chosenMove = legalMoves[0];
        }

        // Ensure natural presentation delay is respected
        const elapsed = Date.now() - startTimestamp;
        const remainingDelay = Math.max(0, targetDelay - elapsed);

        if (remainingDelay > 0) {
            await new Promise(r => setTimeout(r, remainingDelay));
        }

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        this.notifyThinking(false);

        // Cancel if search was superseded or game reset
        if (this.currentSearchId !== searchId) {
            return null;
        }

        return chosenMove;
    }

    queryStockfish(fen, profile, searchId) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(null);
            }, profile.maxMoveTime + 1800);

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
            this.worker.postMessage('ucinewgame');
            this.worker.postMessage(`setoption name Skill Level value ${profile.stockfishSkill}`);
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage(`go depth ${profile.stockfishDepth} movetime ${profile.maxMoveTime}`);
        });
    }

    minimaxBestMove(engine, maxDepth = 3) {
        const moves = engine.getAllLegalMoves();
        if (moves.length === 0) return null;

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

    getPSTValue(type, color, row, col) {
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
