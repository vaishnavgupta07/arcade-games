# 🕹️ Arcade Games Suite

An interactive retro-modern web arcade featuring classic games built entirely with vanilla **JavaScript (ES6+)**, **HTML5 Canvas**, and **CSS3**. Zero external game engines or heavy frameworks — pure web physics and game logic.

![Arcade Preview](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_Canvas_|_CSS3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 🎮 Included Games

### 1. 🐍 Classic Snake (`games/snake/`)
- Canvas-based grid rendering with variable speed loop.
- Full keyboard support (Arrow keys / WASD) and on-screen responsive touch D-Pad for mobile.
- Dynamic apple spawning avoiding snake body collision.
- Persistent local high-score tracking via `localStorage`.

### 2. 🍾 Bottle Flip Pro (`games/bottle/`)
- Physics simulation of rotational inertia, trajectory parabola, and gravitational landing.
- Drag / swipe gesture detection to compute velocity and launch angle.
- Standing alignment threshold detection with combo multiplier.

### 3. 🗺️ Treasure Hunt (`games/treasure/`)
- Grid-based proximity discovery engine.
- Dynamic distance calculations providing real-time hot/cold feedback.
- Strategic attempt limits and interactive scoring.

---

## 🚀 Quick Start / Local Setup

No build tools or installation needed. Simply clone and run directly in any web browser:

```bash
# Clone the repository
git clone https://github.com/vaishnavgupta07/arcade-games.git

# Navigate into the project
cd arcade-games

# Open in browser (Windows PowerShell)
Start-Process index.html

# Or open with VS Code Live Server
```

---

## 🌐 Deploy to GitHub Pages

To host this repository on GitHub Pages for free:

1. Create a new repository on GitHub named `arcade-games`.
2. Push this folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of arcade games suite"
   git branch -M main
   git remote add origin https://github.com/vaishnavgupta07/arcade-games.git
   git push -u origin main
   ```
3. Go to **Settings** > **Pages** in your GitHub repository.
4. Under **Branch**, select `main` and root `/ (root)`. Click **Save**.
5. Your arcade will be live at `https://vaishnavgupta07.github.io/arcade-games/`!

---

## 👨‍💻 Author

**Vaishnav Gupta**
- Portfolio: [vaishnavgupta07.github.io/vg](https://vaishnavgupta07.github.io/vg/)
- GitHub: [@vaishnavgupta07](https://github.com/vaishnavgupta07)
- LinkedIn: [Vaishnav Gupta](https://www.linkedin.com/in/vaishnavgupta07)

---

## 📄 License
This project is licensed under the MIT License - feel free to study, play, and adapt!
