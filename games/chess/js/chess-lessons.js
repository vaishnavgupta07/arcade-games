/**
 * Royal Kingdom Chess - Interactive Beginner Curriculum
 * 13 complete interactive lessons with step-by-step positions, legal exercises, and instant feedback.
 */

const ChessLessonsData = [
    {
        id: 1,
        title: "1. The Royal Chessboard",
        concept: "Board Orientation & Coordinates",
        desc: "The chessboard consists of 64 alternating light and dark squares arranged in 8 horizontal ranks (1 to 8) and 8 vertical files (a to h). Always ensure that each player has a light square in their bottom-right corner ('White on right').",
        objective: "Make the opening king pawn push: Move the pawn from e2 to e4.",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        expectedMove: { from: "e2", to: "e4" },
        hint: "Select the White pawn in front of your King (square e2) and click e4 (two squares forward).",
        successMsg: "Brilliant! The e4 square stakes a royal claim over the critical center of the realm."
    },
    {
        id: 2,
        title: "2. The Brave Pawn",
        concept: "Movement & Diagonal Captures",
        desc: "Pawns march forward one square at a time, but on their very first move they can leap two squares forward. Unlike other pieces, pawns capture diagonally one square forward!",
        objective: "Capture the enemy Black pawn on d5 using your pawn on e4.",
        fen: "8/8/8/3p4/4P3/8/8/4K2k w - - 0 1",
        expectedMove: { from: "e4", to: "d5" },
        hint: "Your pawn on e4 can capture the Black pawn diagonally forward to square d5.",
        successMsg: "Splendid strike! Pawns always capture diagonally forward."
    },
    {
        id: 3,
        title: "3. The Castle Rook",
        concept: "Horizontal & Vertical Ranks",
        desc: "The Rook represents the fortified castle tower. It sweeps as many unobstructed squares as it wishes horizontally along ranks and vertically along files.",
        objective: "Use your Rook on a1 to capture the undefended Black knight on a7.",
        fen: "8/n7/8/8/8/8/8/R3K2k w - - 0 1",
        expectedMove: { from: "a1", to: "a7" },
        hint: "Slide your Rook along the open 'a' file all the way to square a7.",
        successMsg: "Tower of power! The rook dominated the entire open file."
    },
    {
        id: 4,
        title: "4. The Bishop of the Realm",
        concept: "Diagonal Mobility & Color Complex",
        desc: "Each player starts with two bishops: one light-squared bishop and one dark-squared bishop. A bishop never changes the color of the square it travels on.",
        objective: "Deploy your light-squared bishop from c1 to capture the Black pawn on g5.",
        fen: "8/8/8/6p1/8/8/8/2B1K2k w - - 0 1",
        expectedMove: { from: "c1", to: "g5" },
        hint: "Move diagonally across the board: c1 to d2, e3, f4, and capture on g5.",
        successMsg: "Excellent sniper diagonal! The bishop struck with surgical precision."
    },
    {
        id: 5,
        title: "5. The Noble Knight",
        concept: "The L-Shape & Leaping Ability",
        desc: "The knight is the only piece in chess capable of leaping over friend and foe alike! Its movement follows an 'L' shape: two squares in one direction, then one square perpendicular.",
        objective: "Deliver a knight fork: Jump your knight from d4 to c6 to fork King and Queen.",
        fen: "r3k3/8/8/8/3N4/8/8/4K3 w - - 0 1",
        expectedMove: { from: "d4", to: "c6" },
        hint: "Move your knight to c6 (two squares up to d6, one left to c6).",
        successMsg: "Magnificent leap! The knight infiltrated the enemy line effortlessly."
    },
    {
        id: 6,
        title: "6. The Sovereign Queen",
        concept: "The Ultimate Royal Power",
        desc: "The Queen is the most lethal piece on the battlefield. She unites the powers of the Rook and the Bishop, moving any number of squares horizontally, vertically, or diagonally.",
        objective: "Slide your Queen from d1 to h5 to deliver a devastating check.",
        fen: "rnbqkbnr/ppppp2p/5p2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
        expectedMove: { from: "d1", to: "h5" },
        hint: "Move the Queen diagonally to the edge of the board at square h5.",
        successMsg: "Regal supremacy! The Queen's diagonal attack threatens checkmate."
    },
    {
        id: 7,
        title: "7. The Royal King",
        concept: "The Ruler of the Kingdom",
        desc: "The King can move one square in any direction (horizontal, vertical, or diagonal). He cannot move into squares controlled by enemy pieces. If he is trapped in check, the kingdom falls!",
        objective: "Step your King to safe shelter: Move King from e1 to f2.",
        fen: "8/8/8/8/8/8/8/4K2k w - - 0 1",
        expectedMove: { from: "e1", to: "f2" },
        hint: "Click the King on e1, then step diagonally forward to f2.",
        successMsg: "Well protected! The King leads with royal composure."
    },
    {
        id: 8,
        title: "8. Check & Checkmate",
        concept: "Trapping the Enemy King",
        desc: "'Check' means the King is currently under attack and must escape immediately. 'Checkmate' means the King is in check, cannot block, cannot capture the attacker, and has no legal escape squares. The game is won!",
        objective: "Deliver Checkmate: Move Queen from f7 to f8 to checkmate the cornered King.",
        fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
        expectedMove: { from: "f7", to: "f8" },
        hint: "Move your Queen straight up to f8. The King is trapped with nowhere to run!",
        successMsg: "CHECKMATE! The enemy sovereign falls. Victory is yours!"
    },
    {
        id: 9,
        title: "9. The Art of Castling",
        concept: "King Safety & Rook Activation",
        desc: "Castling is a dual maneuver where the King moves two squares toward a Rook, and that Rook hops over the King. It safeguards your monarch and activates your battle tower in a single turn.",
        objective: "Perform Kingside Castling: Move your King from e1 to g1.",
        fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        expectedMove: { from: "e1", to: "g1" },
        hint: "Click White King on e1 and move him two squares to g1. The Rook will automatically leap to f1.",
        successMsg: "Imperial maneuver! The King is shielded behind loyal pawns, and the Rook is mobilized."
    },
    {
        id: 10,
        title: "10. En Passant (In Passing)",
        concept: "The Special French Rule",
        desc: "If an enemy pawn uses its two-square leap to pass right beside your advanced pawn on the 5th rank, you can capture it diagonally behind as if it had only moved one square!",
        objective: "Execute En Passant: Capture the Black pawn on f5 by moving your e5 pawn to f6.",
        fen: "8/8/8/4Pp2/8/8/8/4K2k w - f6 0 1",
        expectedMove: { from: "e5", to: "f6" },
        hint: "Move your pawn from e5 diagonally into square f6 behind the enemy pawn.",
        successMsg: "En Passant mastered! A sophisticated rule that catches many opponents off guard."
    },
    {
        id: 11,
        title: "11. Pawn Promotion",
        concept: "Ascension to Royalty",
        desc: "When a humble pawn reaches the opposite end of the board (the 8th rank for White), it is immediately promoted into a Queen, Rook, Bishop, or Knight!",
        objective: "Push your pawn from e7 to e8 to promote into a Queen.",
        fen: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
        expectedMove: { from: "e7", to: "e8", promotion: "q" },
        hint: "Advance your pawn to the final rank (e8) and choose the Queen.",
        successMsg: "Coronation complete! Your pawn has ascended into a mighty Queen."
    },
    {
        id: 12,
        title: "12. Fundamental Tactics",
        concept: "Controlling the Central Realm",
        desc: "Strong players always aim to control the 4 central squares (d4, d5, e4, e5), develop their knights and bishops toward the center early, and protect their pieces from undefended traps.",
        objective: "Develop your kingside knight naturally from g1 to f3 to exert central pressure.",
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
        expectedMove: { from: "g1", to: "f3" },
        hint: "Select knight on g1 and place it on f3.",
        successMsg: "Classic opening mastery! The knight develops with tempo toward the center."
    },
    {
        id: 13,
        title: "13. Avoiding Blunders",
        concept: "Defending Hanging Pieces",
        desc: "A 'hanging piece' is an undefended piece ripe for capture. Before making any move, ask yourself: 'Is my piece safe? Does my opponent have any direct threats?'",
        objective: "Retreat your hanging bishop from e4 back to safe square c2 before the enemy captures it.",
        fen: "4k3/8/8/8/4b3/8/2B5/4K3 w - - 0 1",
        expectedMove: { from: "c2", to: "e4" },
        hint: "Take the enemy bishop on e4 with your bishop on c2!",
        successMsg: "Sharp eyes! You neutralized the threat and secured an advantage."
    }
];
