/**
 * Royal Kingdom Chess - Main UI Controller & Coordinator
 * Orchestrates Engine, 3D/2D views, Stockfish/Minimax AI, Clocks, Onboarding & Progression.
 */

class ChessGameController {
    constructor() {
        this.engine = new ChessEngine();
        this.progression = new ChessProgression();
        this.ai = new ChessAI();
        this.timer = new ChessTimer();

        // Game Configuration & State
        this.currentMode = 'ai'; // 'ai' | 'local' | 'practice' | 'lesson'
        this.playerColor = 'w';  // Player's color in vs AI
        this.activeDifficulty = 'easy';
        this.is3D = true;
        this.currentMatchId = null;
        this.matchStartTime = null;
        this.isCompetitive = true;
        this.pendingPromotion = null; // { from, to }

        // Review Mode State
        this.isReviewing = false;
        this.reviewIndex = -1;

        // Lesson State
        this.currentLessonIdx = 0;

        // DOM elements
        this.initDOMRefs();
        this.initViewports();
        this.bindEvents();
        this.bindTimerListeners();
        this.bindAIListeners();

        // Check onboarding
        this.checkOnboarding();
    }

    initDOMRefs() {
        this.viewport3DContainer = document.getElementById('viewport3D');
        this.viewport2DContainer = document.getElementById('viewport2D');
        this.statusBadge = document.getElementById('statusBadge');
        this.statusText = document.getElementById('statusText');

        // Players & Clocks
        this.cardTop = document.getElementById('cardTop');
        this.cardBottom = document.getElementById('cardBottom');
        this.nameTop = document.getElementById('nameTop');
        this.nameBottom = document.getElementById('nameBottom');
        this.subTop = document.getElementById('subTop');
        this.subBottom = document.getElementById('subBottom');
        this.clockTop = document.getElementById('clockTop');
        this.clockBottom = document.getElementById('clockBottom');

        // Captured Pieces
        this.capturedTop = document.getElementById('capturedTop');
        this.capturedBottom = document.getElementById('capturedBottom');
        this.advantageDisplay = document.getElementById('advantageDisplay');

        // Moves
        this.movesList = document.getElementById('movesList');

        // Modals
        this.onboardingModal = document.getElementById('onboardingModal');
        this.setupModal = document.getElementById('setupModal');
        this.resultModal = document.getElementById('resultModal');
        this.unlockModal = document.getElementById('unlockModal');
        this.promotionModal = document.getElementById('promotionModal');
        this.lessonModal = document.getElementById('lessonModal');
        this.achievementsModal = document.getElementById('achievementsModal');
    }

    initViewports() {
        // Initialize 3D Viewport
        try {
            this.view3D = new Chess3D(this.viewport3DContainer, (sq) => this.handleSquareClick(sq));
        } catch (e) {
            console.warn('3D initialization failed, defaulting to 2D view:', e);
            this.is3D = false;
        }

        // Initialize 2D Viewport
        this.view2D = new Chess2D(this.viewport2DContainer, (sq) => this.handleSquareClick(sq));
        this.updateViewVisibility();
    }

    updateViewVisibility() {
        if (this.is3D && this.view3D) {
            this.viewport3DContainer.style.display = 'block';
            this.viewport2DContainer.style.display = 'none';
            document.getElementById('viewModeText').innerText = '2D View';
            this.view3D.handleResize();
        } else {
            this.viewport3DContainer.style.display = 'none';
            this.viewport2DContainer.style.display = 'flex';
            document.getElementById('viewModeText').innerText = '3D View';
        }
        this.renderBoard();
    }

    toggle2D3D() {
        if (!this.view3D) {
            this.is3D = false;
            return;
        }
        this.is3D = !this.is3D;
        this.updateViewVisibility();
    }

    bindTimerListeners() {
        this.timer.setListeners({
            onTick: (data) => {
                const whiteClock = data.w;
                const blackClock = data.b;

                if (this.playerColor === 'w') {
                    this.clockBottom.innerText = whiteClock;
                    this.clockTop.innerText = blackClock;
                } else {
                    this.clockBottom.innerText = blackClock;
                    this.clockTop.innerText = whiteClock;
                }

                // Low time alert
                this.clockBottom.classList.toggle('low-time', data.rawMs[this.playerColor] < 15000 && data.isTimed);
                const oppColor = this.playerColor === 'w' ? 'b' : 'w';
                this.clockTop.classList.toggle('low-time', data.rawMs[oppColor] < 15000 && data.isTimed);
            },
            onTimeout: (timedOutColor) => {
                this.handleTimeout(timedOutColor);
            }
        });
    }

    bindAIListeners() {
        this.ai.setThinkingListener((isThinking) => {
            if (isThinking) {
                this.statusBadge.className = 'rk-status-badge thinking';
                this.statusText.innerText = 'Royal AI is calculating...';
            } else {
                this.updateTurnStatus();
            }
        });
    }

    bindEvents() {
        // Toggle view
        document.getElementById('viewToggleBtn').addEventListener('click', () => this.toggle2D3D());

        // Top-down camera toggle
        document.getElementById('topDownBtn').addEventListener('click', () => {
            if (this.is3D && this.view3D) {
                const isTD = this.view3D.toggleTopDown();
                document.getElementById('topDownBtn').classList.toggle('active', isTD);
            }
        });

        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

        // Promotion pieces
        document.querySelectorAll('.rk-promo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pieceType = btn.dataset.piece;
                this.completePromotion(pieceType);
            });
        });

        // Setup modal difficulty ladder clicks
        document.getElementById('ladderContainer').addEventListener('click', (e) => {
            const item = e.target.closest('.rk-ladder-item');
            if (item && !item.classList.contains('locked')) {
                document.querySelectorAll('.rk-ladder-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                this.activeDifficulty = item.dataset.level;
            }
        });

        // Review buttons
        document.getElementById('reviewStart').addEventListener('click', () => this.goToReviewStep(0));
        document.getElementById('reviewPrev').addEventListener('click', () => this.goToReviewStep(this.reviewIndex - 1));
        document.getElementById('reviewNext').addEventListener('click', () => this.goToReviewStep(this.reviewIndex + 1));
        document.getElementById('reviewEnd').addEventListener('click', () => this.goToReviewStep(this.engine.moveHistory.length - 1));
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    // =========================================================================
    // ONBOARDING & EXPERIENCE MODAL
    // =========================================================================
    checkOnboarding() {
        const prefs = this.progression.getUserPrefs();
        if (!prefs || !prefs.experienceLevel) {
            this.openModal('onboardingModal');
        } else {
            this.openSetupModal();
        }
    }

    selectExperience(level) {
        this.progression.saveUserPrefs({ experienceLevel: level });
        this.closeModal('onboardingModal');

        if (level === 'beginner') {
            // Offer guided lessons
            this.startLessons();
        } else {
            this.openSetupModal();
        }
    }

    openSetupModal() {
        this.renderDifficultyLadder();
        this.openModal('setupModal');
    }

    renderDifficultyLadder() {
        const container = document.getElementById('ladderContainer');
        const progress = this.progression.getProgress();
        container.innerHTML = '';

        progress.levels.forEach(lvl => {
            const item = document.createElement('div');
            item.className = `rk-ladder-item ${lvl.unlocked ? '' : 'locked'} ${lvl.id === this.activeDifficulty ? 'selected' : ''}`;
            item.dataset.level = lvl.id;

            const iconClass = lvl.unlocked ? 'fa-chess-rook' : 'fa-lock';
            let badgeText = '';
            if (lvl.unlocked) {
                badgeText = `<span class="rk-win-badge"><i class="fas fa-trophy"></i> ${lvl.wins}/${lvl.requiredWins} Wins</span>`;
            } else {
                badgeText = `<span class="rk-lock-badge"><i class="fas fa-lock"></i> Requires 2 wins on previous tier</span>`;
            }

            item.innerHTML = `
                <div class="rk-level-name">
                    <i class="fas ${iconClass}"></i>
                    <span>${lvl.name}</span>
                </div>
                ${badgeText}
            `;
            container.appendChild(item);
        });
    }

    // =========================================================================
    // GAME INITIALIZATION
    // =========================================================================
    startMatchFromSetup() {
        const mode = document.querySelector('input[name="gameMode"]:checked').value;
        const color = document.querySelector('input[name="playerColor"]:checked').value;
        const timePreset = document.getElementById('timePresetSelect').value;

        this.currentMode = mode;
        this.playerColor = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
        this.isCompetitive = (mode === 'ai'); // Practice / Local is unranked
        this.currentMatchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        this.matchStartTime = Date.now();
        this.isReviewing = false;

        // Configure Timer
        let minutes = 0;
        let increment = 0;
        switch (timePreset) {
            case '1': minutes = 1; increment = 0; break;
            case '3': minutes = 3; increment = 2; break;
            case '5': minutes = 5; increment = 3; break;
            case '10': minutes = 10; increment = 5; break;
            case '15': minutes = 15; increment = 10; break;
            case 'custom':
                minutes = parseFloat(document.getElementById('customMinutesInput').value) || 5;
                increment = parseInt(document.getElementById('customIncrementInput').value, 10) || 0;
                break;
            default: minutes = 0; increment = 0; break;
        }
        this.timer.configure({ minutes, increment });

        this.closeModal('setupModal');
        this.startNewGame();
    }

    startNewGame() {
        this.ai.stop();
        this.engine.reset();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;

        // Board orientation
        if (this.view3D) this.view3D.setOrientation(this.playerColor);
        this.view2D.setOrientation(this.playerColor);

        // Update UI HUD Players
        this.updateHUDPlayers();
        this.renderMovesList();
        this.renderBoard();
        this.updateTurnStatus();

        // Start timer
        this.timer.start('w');

        // If player chose Black and playing AI, AI makes the opening move
        if (this.currentMode === 'ai' && this.playerColor === 'b') {
            this.triggerAIMove();
        }
    }

    updateHUDPlayers() {
        if (this.currentMode === 'ai') {
            const profile = this.ai.difficultyProfiles[this.activeDifficulty] || { name: 'Normal' };
            if (this.playerColor === 'w') {
                this.nameBottom.innerText = 'You (White)';
                this.subBottom.innerText = 'Challenger';
                this.nameTop.innerText = `Royal Engine (${profile.name})`;
                this.subTop.innerText = 'Stockfish AI';
            } else {
                this.nameBottom.innerText = 'You (Black)';
                this.subBottom.innerText = 'Challenger';
                this.nameTop.innerText = `Royal Engine (${profile.name})`;
                this.subTop.innerText = 'Stockfish AI';
            }
        } else if (this.currentMode === 'local') {
            this.nameBottom.innerText = 'White Player';
            this.subBottom.innerText = 'Local Challenger';
            this.nameTop.innerText = 'Black Player';
            this.subTop.innerText = 'Local Challenger';
        } else {
            this.nameBottom.innerText = 'Player (Practice)';
            this.subBottom.innerText = 'Sandbox Mode';
            this.nameTop.innerText = 'Practice Assistant';
            this.subTop.innerText = 'Hints & Undos Active';
        }
    }

    // =========================================================================
    // BOARD INTERACTION & MOVE EXECUTION
    // =========================================================================
    handleSquareClick(square) {
        if (this.isReviewing) return;
        const currentTurn = this.engine.turn();

        // Ignore clicks if AI is calculating
        if (this.currentMode === 'ai' && currentTurn !== this.playerColor) {
            return;
        }

        // If clicking on an already selected square, deselect
        if (this.selectedSquare === square) {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.renderBoard();
            return;
        }

        // Check if clicked square is a destination of a legal move
        const moveAttempt = this.legalMoves.find(m => m.to === square);
        if (moveAttempt) {
            // Check for Pawn Promotion
            if (moveAttempt.flags.includes('p') || (moveAttempt.piece === 'p' && (square[1] === '8' || square[1] === '1'))) {
                this.pendingPromotion = { from: this.selectedSquare, to: square };
                this.openModal('promotionModal');
                return;
            }

            this.executePlayerMove(this.selectedSquare, square);
            return;
        }

        // Otherwise select piece on square if it matches current turn
        const piece = this.engine.getPieceAt(square);
        if (piece && piece.color === currentTurn) {
            this.selectedSquare = square;
            this.legalMoves = this.engine.getLegalMoves(square);
            ChessAudio.playSelect();
            this.renderBoard();
        } else {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.renderBoard();
        }
    }

    completePromotion(pieceType) {
        this.closeModal('promotionModal');
        if (this.pendingPromotion) {
            this.executePlayerMove(this.pendingPromotion.from, this.pendingPromotion.to, pieceType);
            this.pendingPromotion = null;
        }
    }

    executePlayerMove(from, to, promotion = 'q') {
        const move = this.engine.makeMove({ from, to, promotion });
        if (!move) return;

        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = { from, to };

        // Audio & Animation
        if (move.captured) ChessAudio.playCapture();
        else ChessAudio.playMove();

        if (this.engine.inCheck()) ChessAudio.playCheck();

        if (this.is3D && this.view3D) {
            this.view3D.animateMove(from, to, () => {
                this.afterMoveLogic();
            });
        } else {
            this.afterMoveLogic();
        }
    }

    afterMoveLogic() {
        this.timer.switchTurn(this.engine.turn());
        this.renderBoard();
        this.renderMovesList();
        this.updateCapturedAndAdvantage();
        this.updateTurnStatus();

        // Check for Game Over
        const overStatus = this.engine.isGameOver();
        if (overStatus.isOver) {
            this.handleGameOver(overStatus.result, overStatus.reason);
            return;
        }

        // If local 2-player mode with auto-rotate
        if (this.currentMode === 'local' && document.getElementById('autoRotateCheck')?.checked) {
            const nextTurn = this.engine.turn();
            if (this.view3D) this.view3D.setOrientation(nextTurn);
            this.view2D.setOrientation(nextTurn);
        }

        // If AI's turn
        if (this.currentMode === 'ai' && this.engine.turn() !== this.playerColor) {
            this.triggerAIMove();
        }
    }

    async triggerAIMove() {
        const bestMove = await this.ai.getBestMove(this.engine, this.activeDifficulty);
        if (!bestMove) return;

        const move = this.engine.makeMove(bestMove);
        if (!move) return;

        this.lastMove = { from: move.from, to: move.to };
        if (move.captured) ChessAudio.playCapture();
        else ChessAudio.playMove();

        if (this.engine.inCheck()) ChessAudio.playCheck();

        if (this.is3D && this.view3D) {
            this.view3D.animateMove(move.from, move.to, () => {
                this.afterAIMoveLogic();
            });
        } else {
            this.afterAIMoveLogic();
        }
    }

    afterAIMoveLogic() {
        this.timer.switchTurn(this.engine.turn());
        this.renderBoard();
        this.renderMovesList();
        this.updateCapturedAndAdvantage();
        this.updateTurnStatus();

        const overStatus = this.engine.isGameOver();
        if (overStatus.isOver) {
            this.handleGameOver(overStatus.result, overStatus.reason);
        }
    }

    // =========================================================================
    // GAME OVER & PROGRESSION UNLOCK
    // =========================================================================
    handleGameOver(result, reason) {
        this.timer.pause();

        let modalTitle = '';
        let modalDesc = '';
        let crestClass = 'fa-crown';

        const isWin = (result === 'white_win' && this.playerColor === 'w') || (result === 'black_win' && this.playerColor === 'b');
        const isLoss = (result === 'white_win' && this.playerColor === 'b') || (result === 'black_win' && this.playerColor === 'w');

        if (isWin) {
            modalTitle = 'VICTORIOUS KINGDOM!';
            modalDesc = `Superb tactical triumph! Opponent fell to ${reason.replace('_', ' ')}.`;
            crestClass = 'fa-trophy';
            ChessAudio.playVictory();
        } else if (isLoss) {
            modalTitle = 'THE KINGDOM HAS FALLEN';
            modalDesc = `Defeated by ${reason.replace('_', ' ')}. Reflect on the battlefield and strike back!`;
            crestClass = 'fa-skull';
            ChessAudio.playDefeat();
        } else {
            modalTitle = 'ROYAL STALEMATE';
            modalDesc = `The battle ended in a peaceful draw (${reason.replace('_', ' ')}).`;
            crestClass = 'fa-handshake';
        }

        // Record progression in competitive mode
        if (this.isCompetitive && this.currentMode === 'ai') {
            const outcome = this.progression.recordMatch({
                id: this.currentMatchId,
                playerColor: this.playerColor,
                difficulty: this.activeDifficulty,
                result: isWin ? 'win' : (isLoss ? 'loss' : 'draw'),
                endReason: reason,
                moveCount: this.engine.moveHistory.length,
                durationSeconds: Math.round((Date.now() - this.matchStartTime) / 1000),
                timeControl: this.timer.isTimed() ? 'Timed' : 'Casual',
                isCompetitive: true
            });

            if (outcome.newlyUnlockedLevel) {
                // Celebrate newly unlocked tier!
                ChessAudio.playUnlock();
                document.getElementById('unlockTierName').innerText = outcome.newlyUnlockedLevel.name;
                this.openModal('unlockModal');
            }
        }

        // Populate Result Modal
        document.getElementById('resultModalTitle').innerText = modalTitle;
        document.getElementById('resultModalDesc').innerText = modalDesc;
        document.getElementById('resultModalCrest').className = `fas ${crestClass} rk-crest-icon`;
        document.getElementById('resMovesCount').innerText = this.engine.moveHistory.length;
        document.getElementById('resDuration').innerText = Math.round((Date.now() - this.matchStartTime) / 1000) + 's';

        this.openModal('resultModal');
    }

    handleTimeout(timedOutColor) {
        const winner = timedOutColor === 'w' ? 'b' : 'w';
        this.handleGameOver(winner === 'w' ? 'white_win' : 'black_win', 'timeout');
    }

    resign() {
        if (!confirm('Are you certain you wish to resign this royal match?')) return;
        const winner = this.playerColor === 'w' ? 'black_win' : 'white_win';
        this.handleGameOver(winner, 'resignation');
    }

    offerDraw() {
        if (this.currentMode === 'ai') {
            // AI evaluates if position is equal
            const diff = Math.abs(this.engine.getMaterialDifference().difference);
            if (diff <= 1) {
                alert('The Royal AI accepts your honorable draw offer.');
                this.handleGameOver('draw', 'draw_agreement');
            } else {
                alert('The Royal AI declines the draw offer and fights on!');
            }
        } else {
            if (confirm('Does Black/White agree to an honorable draw?')) {
                this.handleGameOver('draw', 'draw_agreement');
            }
        }
    }

    undoMove() {
        if (!this.engine.moveHistory.length) return;
        if (this.currentMode === 'ai') {
            // Undo AI move and player move
            this.engine.undo();
            this.engine.undo();
        } else {
            this.engine.undo();
        }
        this.isCompetitive = false; // Disqualify from progression wins
        this.lastMove = null;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.renderBoard();
        this.renderMovesList();
        this.updateTurnStatus();
        this.updateCapturedAndAdvantage();
    }

    async suggestHint() {
        const bestMove = await this.ai.getBestMove(this.engine, 'expert');
        if (bestMove) {
            this.selectedSquare = bestMove.from;
            this.legalMoves = [{ to: bestMove.to, flags: '', captured: null }];
            this.renderBoard();
            this.statusText.innerText = `Hint: Consider moving ${bestMove.from.toUpperCase()} to ${bestMove.to.toUpperCase()}`;
        }
    }

    // =========================================================================
    // RENDERING & HUD UPDATES
    // =========================================================================
    renderBoard() {
        let checkSquare = null;
        if (this.engine.inCheck()) {
            const currentTurn = this.engine.turn();
            const board = this.engine.getBoardMatrix();
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const p = board[r][c];
                    if (p && p.type === 'k' && p.color === currentTurn) {
                        checkSquare = ChessEngine.coordsToSquare(c, r);
                    }
                }
            }
        }

        const highlights = {
            selected: this.selectedSquare,
            legalMoves: this.legalMoves,
            lastMove: this.lastMove,
            checkSquare
        };

        if (this.is3D && this.view3D) {
            this.view3D.render(this.engine, highlights);
        }
        this.view2D.render(this.engine, highlights);
    }

    updateTurnStatus() {
        const turn = this.engine.turn();
        const isPlayerTurn = (this.currentMode !== 'ai' || turn === this.playerColor);

        this.statusBadge.className = 'rk-status-badge';
        if (this.engine.inCheck()) {
            this.statusBadge.classList.add('in-check');
            this.statusText.innerText = (turn === 'w' ? 'White' : 'Black') + ' is in CHECK!';
        } else {
            this.statusText.innerText = isPlayerTurn ? 'Your Turn' : 'Opponent Moving...';
        }

        // Active turn cards
        const isBottomActive = (this.playerColor === turn);
        this.cardBottom.classList.toggle('active-turn', isBottomActive);
        this.cardTop.classList.toggle('active-turn', !isBottomActive);
    }

    renderMovesList() {
        this.movesList.innerHTML = '';
        const history = this.engine.moveHistory;

        for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = history[i];
            const blackMove = history[i + 1];

            const row = document.createElement('div');
            row.className = 'rk-move-row';
            row.innerHTML = `
                <span class="rk-move-num">${moveNum}.</span>
                <span class="rk-move-san ${this.reviewIndex === i ? 'active-step' : ''}" onclick="window.chessGame.goToReviewStep(${i})">${whiteMove ? whiteMove.san : ''}</span>
                <span class="rk-move-san ${this.reviewIndex === i + 1 ? 'active-step' : ''}" onclick="window.chessGame.goToReviewStep(${i + 1})">${blackMove ? blackMove.san : ''}</span>
            `;
            this.movesList.appendChild(row);
        }
        this.movesList.scrollTop = this.movesList.scrollHeight;
    }

    updateCapturedAndAdvantage() {
        const captured = this.engine.capturedPieces;
        const diff = this.engine.getMaterialDifference();

        const symbols = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };

        // Top player captured
        const topColor = this.playerColor === 'w' ? 'b' : 'w';
        const bottomColor = this.playerColor;

        this.capturedTop.innerHTML = captured[bottomColor].map(t => symbols[t] || '').join('');
        this.capturedBottom.innerHTML = captured[topColor].map(t => symbols[t] || '').join('');

        if (diff.difference !== 0) {
            const playerAdv = this.playerColor === 'w' ? diff.difference : -diff.difference;
            this.advantageDisplay.innerText = playerAdv > 0 ? `+${playerAdv}` : `${playerAdv}`;
            this.advantageDisplay.style.display = 'inline-block';
        } else {
            this.advantageDisplay.style.display = 'none';
        }
    }

    // =========================================================================
    // GAME REVIEW CONTROLLER
    // =========================================================================
    startReviewMode() {
        this.closeModal('resultModal');
        this.isReviewing = true;
        this.goToReviewStep(this.engine.moveHistory.length - 1);
    }

    goToReviewStep(idx) {
        if (!this.engine.moveHistory.length) return;
        this.isReviewing = true;
        const maxIdx = this.engine.moveHistory.length - 1;
        this.reviewIndex = Math.max(0, Math.min(maxIdx, idx));

        const targetFen = this.engine.moveHistory[this.reviewIndex].fen;
        this.engine.chess.load(targetFen);
        this.renderBoard();
        this.renderMovesList();
    }

    // =========================================================================
    // INTERACTIVE LESSONS CONTROLLER
    // =========================================================================
    startLessons(lessonIdx = 0) {
        this.currentMode = 'lesson';
        this.currentLessonIdx = lessonIdx;
        this.loadLesson(this.currentLessonIdx);
        this.openModal('lessonModal');
    }

    loadLesson(index) {
        const lesson = ChessLessonsData[index];
        if (!lesson) return;

        document.getElementById('lessonBadge').innerText = `Lesson ${lesson.id} of ${ChessLessonsData.length}`;
        document.getElementById('lessonTitle').innerText = lesson.title;
        document.getElementById('lessonDesc').innerText = lesson.desc;
        document.getElementById('lessonObjective').innerText = lesson.objective;
        document.getElementById('lessonFeedback').innerText = '';
        document.getElementById('lessonFeedback').className = 'rk-lesson-feedback';

        this.engine.loadFen(lesson.fen);
        this.playerColor = 'w';
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.renderBoard();
    }

    nextLesson() {
        if (this.currentLessonIdx < ChessLessonsData.length - 1) {
            this.currentLessonIdx++;
            this.loadLesson(this.currentLessonIdx);
        } else {
            alert('Congratulations! You have completed all 13 Royal Chess Lessons!');
            this.closeModal('lessonModal');
            this.openSetupModal();
        }
    }

    replayLesson() {
        this.loadLesson(this.currentLessonIdx);
    }

    showLessonHint() {
        const lesson = ChessLessonsData[this.currentLessonIdx];
        const fb = document.getElementById('lessonFeedback');
        fb.className = 'rk-lesson-feedback hint';
        fb.innerText = lesson.hint;
    }

    // Modal Helpers
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGameController();
});
