/**
 * Royal Kingdom Chess - Main UI Controller & Multi-Realm Coordinator
 * Orchestrates Engine, 3D/2D views, 6 Living Realms, Stockfish/Minimax AI with Humanized Cadence,
 * Clocks, Onboarding, Game Modes, Progression & Comprehensive Settings.
 */

class ChessGameController {
    constructor() {
        this.engine = new ChessEngine();
        this.progression = new ChessProgression();
        this.ai = new ChessAI();
        this.timer = new ChessTimer();

        // Game Configuration & State
        this.currentMode = 'ai'; // 'ai' | 'local' | 'practice' | 'lesson' | 'timed'
        this.playerColor = 'w';
        this.activeDifficulty = 'easy';
        this.is3D = true;
        this.currentMatchId = null;
        this.matchStartTime = null;
        this.isCompetitive = true;
        this.pendingPromotion = null;
        this.currentEnvironment = localStorage.getItem('rk_active_environment') || 'royal';
        this.activeHint = null;

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

        // Start ambient sound if enabled
        if (ChessAudio.isAmbientEnabled()) {
            ChessAudio.startAmbient(this.currentEnvironment);
        }
    }

    initDOMRefs() {
        this.viewport3DContainer = document.getElementById('viewport3D');
        this.viewport2DContainer = document.getElementById('viewport2D');
        this.statusBadge = document.getElementById('statusBadge');
        this.statusText = document.getElementById('statusText');
        this.statusSpinner = document.getElementById('statusSpinner');
        this.currentRealmBadge = document.getElementById('currentRealmBadge');

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
        this.modeModal = document.getElementById('modeModal');
        this.envModal = document.getElementById('envModal');
        this.setupModal = document.getElementById('setupModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.resultModal = document.getElementById('resultModal');
        this.unlockModal = document.getElementById('unlockModal');
        this.promotionModal = document.getElementById('promotionModal');
        this.lessonModal = document.getElementById('lessonModal');
    }

    initViewports() {
        // Initialize 3D Viewport with persistent realm
        try {
            this.view3D = new Chess3D(this.viewport3DContainer, (sq) => this.handleSquareClick(sq), this.currentEnvironment);
        } catch (e) {
            console.warn('3D initialization failed, defaulting to 2D view:', e);
            this.is3D = false;
        }

        // Initialize 2D Viewport
        this.view2D = new Chess2D(this.viewport2DContainer, (sq) => this.handleSquareClick(sq));
        this.updateViewVisibility();
        this.updateRealmBadge();
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

    updateRealmBadge() {
        if (this.currentRealmBadge && Chess3D.REALMS[this.currentEnvironment]) {
            this.currentRealmBadge.innerText = Chess3D.REALMS[this.currentEnvironment].name;
        }
    }

    // =========================================================================
    // ENVIRONMENT SELECTION (6 LIVING 3D REALMS)
    // =========================================================================
    openEnvironmentModal() {
        this.renderEnvironmentCards();
        this.openModal('envModal');
    }

    renderEnvironmentCards() {
        const grid = document.getElementById('envCardsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const realms = Object.values(Chess3D.REALMS);
        realms.forEach(realm => {
            const isSelected = (realm.id === this.currentEnvironment);
            const card = document.createElement('div');
            card.className = `rk-env-card ${isSelected ? 'selected' : ''}`;
            card.onclick = () => this.selectEnvironment(realm.id);

            // Realm icons & gradient art
            let iconClass = 'fa-crown';
            let gradientCss = 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(76, 29, 149, 0.3))';

            switch (realm.id) {
                case 'forest':
                    iconClass = 'fa-tree';
                    gradientCss = 'linear-gradient(135deg, rgba(34, 139, 34, 0.3), rgba(18, 50, 24, 0.6))';
                    break;
                case 'frozen':
                    iconClass = 'fa-snowflake';
                    gradientCss = 'linear-gradient(135deg, rgba(0, 191, 255, 0.3), rgba(20, 36, 68, 0.6))';
                    break;
                case 'dragon':
                    iconClass = 'fa-dragon';
                    gradientCss = 'linear-gradient(135deg, rgba(255, 69, 0, 0.3), rgba(40, 10, 10, 0.7))';
                    break;
                case 'celestial':
                    iconClass = 'fa-star-and-crescent';
                    gradientCss = 'linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(16, 12, 38, 0.7))';
                    break;
                case 'temple':
                    iconClass = 'fa-archway';
                    gradientCss = 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(46, 30, 18, 0.7))';
                    break;
            }

            card.innerHTML = `
                <div class="rk-env-thumb" style="background: ${gradientCss};">
                    <i class="fas ${iconClass}"></i>
                    ${isSelected ? '<span class="rk-env-active-badge"><i class="fas fa-check"></i> Active</span>' : ''}
                </div>
                <div class="rk-env-body">
                    <h4 class="rk-env-title">${realm.name}</h4>
                    <p class="rk-env-desc">${this.getRealmDescription(realm.id)}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    getRealmDescription(envId) {
        switch (envId) {
            case 'forest':
                return 'Sunlit canopy, woodland pines, gentle leaf particles, and antique birch board.';
            case 'frozen':
                return 'Snowy fortress, frosted ice battlements, falling snow, and arctic crystal board.';
            case 'dragon':
                return 'Volcanic mountain fortress, rising fire embers, and glowing lava basalt board.';
            case 'celestial':
                return 'Cosmic nebulae, floating orbit rings, stardust particles, and lapis lazuli board.';
            case 'temple':
                return 'Ancient stone pillars, warm oil lanterns, incense dust, and carved limestone board.';
            case 'royal':
            default:
                return 'Regal stone castle, grand candlelight, floating gold dust, and alabaster marble board.';
        }
    }

    selectEnvironment(envId) {
        if (!Chess3D.REALMS[envId]) return;
        this.currentEnvironment = envId;
        localStorage.setItem('rk_active_environment', envId);

        if (this.is3D && this.view3D) {
            this.view3D.setEnvironment(envId);
        }
        if (ChessAudio.isAmbientEnabled()) {
            ChessAudio.startAmbient(envId);
        }

        this.updateRealmBadge();
        this.renderEnvironmentCards();
        this.closeModal('envModal');
    }

    // =========================================================================
    // GAME MODE SELECTION MODAL
    // =========================================================================
    openGameModeModal() {
        this.openModal('modeModal');
    }

    selectGameMode(mode) {
        this.closeModal('modeModal');
        this.currentMode = mode;

        if (mode === 'lesson') {
            this.startLessons(0);
        } else if (mode === 'timed') {
            document.querySelector('input[name="gameMode"][value="ai"]').checked = true;
            document.getElementById('timePresetSelect').value = '5';
            this.openSetupModal();
        } else {
            const radio = document.querySelector(`input[name="gameMode"][value="${mode}"]`);
            if (radio) radio.checked = true;
            this.openSetupModal();
        }
    }

    // =========================================================================
    // COMPREHENSIVE SETTINGS MODAL
    // =========================================================================
    openSettingsModal() {
        const qualitySelect = document.getElementById('settingQuality');
        if (qualitySelect) qualitySelect.value = this.view3D ? this.view3D.graphicsQuality : 'high';

        const speedSelect = document.getElementById('settingAISpeed');
        if (speedSelect) speedSelect.value = this.ai.getResponseSpeed();

        const ambientCheck = document.getElementById('settingAmbientToggle');
        if (ambientCheck) ambientCheck.checked = ChessAudio.isAmbientEnabled();

        this.openModal('settingsModal');
    }

    saveSettings() {
        const quality = document.getElementById('settingQuality')?.value || 'high';
        if (this.view3D) this.view3D.setQuality(quality);

        const speed = document.getElementById('settingAISpeed')?.value || 'natural';
        this.ai.setResponseSpeed(speed);

        const isAmbient = document.getElementById('settingAmbientToggle')?.checked;
        if (isAmbient !== ChessAudio.isAmbientEnabled()) {
            ChessAudio.toggleAmbient();
            if (isAmbient) ChessAudio.startAmbient(this.currentEnvironment);
            else ChessAudio.stopAmbient();
        }

        const ambVol = document.getElementById('settingAmbientVol')?.value || 0.35;
        ChessAudio.setAmbientVolume(ambVol);

        const sfxVol = document.getElementById('settingSFXVol')?.value || 0.8;
        ChessAudio.setSFXVolume(sfxVol);

        this.closeModal('settingsModal');
    }

    // =========================================================================
    // TIMERS & HUMANIZED AI CADENCE
    // =========================================================================
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
                if (this.statusSpinner) this.statusSpinner.style.display = 'inline-block';
            } else {
                if (this.statusSpinner) this.statusSpinner.style.display = 'none';
                this.updateTurnStatus();
            }
        });

        this.ai.setThinkingStepListener((stepMsg) => {
            this.statusText.innerText = stepMsg;
        });
    }

    bindEvents() {
        document.getElementById('viewToggleBtn')?.addEventListener('click', () => this.toggle2D3D());

        document.getElementById('topDownBtn')?.addEventListener('click', () => {
            if (this.is3D && this.view3D) {
                const isTD = this.view3D.toggleTopDown();
                document.getElementById('topDownBtn').classList.toggle('active', isTD);
            }
        });

        document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());

        // Modal Close on Escape Key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Quick Side Panel Toolbar Buttons (Reliable Direct Access)
        document.getElementById('btnSideNewMatch')?.addEventListener('click', () => this.openSetupModal());
        document.getElementById('btnSideRealm')?.addEventListener('click', () => this.openEnvironmentModal());
        document.getElementById('btnSideModes')?.addEventListener('click', () => this.openGameModeModal());
        document.getElementById('btnSideLearn')?.addEventListener('click', () => this.startLessons(0));
        document.getElementById('btnSideSettings')?.addEventListener('click', () => this.openSettingsModal());

        // Side Panel Game Action Grid
        document.getElementById('btnSideHint')?.addEventListener('click', () => this.suggestHint());
        document.getElementById('btnSideUndo')?.addEventListener('click', () => this.undoMove());
        document.getElementById('btnSideDraw')?.addEventListener('click', () => this.offerDraw());
        document.getElementById('btnSideResign')?.addEventListener('click', () => this.resign());

        // Top Arcade Header Navigation Buttons
        document.getElementById('btnHeaderRealm')?.addEventListener('click', () => this.openEnvironmentModal());
        document.getElementById('btnHeaderModes')?.addEventListener('click', () => this.openGameModeModal());
        document.getElementById('btnHeaderSettings')?.addEventListener('click', () => this.openSettingsModal());
        document.getElementById('btnHeaderLearn')?.addEventListener('click', () => this.startLessons(0));

        document.querySelectorAll('.rk-promo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pieceType = btn.dataset.piece;
                this.completePromotion(pieceType);
            });
        });

        document.getElementById('ladderContainer')?.addEventListener('click', (e) => {
            const item = e.target.closest('.rk-ladder-item');
            if (item && !item.classList.contains('locked')) {
                document.querySelectorAll('.rk-ladder-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                this.activeDifficulty = item.dataset.level;
            }
        });

        document.getElementById('reviewStart')?.addEventListener('click', () => this.goToReviewStep(0));
        document.getElementById('reviewPrev')?.addEventListener('click', () => this.goToReviewStep(this.reviewIndex - 1));
        document.getElementById('reviewNext')?.addEventListener('click', () => this.goToReviewStep(this.reviewIndex + 1));
        document.getElementById('reviewEnd')?.addEventListener('click', () => this.goToReviewStep(this.engine.moveHistory.length - 1));
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
            this.startLessons(0);
        } else {
            this.openSetupModal();
        }
    }

    openSetupModal() {
        this.renderSetupRealms();
        this.renderDifficultyLadder();
        this.openModal('setupModal');
    }

    renderSetupRealms() {
        const grid = document.getElementById('setupRealmsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        const realms = Object.values(Chess3D.REALMS);
        realms.forEach(realm => {
            const isSelected = (realm.id === this.currentEnvironment);
            const card = document.createElement('div');
            card.className = `rk-setup-realm-card ${isSelected ? 'selected' : ''}`;
            card.dataset.realmId = realm.id;

            let iconClass = 'fa-crown';
            switch (realm.id) {
                case 'forest': iconClass = 'fa-tree'; break;
                case 'frozen': iconClass = 'fa-snowflake'; break;
                case 'dragon': iconClass = 'fa-dragon'; break;
                case 'celestial': iconClass = 'fa-star-and-crescent'; break;
                case 'temple': iconClass = 'fa-archway'; break;
            }

            card.innerHTML = `
                <div class="realm-icon"><i class="fas ${iconClass}"></i></div>
                <div class="realm-name">${realm.name}</div>
                ${isSelected ? '<div class="realm-status"><i class="fas fa-check"></i> Active</div>' : ''}
            `;

            card.addEventListener('click', () => {
                this.selectEnvironment(realm.id);
                document.querySelectorAll('.rk-setup-realm-card').forEach(el => {
                    const sel = (el.dataset.realmId === realm.id);
                    el.classList.toggle('selected', sel);
                    const statusEl = el.querySelector('.realm-status');
                    if (statusEl) statusEl.remove();
                    if (sel) {
                        const st = document.createElement('div');
                        st.className = 'realm-status';
                        st.innerHTML = '<i class="fas fa-check"></i> Active';
                        el.appendChild(st);
                    }
                });
                const nameDisplay = document.getElementById('setupRealmActiveName');
                if (nameDisplay) nameDisplay.innerText = realm.name;
            });

            grid.appendChild(card);
        });

        const nameDisplay = document.getElementById('setupRealmActiveName');
        if (nameDisplay && Chess3D.REALMS[this.currentEnvironment]) {
            nameDisplay.innerText = Chess3D.REALMS[this.currentEnvironment].name;
        }
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
        this.isCompetitive = (mode === 'ai');
        this.currentMatchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        this.matchStartTime = Date.now();
        this.isReviewing = false;

        let minutes = 0;
        let increment = 0;
        switch (timePreset) {
            case '1': minutes = 1; increment = 0; break;
            case '3': minutes = 3; increment = 2; break;
            case '5': minutes = 5; increment = 3; break;
            case '10': minutes = 10; increment = 5; break;
            case '15': minutes = 15; increment = 10; break;
            case 'custom':
                minutes = parseFloat(document.getElementById('customMinutesInput')?.value) || 5;
                increment = parseInt(document.getElementById('customIncrementInput')?.value, 10) || 0;
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

        if (this.view3D) this.view3D.setOrientation(this.playerColor);
        this.view2D.setOrientation(this.playerColor);

        this.updateHUDPlayers();
        this.renderMovesList();
        this.renderBoard();
        this.updateTurnStatus();

        this.timer.start('w');

        if (this.currentMode === 'ai' && this.playerColor === 'b') {
            this.triggerAIMove();
        }
    }

    updateHUDPlayers() {
        if (this.currentMode === 'ai') {
            const profile = this.ai.difficultyProfiles[this.activeDifficulty] || { name: 'Normal' };
            if (this.playerColor === 'w') {
                this.nameBottom.innerText = 'You (White)';
                this.subBottom.innerText = 'Realm Challenger';
                this.nameTop.innerText = `Royal AI (${profile.name})`;
                this.subTop.innerText = 'Stockfish Engine';
            } else {
                this.nameBottom.innerText = 'You (Black)';
                this.subBottom.innerText = 'Realm Challenger';
                this.nameTop.innerText = `Royal AI (${profile.name})`;
                this.subTop.innerText = 'Stockfish Engine';
            }
        } else if (this.currentMode === 'local') {
            this.nameBottom.innerText = 'White Player';
            this.subBottom.innerText = 'Local Defender';
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
        this.activeHint = null;
        const banner = document.getElementById('hintBanner');
        if (banner) banner.style.display = 'none';

        const currentTurn = this.engine.turn();

        if (this.currentMode === 'ai' && currentTurn !== this.playerColor) {
            return;
        }

        if (this.selectedSquare === square) {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.renderBoard();
            return;
        }

        const moveAttempt = this.legalMoves.find(m => m.to === square);
        if (moveAttempt) {
            if (moveAttempt.flags.includes('p') || (moveAttempt.piece === 'p' && (square[1] === '8' || square[1] === '1'))) {
                this.pendingPromotion = { from: this.selectedSquare, to: square };
                this.openModal('promotionModal');
                return;
            }

            this.executePlayerMove(this.selectedSquare, square);
            return;
        }

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

        const overStatus = this.engine.isGameOver();
        if (overStatus.isOver) {
            this.handleGameOver(overStatus.result, overStatus.reason);
            return;
        }

        if (this.currentMode === 'local' && document.getElementById('settingAutoRotate')?.checked) {
            const nextTurn = this.engine.turn();
            if (this.view3D) this.view3D.setOrientation(nextTurn);
            this.view2D.setOrientation(nextTurn);
        }

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
            modalTitle = 'VICTORIOUS REALM!';
            modalDesc = `Superb tactical triumph! Opponent fell to ${reason.replace('_', ' ')}.`;
            crestClass = 'fa-trophy';
            ChessAudio.playVictory();
        } else if (isLoss) {
            modalTitle = 'THE REALM HAS FALLEN';
            modalDesc = `Defeated by ${reason.replace('_', ' ')}. Reflect on the battlefield and strike back!`;
            crestClass = 'fa-skull';
            ChessAudio.playDefeat();
        } else {
            modalTitle = 'ROYAL STALEMATE';
            modalDesc = `The battle ended in a peaceful draw (${reason.replace('_', ' ')}).`;
            crestClass = 'fa-handshake';
        }

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
                ChessAudio.playUnlock();
                document.getElementById('unlockTierName').innerText = outcome.newlyUnlockedLevel.name;
                this.openModal('unlockModal');
            }
        }

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
            this.engine.undo();
            this.engine.undo();
        } else {
            this.engine.undo();
        }
        this.isCompetitive = false;
        this.lastMove = null;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.renderBoard();
        this.renderMovesList();
        this.updateTurnStatus();
        this.updateCapturedAndAdvantage();
    }

    async suggestHint() {
        if (this.engine.isGameOver().isOver) {
            this.showHintBanner("The match has already concluded! Click 'New Match' to begin again.", false);
            return;
        }

        const currentTurn = this.engine.turn();
        if (this.currentMode === 'ai' && currentTurn !== this.playerColor) {
            this.showHintBanner("Royal AI is currently calculating its move...", false);
            return;
        }

        const hint = await this.ai.getFastHint(this.engine);
        if (!hint) {
            this.showHintBanner("No legal moves available in this position.", false);
            return;
        }

        this.activeHint = { from: hint.from, to: hint.to };
        this.selectedSquare = hint.from;
        this.legalMoves = [{ to: hint.to, flags: '', captured: this.engine.getPieceAt(hint.to) }];
        this.renderBoard();

        const pieceNames = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
        const pObj = this.engine.getPieceAt(hint.from);
        const pName = pObj ? pieceNames[pObj.type] : 'Piece';

        ChessAudio.playHint();
        this.showHintBanner(`Move ${pName} from ${hint.from.toUpperCase()} to ${hint.to.toUpperCase()} (${hint.explanation})`, true);
        this.statusText.innerText = `💡 Hint: ${pName} ${hint.from.toUpperCase()} → ${hint.to.toUpperCase()}`;
    }

    showHintBanner(msg, isSuccess = true) {
        const banner = document.getElementById('hintBanner');
        const text = document.getElementById('hintBannerText');
        if (banner && text) {
            text.innerText = msg;
            banner.style.display = 'flex';
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
            checkSquare,
            hint: this.activeHint
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

    openModal(id) {
        this.closeAllModals();
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            ChessAudio.playClick();
        }
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.rk-modal-backdrop').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    handleBackdropClick(e) {
        if (e && e.target && e.target.classList.contains('rk-modal-backdrop')) {
            e.target.classList.remove('active');
        }
    }
}

// Global safety proxies for resilient button handling
window.openChessModal = function(id) {
    if (window.chessGame) {
        window.chessGame.openModal(id);
    } else {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    }
};

window.closeChessModal = function(id) {
    if (window.chessGame) {
        window.chessGame.closeModal(id);
    } else {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGameController();
});
