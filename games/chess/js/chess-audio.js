/**
 * Royal Kingdom Chess - Web Audio Synthesizer & Procedural Ambient Generator
 * Zero external audio files required. Realistic chess sounds & 6 realm ambient soundscapes.
 */

const ChessAudio = (function () {
    let ctx = null;
    let sfxVolume = 0.8;
    let ambientVolume = 0.35;
    let isAmbientEnabled = localStorage.getItem('rk_ambient_enabled') === 'true';
    let currentAmbientEnv = null;
    let ambientNodes = []; // active audio nodes for ambience
    let ambientInterval = null;

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

    // =========================================================================
    // AMBIENT SOUNDSCAPE SYNTHESIZERS (6 REALMS)
    // =========================================================================
    function stopAmbient() {
        if (ambientInterval) {
            clearInterval(ambientInterval);
            ambientInterval = null;
        }
        if (ambientNodes.length > 0) {
            try {
                const now = ctx ? ctx.currentTime : 0;
                ambientNodes.forEach(node => {
                    if (node.gain) {
                        node.gain.setValueAtTime(node.gain.value, now);
                        node.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
                    }
                    setTimeout(() => {
                        try {
                            if (node.stop) node.stop();
                            if (node.disconnect) node.disconnect();
                        } catch (e) {}
                    }, 550);
                });
            } catch (e) {}
            ambientNodes = [];
        }
    }

    function startAmbient(envId = 'royal') {
        currentAmbientEnv = envId;
        stopAmbient();

        if (isMuted() || !isAmbientEnabled) return;
        const c = getContext();
        if (!c) return;

        const now = c.currentTime;
        const masterGain = c.createGain();
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, ambientVolume), now + 1.2);
        masterGain.connect(c.destination);
        ambientNodes.push(masterGain);

        switch (envId) {
            case 'forest': {
                // Enchanted Forest: Soft breeze + periodic gentle bird/spore chirps
                const bufferSize = c.sampleRate * 2;
                const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.08;
                }
                const noise = c.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = c.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(380, now);

                noise.connect(filter);
                filter.connect(masterGain);
                noise.start(now);
                ambientNodes.push(noise, filter);

                // Periodic soft melodic chimes
                ambientInterval = setInterval(() => {
                    if (isMuted() || !isAmbientEnabled) return;
                    try {
                        const noteFreq = [880, 1046.5, 1174.6, 1318.5, 1567.9][Math.floor(Math.random() * 5)];
                        const chimeOsc = c.createOscillator();
                        const chimeGain = c.createGain();
                        chimeOsc.type = 'sine';
                        chimeOsc.frequency.setValueAtTime(noteFreq, c.currentTime);
                        chimeGain.gain.setValueAtTime(0.04 * ambientVolume, c.currentTime);
                        chimeGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
                        chimeOsc.connect(chimeGain);
                        chimeGain.connect(c.destination);
                        chimeOsc.start();
                        chimeOsc.stop(c.currentTime + 0.65);
                    } catch (e) {}
                }, 3500);
                break;
            }

            case 'frozen': {
                // Frozen Kingdom: Soft icy resonant wind
                const osc1 = c.createOscillator();
                const filter1 = c.createBiquadFilter();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(110, now);
                filter1.type = 'bandpass';
                filter1.frequency.setValueAtTime(450, now);
                filter1.Q.setValueAtTime(3.0, now);

                osc1.connect(filter1);
                filter1.connect(masterGain);
                osc1.start(now);
                ambientNodes.push(osc1, filter1);
                break;
            }

            case 'dragon': {
                // Dragon Realm: Low volcanic magma rumble
                const oscLava = c.createOscillator();
                const filterLava = c.createBiquadFilter();
                oscLava.type = 'sawtooth';
                oscLava.frequency.setValueAtTime(55, now);
                filterLava.type = 'lowpass';
                filterLava.frequency.setValueAtTime(90, now);

                oscLava.connect(filterLava);
                filterLava.connect(masterGain);
                oscLava.start(now);
                ambientNodes.push(oscLava, filterLava);
                break;
            }

            case 'celestial': {
                // Celestial Realm: Shimmering ethereal harmonic drone (fifths)
                const freqs = [146.83, 220.00, 293.66, 440.00];
                freqs.forEach((f, idx) => {
                    const osc = c.createOscillator();
                    const subGain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now);
                    subGain.gain.setValueAtTime(0.18 / (idx + 1), now);
                    osc.connect(subGain);
                    subGain.connect(masterGain);
                    osc.start(now);
                    ambientNodes.push(osc, subGain);
                });
                break;
            }

            case 'temple': {
                // Ancient Temple: Resonating singing bowl drone
                const oscBowl = c.createOscillator();
                const filterBowl = c.createBiquadFilter();
                oscBowl.type = 'sine';
                oscBowl.frequency.setValueAtTime(164.81, now);
                filterBowl.type = 'lowpass';
                filterBowl.frequency.setValueAtTime(280, now);

                oscBowl.connect(filterBowl);
                filterBowl.connect(masterGain);
                oscBowl.start(now);
                ambientNodes.push(oscBowl, filterBowl);
                break;
            }

            case 'royal':
            default: {
                // Royal Kingdom: Regal warm castle string warmth
                const osc1 = c.createOscillator();
                const osc2 = c.createOscillator();
                osc1.type = 'triangle';
                osc2.type = 'sine';
                osc1.frequency.setValueAtTime(130.81, now);
                osc2.frequency.setValueAtTime(196.00, now);
                osc1.connect(masterGain);
                osc2.connect(masterGain);
                osc1.start(now);
                osc2.start(now);
                ambientNodes.push(osc1, osc2);
                break;
            }
        }
    }

    return {
        isMuted: () => isMuted(),
        isAmbientEnabled: () => isAmbientEnabled,

        toggleAmbient: function () {
            isAmbientEnabled = !isAmbientEnabled;
            localStorage.setItem('rk_ambient_enabled', isAmbientEnabled);
            if (isAmbientEnabled) {
                startAmbient(currentAmbientEnv || 'royal');
            } else {
                stopAmbient();
            }
            return isAmbientEnabled;
        },

        setAmbientVolume: function (vol) {
            ambientVolume = Math.max(0, Math.min(1, parseFloat(vol) || 0.35));
            if (ambientNodes.length > 0 && ambientNodes[0] && ambientNodes[0].gain) {
                ambientNodes[0].gain.setValueAtTime(ambientVolume, ctx ? ctx.currentTime : 0);
            }
        },

        setSFXVolume: function (vol) {
            sfxVolume = Math.max(0, Math.min(1, parseFloat(vol) || 0.8));
        },

        startAmbient: function (envId) {
            startAmbient(envId);
        },

        stopAmbient: function () {
            stopAmbient();
        },

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

                gain.gain.setValueAtTime(0.08 * sfxVolume, now);
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

                const osc1 = c.createOscillator();
                const gain1 = c.createGain();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(196, now);
                osc1.frequency.exponentialRampToValueAtTime(98, now + 0.12);
                gain1.gain.setValueAtTime(0.25 * sfxVolume, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc1.connect(gain1);
                gain1.connect(c.destination);
                osc1.start(now);
                osc1.stop(now + 0.12);

                const osc2 = c.createOscillator();
                const gain2 = c.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(600, now);
                osc2.frequency.exponentialRampToValueAtTime(240, now + 0.04);
                gain2.gain.setValueAtTime(0.18 * sfxVolume, now);
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

                const osc1 = c.createOscillator();
                const gain1 = c.createGain();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(260, now);
                osc1.frequency.exponentialRampToValueAtTime(70, now + 0.18);
                gain1.gain.setValueAtTime(0.35 * sfxVolume, now);
                gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc1.connect(gain1);
                gain1.connect(c.destination);
                osc1.start(now);
                osc1.stop(now + 0.18);

                const osc2 = c.createOscillator();
                const gain2 = c.createGain();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(950, now);
                osc2.frequency.exponentialRampToValueAtTime(300, now + 0.08);
                gain2.gain.setValueAtTime(0.15 * sfxVolume, now);
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
                const freqs = [329.63, 392.00, 493.88];
                freqs.forEach((f, idx) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + idx * 0.02);
                    gain.gain.setValueAtTime(0.15 * sfxVolume, now + idx * 0.02);
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
                [164.81, 220.00, 329.63, 659.25].forEach((f, i) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now);
                    gain.gain.setValueAtTime((0.25 * sfxVolume) / (i + 1), now);
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
                    { f: 523.25, d: 0.12, t: 0.0 },
                    { f: 659.25, d: 0.12, t: 0.12 },
                    { f: 783.99, d: 0.15, t: 0.24 },
                    { f: 1046.50, d: 0.45, t: 0.40 }
                ];
                const now = c.currentTime;
                notes.forEach(n => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(n.f, now + n.t);
                    gain.gain.setValueAtTime(0.22 * sfxVolume, now + n.t);
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
                    { f: 293.66, d: 0.25, t: 0.0 },
                    { f: 261.63, d: 0.3, t: 0.25 },
                    { f: 220.00, d: 0.7, t: 0.55 }
                ];
                const now = c.currentTime;
                notes.forEach(n => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(n.f, now + n.t);
                    gain.gain.setValueAtTime(0.2 * sfxVolume, now + n.t);
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
                    gain.gain.setValueAtTime(0.2 * sfxVolume, now + idx * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + idx * 0.07);
                    osc.stop(now + idx * 0.07 + 0.32);
                });
            } catch (e) {}
        },

        // Mystical gentle chime for tactical hint
        playHint: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const notes = [659.25, 880, 1318.51]; // E5, A5, E6
                const now = c.currentTime;
                notes.forEach((freq, idx) => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.22 * sfxVolume, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.45);
                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.48);
                });
            } catch (e) {}
        },

        // Crisp UI click feedback
        playClick: function () {
            if (isMuted()) return;
            try {
                const c = getContext();
                if (!c) return;
                const osc = c.createOscillator();
                const gain = c.createGain();
                const now = c.currentTime;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(540, now);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
                gain.gain.setValueAtTime(0.12 * sfxVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(now);
                osc.stop(now + 0.05);
            } catch (e) {}
        }
    };
})();
