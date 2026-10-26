/**
 * VG-ARCADE CORE SYSTEM
 * Lightweight, zero-dependency audio synthesizer, particle engine, and state management.
 * Designed & Built by Vaishnav Gupta (vaishnav.py@outlook.com)
 */

// --- 1. WEB AUDIO SYNTHESIZER ---
const ArcadeAudio = (function () {
    let ctx = null;
    let isMuted = localStorage.getItem('arcade_audio_muted') === 'true';

    function getContext() {
        if (!ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                ctx = new AudioContext();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    // Auto-resume audio on first user touch/click/key
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

    function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.25, pitchDrop = 0) {
        if (isMuted) return;
        try {
            const audioCtx = getContext();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            const now = audioCtx.currentTime;

            osc.frequency.setValueAtTime(freq, now);
            if (pitchDrop !== 0) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + pitchDrop), now + duration);
            }

            gain.gain.setValueAtTime(gainVal, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Audio context not allowed or unsupported
        }
    }

    return {
        isMuted: () => isMuted,

        toggleMute: function () {
            isMuted = !isMuted;
            localStorage.setItem('arcade_audio_muted', isMuted);
            ArcadeAudio.updateUI();
            if (!isMuted) {
                ArcadeAudio.playClick();
            }
            return isMuted;
        },

        updateUI: function () {
            const btns = document.querySelectorAll('.arcade-sound-btn');
            btns.forEach(btn => {
                const icon = btn.querySelector('i');
                if (isMuted) {
                    btn.classList.add('muted');
                    btn.setAttribute('title', 'Unmute Sound');
                    btn.setAttribute('aria-label', 'Unmute Sound');
                    if (icon) {
                        icon.className = 'fas fa-volume-mute';
                    }
                } else {
                    btn.classList.remove('muted');
                    btn.setAttribute('title', 'Mute Sound');
                    btn.setAttribute('aria-label', 'Mute Sound');
                    if (icon) {
                        icon.className = 'fas fa-volume-up';
                    }
                }
            });
        },

        playMove: function () {
            playTone(320, 'sine', 0.05, 0.15);
        },

        playEat: function () {
            // Cheerful retro 2-tone pickup
            playTone(523.25, 'triangle', 0.08, 0.25);
            setTimeout(() => playTone(659.25, 'square', 0.12, 0.2), 60);
        },

        playBonus: function () {
            // 3-tone shiny bonus
            playTone(587.33, 'triangle', 0.08, 0.25);
            setTimeout(() => playTone(783.99, 'triangle', 0.08, 0.25), 80);
            setTimeout(() => playTone(1046.50, 'square', 0.2, 0.22), 160);
        },

        playFlip: function () {
            // Rising swoop whoosh
            playTone(220, 'sine', 0.22, 0.2, 280);
        },

        playLand: function () {
            // Low thud landing
            playTone(140, 'triangle', 0.12, 0.35, -80);
        },

        playBounce: function () {
            // Paddle bounce
            playTone(440, 'sine', 0.06, 0.2, 80);
        },

        playBrickBreak: function (combo = 1) {
            // Higher pitch per combo
            const baseFreq = 480 + Math.min(combo * 40, 600);
            playTone(baseFreq, 'square', 0.08, 0.22, -100);
        },

        playPowerup: function () {
            playTone(392.00, 'sine', 0.08, 0.25);
            setTimeout(() => playTone(523.25, 'sine', 0.08, 0.25), 70);
            setTimeout(() => playTone(659.25, 'triangle', 0.08, 0.25), 140);
            setTimeout(() => playTone(783.99, 'square', 0.18, 0.25), 210);
        },

        playWin: function () {
            // Celebratory fanfare
            playTone(523.25, 'triangle', 0.12, 0.3);
            setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.3), 120);
            setTimeout(() => playTone(783.99, 'triangle', 0.12, 0.3), 240);
            setTimeout(() => playTone(1046.50, 'square', 0.4, 0.35), 360);
        },

        playGameOver: function () {
            // Descending game over sound
            playTone(330, 'sawtooth', 0.15, 0.25, -60);
            setTimeout(() => playTone(277, 'sawtooth', 0.15, 0.25, -60), 150);
            setTimeout(() => playTone(220, 'sawtooth', 0.18, 0.25, -60), 300);
            setTimeout(() => playTone(164.8, 'sawtooth', 0.35, 0.3, -80), 450);
        },

        playError: function () {
            playTone(180, 'sawtooth', 0.12, 0.25);
            setTimeout(() => playTone(140, 'sawtooth', 0.16, 0.25), 100);
        },

        playClick: function () {
            playTone(600, 'sine', 0.04, 0.12);
        }
    };
})();

// Auto-init UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ArcadeAudio.updateUI();
});


// --- 2. PERSISTENT LOCAL STORAGE HELPER ---
const ArcadeStorage = {
    getHighScore: function (gameKey, defaultVal = 0) {
        const val = localStorage.getItem(`arcade_hs_${gameKey}`);
        return val !== null ? parseInt(val, 10) : defaultVal;
    },

    setHighScore: function (gameKey, newScore) {
        const current = ArcadeStorage.getHighScore(gameKey);
        if (newScore > current) {
            localStorage.setItem(`arcade_hs_${gameKey}`, newScore);
            return true; // New record!
        }
        return false;
    },

    getFavorites: function () {
        try {
            return JSON.parse(localStorage.getItem('arcade_favorites')) || [];
        } catch (e) {
            return [];
        }
    },

    toggleFavorite: function (gameId) {
        let favs = ArcadeStorage.getFavorites();
        const index = favs.indexOf(gameId);
        if (index >= 0) {
            favs.splice(index, 1);
        } else {
            favs.push(gameId);
        }
        localStorage.setItem('arcade_favorites', JSON.stringify(favs));
        return favs.includes(gameId);
    },

    isFavorite: function (gameId) {
        return ArcadeStorage.getFavorites().includes(gameId);
    },

    recordPlay: function (gameId) {
        try {
            let recents = JSON.parse(localStorage.getItem('arcade_recents')) || [];
            recents = recents.filter(id => id !== gameId);
            recents.unshift(gameId);
            if (recents.length > 6) recents.pop();
            localStorage.setItem('arcade_recents', JSON.stringify(recents));
        } catch (e) { }
    }
};


// --- 3. PARTICLE & CELEBRATION ENGINE ---
const ArcadeFX = {
    burst: function (x, y, count = 24, colors = ['#00f0ff', '#ff007f', '#ffd700', '#00ff88']) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '99999';
        document.body.appendChild(container);

        const particles = [];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            p.style.position = 'absolute';
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            p.style.backgroundColor = color;
            p.style.boxShadow = `0 0 10px ${color}`;
            p.style.transform = 'translate(-50%, -50%)';
            p.style.opacity = '1';
            container.appendChild(p);

            particles.push({ el: p, x, y, vx, vy, life: 1, decay: Math.random() * 0.025 + 0.015 });
        }

        function animate() {
            let active = false;
            particles.forEach(p => {
                if (p.life > 0) {
                    active = true;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.15; // gravity
                    p.vx *= 0.98; // friction
                    p.life -= p.decay;
                    p.el.style.left = `${p.x}px`;
                    p.el.style.top = `${p.y}px`;
                    p.el.style.opacity = Math.max(0, p.life);
                    p.el.style.transform = `translate(-50%, -50%) scale(${p.life})`;
                }
            });

            if (active) {
                requestAnimationFrame(animate);
            } else {
                container.remove();
            }
        }
        requestAnimationFrame(animate);
    },

    confetti: function () {
        const colors = ['#ff007f', '#00f0ff', '#ffd700', '#7928ca', '#00ff88', '#ff4d4d'];
        const width = window.innerWidth;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                ArcadeFX.burst(width * (0.2 + i * 0.3), window.innerHeight * 0.3, 30, colors);
            }, i * 200);
        }
    }
};
