# 🕹️ Arcade Zone | Modern Indie Web Gaming Platform

An interactive retro-modern web arcade featuring four distinct games engineered entirely with vanilla **JavaScript (ES6+)**, **HTML5 Canvas**, **CSS3**, and synthesized **Web Audio API**. Zero external game engines or heavy frameworks — pure web physics, custom vector graphics, and responsive arcade design.

![Arcade Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_HTML5_Canvas_|_Web_Audio-blue?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

---

## 🎮 Playable Games Collection

### 1. 🐍 Cyber Snake Pro (`games/snake/`)
- **Visual Identity**: High-contrast cyber grid with pulsating neon coils, glowing energy cores, and animated expressive snake eyes that glance toward travel direction.
- **Game Logic Architecture**:
  - Input buffer queue preventing 180° instant suicide turns during rapid double-key inputs.
  - Three difficulty presets: Casual (wall-wrapping), Classic Arcade (accelerating speed), and Cyber Rush (2x multiplier).
  - Rare timed Golden Star bonuses for high-score hunters.
- **Controls**: Arrow Keys / WASD, Space to Pause, touch swipe gestures, and tactile on-screen D-Pad.

### 2. 🍾 Bottle Flip Pro (`games/bottle/`)
- **Visual Identity**: 2.5D glossy bottle with specular highlights, dynamic liquid simulation, and stadium crowd spotlight ambiance.
- **Physics Engine**:
  - Internal fluid dynamics simulation: liquid sloshes and tilts based on angular velocity and gravity springs.
  - Rotational torque and jump impulse calculated from power gauge sweet-spot timing.
  - Upright tolerance evaluation with streak multipliers (1x -> 10x) and perfect landing center bonuses.
- **Modes**: Standard Stage and Moving Platform Challenge.

### 3. 🗺️ Treasure Quest Adventure (`games/treasure/`)
- **Visual Identity**: Aged riddle parchment, antique brass compass, and 10 detailed mystery rooms with custom vector artifact illustrations (no generic emoji icons!).
- **Investigation Gameplay**:
  - 10 distinct rooms (Living Room, Bedroom, Kitchen, Bathroom, Study, Balcony, Classroom, Supermarket, City Park, Emperor's Vault) with 5 clues each.
  - Interactive item examination with correct card pop and wrong-selection vibration.
  - In-game hint deduction system and timer coin bonus.
  - Replaced browser `alert()` popups with custom interactive adventure modals and an SVG animated treasure chest.

### 4. 🧱 Neon Breakout (`games/breaker/`)
- **Visual Identity**: Synthwave neon aesthetic with glowing multi-tier glass bricks and particle explosion sparks.
- **Breakout Mechanics**:
  - Multi-tier brick durability: 1-hit Cyan, 2-hit Purple (displays fissure cracks), 3-hit Gold armored, and explosive Bomb bricks.
  - Dynamic paddle reflection angle math based on ball contact offset from center.
  - Falling weapon capsules: Multi-Ball, Twin Laser Blasters, Wide Paddle, and Extra Lives.
  - 3 progressive sectors with local high-score tracking.

---

## 🔊 Synthesized Web Audio System (`shared/arcade-core.js`)
Zero external `.mp3` or `.wav` files that could fail to load! The platform includes a custom Web Audio API synthesizer generating real-time 8-bit retro sound effects:
- High-speed movement blips and UI clicks
- 2-tone melodic pickups & 3-tone bonus chimes
- Realistic swooshes, bounce pops, and cork thuds
- Multi-hit brick destruction crunches scaled by combo
- Victory fanfare and game over descent
- Persistent global mute toggle saved in `localStorage`

---

## 🚀 Local Setup

No bundlers, node_modules, or dependencies required. Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/vaishnavgupta07/arcade-games.git

# Navigate into the project
cd arcade-games

# Launch in default browser (Windows)
Start-Process index.html
```

---

## 🌐 Deployment

The platform is optimized for static hosting with clean URLs:
- **Vercel**: Deployed via `vercel.json` with static edge caching.
- **GitHub Pages**: Compatible with root branch deployment.

---

## 👨‍💻 Author

**Vaishnav Gupta**
- Email: [vaishnav.py@outlook.com](mailto:vaishnav.py@outlook.com)
- GitHub: [@vaishnavgupta07](https://github.com/vaishnavgupta07)

---

## 📄 License
MIT License. Free to play, learn from, and adapt!
