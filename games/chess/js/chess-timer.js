/**
 * Royal Kingdom Chess - High-Precision Monotonic Game Clocks
 * Employs performance.now() timestamps for zero drift and accurate timeout adjudication.
 */

class ChessTimer {
    constructor() {
        this.timeLimitSeconds = 0; // 0 = unlimited / casual
        this.incrementSeconds = 0;
        this.remainingMs = { w: 0, b: 0 };
        this.activeColor = null;
        this.turnStartTime = null;
        this.isPaused = true;
        this.intervalId = null;

        this.onTickCallback = null;
        this.onTimeoutCallback = null;
    }

    setListeners({ onTick, onTimeout }) {
        this.onTickCallback = onTick;
        this.onTimeoutCallback = onTimeout;
    }

    // Configure clocks before a match
    configure({ minutes = 0, increment = 0 }) {
        const validatedMinutes = Math.max(0, Math.min(180, parseFloat(minutes) || 0));
        const validatedIncrement = Math.max(0, Math.min(60, parseInt(increment, 10) || 0));

        this.timeLimitSeconds = validatedMinutes * 60;
        this.incrementSeconds = validatedIncrement;

        this.remainingMs = {
            w: this.timeLimitSeconds * 1000,
            b: this.timeLimitSeconds * 1000
        };

        this.activeColor = null;
        this.turnStartTime = null;
        this.isPaused = true;
        this.stopInterval();
        this.emitTick();
    }

    isTimed() {
        return this.timeLimitSeconds > 0;
    }

    start(initialTurn = 'w') {
        if (!this.isTimed()) return;

        this.activeColor = initialTurn;
        this.turnStartTime = performance.now();
        this.isPaused = false;
        this.startInterval();
    }

    pause() {
        if (this.isPaused || !this.isTimed()) return;

        // Apply elapsed time before pausing
        this.applyElapsed();
        this.isPaused = true;
        this.stopInterval();
        this.emitTick();
    }

    resume() {
        if (!this.isPaused || !this.isTimed() || !this.activeColor) return;

        this.turnStartTime = performance.now();
        this.isPaused = false;
        this.startInterval();
    }

    // Called whenever a legal move is completed
    switchTurn(nextColor) {
        if (!this.isTimed()) return;

        if (this.activeColor && !this.isPaused) {
            this.applyElapsed();
            // Apply increment to player who just finished their move
            this.remainingMs[this.activeColor] += this.incrementSeconds * 1000;
        }

        this.activeColor = nextColor;
        this.turnStartTime = performance.now();
        this.emitTick();
    }

    applyElapsed() {
        if (!this.activeColor || this.turnStartTime === null) return;

        const now = performance.now();
        const elapsed = now - this.turnStartTime;
        this.remainingMs[this.activeColor] = Math.max(0, this.remainingMs[this.activeColor] - elapsed);
        this.turnStartTime = now;

        if (this.remainingMs[this.activeColor] <= 0) {
            this.stopInterval();
            this.isPaused = true;
            if (typeof this.onTimeoutCallback === 'function') {
                this.onTimeoutCallback(this.activeColor);
            }
        }
    }

    startInterval() {
        this.stopInterval();
        this.intervalId = setInterval(() => {
            if (!this.isPaused && this.activeColor) {
                this.applyElapsed();
                this.emitTick();
            }
        }, 100);
    }

    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    emitTick() {
        if (typeof this.onTickCallback === 'function') {
            this.onTickCallback({
                w: this.formatTime(this.remainingMs.w),
                b: this.formatTime(this.remainingMs.b),
                rawMs: { ...this.remainingMs },
                activeColor: this.activeColor,
                isTimed: this.isTimed()
            });
        }
    }

    formatTime(ms) {
        if (!this.isTimed()) return '∞';
        const totalSec = Math.max(0, Math.ceil(ms / 1000));
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    destroy() {
        this.stopInterval();
    }
}
