/**
 * Royal Kingdom Chess - Web Audio Synthesizer
 * Zero external audio files required. Rich, medieval synthesized sounds.
 */

const ChessAudio = (function () {
    let ctx = null;

    function getContext() {
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                ctx = new AudioCtx();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    function isMuted() {
        if (window.ArcadeAudio && typeof ArcadeAudio.isMuted === 'function') {
            return ArcadeAudio.isMuted();
        }
        return localStorage.getItem('arcade_audio_muted') === 'true';
    }

    function unlockAudio() {
        const c = getContext();
        if (c && c.state === 'suspended') {
            c.resume();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    }
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return {
        // Subtle click on selecting a piece
        playSelect: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const osc = c.createOscillator();
                const gain = c.createGain();
                const now = c.currentTime;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } catch (e) {}
        },

        // Wooden thud of placing a chess piece on wood/marble
        playMove: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const now = c.currentTime;

                // Body resonator
                const osc1 = c.createOscillator();
                const gain1 = c.createGain();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(196, now);
                osc1.frequency.exponentialRampToValueAtTime(98, now + 0.12);
                gain1.gain.setValueAtTime(0.25, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc1.connect(gain1);
                gain1.connect(c.destination);
                osc1.start(now);
                osc1.stop(now + 0.12);

                // Wood click impact
                const osc2 = c.createOscillator();
                const gain2 = c.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(600, now);
                osc2.frequency.exponentialRampToValueAtTime(240, now + 0.03);
                gain2.gain.setValueAtTime(0.18, now);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc2.connect(gain2);
                gain2.connect(c.destination);
                osc2.start(now);
                osc2.stop(now + 0.04);
            } catch (e) {}
        },

        // Crisp impact of capturing a piece
        playCapture: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const now = c.currentTime;

                // Low strike
                const osc1 = c.createOscillator();
                const gain1 = c.createGain();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(260, now);
                osc1.frequency.exponentialRampToValueAtTime(70, now + 0.18);
                gain1.gain.setValueAtTime(0.35, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc1.connect(gain1);
                gain1.connect(c.destination);
                osc1.start(now);
                osc1.stop(now + 0.18);

                // Metallic snap
                const osc2 = c.createOscillator();
                const gain2 = c.createGain();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(950, now);
                osc2.frequency.exponentialRampToValueAtTime(300, now + 0.08);
                gain2.gain.setValueAtTime(0.15, now);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc2.connect(gain2);
                gain2.connect(c.destination);
                osc2.start(now);
                osc2.stop(now + 0.08);
            } catch (e) {}
        },

        // Dramatic royal chord for Check
        playCheck: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const now = c.currentTime;

                const freqs = [329.63, 392.00, 493.88]; // E minor chord
                freqs.forEach((f, idx) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + idx * 0.02);
                    gain.gain.setValueAtTime(0.15, now + idx * 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + idx * 0.02);
                    osc.stop(now + 0.36);
                });
            } catch (e) {}
        },

        // Grand checkmate bell / fanfare
        playCheckmate: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const now = c.currentTime;

                // Deep bell resonance
                [164.81, 220.00, 329.63, 659.25].forEach((f, i) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now);
                    gain.gain.setValueAtTime(0.25 / (i + 1), now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now);
                    osc.stop(now + 1.25);
                });
            } catch (e) {}
        },

        // Victorious royal fanfare
        playVictory: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const notes = [
                    { f: 523.25, d: 0.12, t: 0.0 }, // C5
                    { f: 659.25, d: 0.12, t: 0.12 }, // E5
                    { f: 783.99, d: 0.15, t: 0.24 }, // G5
                    { f: 1046.50, d: 0.45, t: 0.40 } // C6
                ];
                const now = c.currentTime;
                notes.forEach(n => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(n.f, now + n.t);
                    gain.gain.setValueAtTime(0.22, now + n.t);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + n.t);
                    osc.stop(now + n.t + n.d);
                });
            } catch (e) {}
        },

        // Low somber cadence for Defeat
        playDefeat: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const notes = [
                    { f: 293.66, d: 0.25, t: 0.0 }, // D4
                    { f: 261.63, d: 0.3, t: 0.25 },  // C4
                    { f: 220.00, d: 0.7, t: 0.55 }   // A3
                ];
                const now = c.currentTime;
                notes.forEach(n => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(n.f, now + n.t);
                    gain.gain.setValueAtTime(0.2, now + n.t);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + n.t);
                    osc.stop(now + n.t + n.d);
                });
            } catch (e) {}
        },

        // Golden ascending arpeggio for unlocking a new difficulty level
        playUnlock: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
                const now = c.currentTime;
                arpeggio.forEach((freq, idx) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                    gain.gain.setValueAtTime(0.2, now + idx * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + idx * 0.07);
                    osc.stop(now + idx * 0.07 + 0.32);
                });
            } catch (e) {}
        }
    };
})();
