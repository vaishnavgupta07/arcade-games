/**
 * Royal Kingdom Chess - High-Performance 2D Vector Board
 * Provides an accessible, responsive, zero-lag 2D view using SVG vector pieces.
 */

class Chess2D {
    constructor(containerElement, onMoveAttempt) {
        this.container = containerElement;
        this.onMoveAttempt = onMoveAttempt;
        this.orientation = 'w';
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.inCheckSquare = null;

        // Clean, elegant SVG Vector Chess Pieces (Lichess/Staunton style)
        this.pieceSVGs = {
            w: {
                k: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#d4af37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#ffffff" stroke="#333"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill="#ffffff" stroke="#333"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#333"/></g></svg>',
                q: '<svg viewBox="0 0 45 45"><g fill="#ffffff" fill-rule="evenodd" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke="#d4af37"/></g></svg>',
                r: '<svg viewBox="0 0 45 45"><g fill="#ffffff" fill-rule="evenodd" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5V22l-1-2.5h21l-1 2.5v9.5H14zM11 19h23l2-6h-5v3h-3.5v-3h-6v3h-3.5v-3H9l2 6z"/><path d="M12 36v-4.5h21V36H12zm2-4.5v-7h17v7H14z" fill="none" stroke="#d4af37"/></g></svg>',
                b: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#ffffff"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-3-2.5h6" stroke="#d4af37"/></g></svg>',
                n: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#ffffff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.062 3.37-1 4-1 .66-4.14-1.6-4.5-4.5 1.5-2.5 5.5-5.5 6.5-6.5 1.5-1.5 2.5-4 4.5-5 1-.5 3-.5 4.5.5.5.5 1.5.5 3 .5z" fill="#ffffff"/><circle cx="9.5" cy="25.5" r="1.5" fill="#333"/><path d="M14.5 15.5c4.5-2.5 10.5 0 12 3" stroke="#d4af37"/></g></svg>',
                p: '<svg viewBox="0 0 45 45"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.93 3.84 2.38 5.06-3.04 1.5-5.38 4.72-5.38 8.44 0 1.25.32 2.43.88 3.5H32.62c.56-1.07.88-2.25.88-3.5 0-3.72-2.34-6.94-5.38-8.44 1.45-1.22 2.38-3.03 2.38-5.06 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#ffffff" stroke="#333" stroke-width="1.5" stroke-linecap="round"/><path d="M17 35h11" stroke="#d4af37" stroke-width="1.5"/></svg>'
            },
            b: {
                k: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#d4af37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#181820" stroke="#ffd700"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill="#181820" stroke="#ffd700"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#ffd700"/></g></svg>',
                q: '<svg viewBox="0 0 45 45"><g fill="#181820" fill-rule="evenodd" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm17 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke="#d4af37"/></g></svg>',
                r: '<svg viewBox="0 0 45 45"><g fill="#181820" fill-rule="evenodd" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5V22l-1-2.5h21l-1 2.5v9.5H14zM11 19h23l2-6h-5v3h-3.5v-3h-6v3h-3.5v-3H9l2 6z"/><path d="M12 36v-4.5h21V36H12zm2-4.5v-7h17v7H14z" fill="none" stroke="#ffd700"/></g></svg>',
                b: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#181820"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5m-3-2.5h6" stroke="#d4af37"/></g></svg>',
                n: '<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#181820"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.062 3.37-1 4-1 .66-4.14-1.6-4.5-4.5 1.5-2.5 5.5-5.5 6.5-6.5 1.5-1.5 2.5-4 4.5-5 1-.5 3-.5 4.5.5.5.5 1.5.5 3 .5z" fill="#181820"/><circle cx="9.5" cy="25.5" r="1.5" fill="#ffd700"/><path d="M14.5 15.5c4.5-2.5 10.5 0 12 3" stroke="#ffd700"/></g></svg>',
                p: '<svg viewBox="0 0 45 45"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.93 3.84 2.38 5.06-3.04 1.5-5.38 4.72-5.38 8.44 0 1.25.32 2.43.88 3.5H32.62c.56-1.07.88-2.25.88-3.5 0-3.72-2.34-6.94-5.38-8.44 1.45-1.22 2.38-3.03 2.38-5.06 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#181820" stroke="#ffd700" stroke-width="1.5" stroke-linecap="round"/><path d="M17 35h11" stroke="#d4af37" stroke-width="1.5"/></svg>'
            }
        };

        this.initDOM();
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="chess2d-board-wrapper">
                <div class="chess2d-board" id="chess2dGrid"></div>
            </div>
        `;
        this.grid = this.container.querySelector('#chess2dGrid');
    }

    setOrientation(color) {
        this.orientation = color === 'b' ? 'b' : 'w';
    }

    render(engine, highlights = {}) {
        this.selectedSquare = highlights.selected || null;
        this.legalMoves = highlights.legalMoves || [];
        this.lastMove = highlights.lastMove || null;
        this.inCheckSquare = highlights.checkSquare || null;

        const board = engine.getBoardMatrix();
        this.grid.innerHTML = '';

        const ranks = this.orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
        const files = this.orientation === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

        ranks.forEach(r => {
            files.forEach(c => {
                const squareName = ChessEngine.coordsToSquare(c, r);
                const isLight = (r + c) % 2 === 0;
                const squareEl = document.createElement('div');
                squareEl.className = `chess2d-square ${isLight ? 'light' : 'dark'}`;
                squareEl.dataset.square = squareName;

                // Coordinates label on edge
                if (c === (this.orientation === 'w' ? 0 : 7)) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coord-label rank-label';
                    rankLabel.innerText = 8 - r;
                    squareEl.appendChild(rankLabel);
                }
                if (r === (this.orientation === 'w' ? 7 : 0)) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coord-label file-label';
                    fileLabel.innerText = String.fromCharCode(97 + c);
                    squareEl.appendChild(fileLabel);
                }

                // Square highlights
                if (this.selectedSquare === squareName) {
                    squareEl.classList.add('selected');
                }
                if (this.lastMove && (this.lastMove.from === squareName || this.lastMove.to === squareName)) {
                    squareEl.classList.add('last-move');
                }
                if (this.inCheckSquare === squareName) {
                    squareEl.classList.add('in-check');
                }
                if (highlights.hint) {
                    if (highlights.hint.from === squareName) squareEl.classList.add('hint-from');
                    if (highlights.hint.to === squareName) squareEl.classList.add('hint-to');
                }

                // Piece
                const piece = board[r][c];
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = 'chess2d-piece';
                    pieceEl.innerHTML = this.pieceSVGs[piece.color][piece.type] || '';
                    squareEl.appendChild(pieceEl);
                }

                // Legal move indicator
                const isLegal = this.legalMoves.find(m => m.to === squareName);
                if (isLegal) {
                    const dot = document.createElement('div');
                    dot.className = isLegal.captured ? 'chess2d-capture-ring' : 'chess2d-move-dot';
                    squareEl.appendChild(dot);
                }

                squareEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof this.onMoveAttempt === 'function') {
                        this.onMoveAttempt(squareName);
                    }
                });

                this.grid.appendChild(squareEl);
            });
        });
    }
}
