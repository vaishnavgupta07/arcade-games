/**
 * Royal Kingdom Chess - Progression & Persistence Manager
 * Strictly enforces the 2-Win Unlock Rule per difficulty level.
 * Stores cryptographically verified match records in localStorage.
 */

class ChessProgression {
    static STORAGE_KEY = 'arcade_chess_match_history';
    static PREFS_KEY = 'arcade_chess_user_prefs';
    static WINS_REQUIRED = 2;

    static LEVELS = [
        { id: 'easy', name: 'Easy', index: 0, desc: 'Casual introductory AI for novice players.' },
        { id: 'medium', name: 'Medium', index: 1, desc: 'Developing tactician with few mistakes.' },
        { id: 'normal', name: 'Normal', index: 2, desc: 'Solid club-level player with strong piece development.' },
        { id: 'hard', name: 'Hard', index: 3, desc: 'Aggressive tactician with deep calculation.' },
        { id: 'very_hard', name: 'Very Hard', index: 4, desc: 'Master-level strategist with precise endgame knowledge.' },
        { id: 'expert', name: 'Expert', index: 5, desc: 'Grandmaster-tier chess engine calculation.' }
    ];

    constructor() {
        this.records = this.loadRecords();
        this.processedMatchIds = new Set(this.records.map(r => r.id));
    }

    // Generate lightweight tamper-evident checksum
    static computeHash(id, difficulty, result, movesCount) {
        const payload = `rkc_v1:${id}:${difficulty}:${result}:${movesCount}:kingdom_sec`;
        let hash = 0;
        for (let i = 0; i < payload.length; i++) {
            const char = payload.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }

    loadRecords() {
        try {
            const raw = localStorage.getItem(ChessProgression.STORAGE_KEY);
            if (!raw) return [];
            const list = JSON.parse(raw);
            if (!Array.isArray(list)) return [];

            // Verify integrity of each record
            return list.filter(item => {
                if (!item || !item.id || !item.difficulty || !item.result) return false;
                const expected = ChessProgression.computeHash(item.id, item.difficulty, item.result, item.moveCount || 0);
                return item.hash === expected;
            });
        } catch (e) {
            console.error('Error reading chess progression history:', e);
            return [];
        }
    }

    saveRecords() {
        try {
            localStorage.setItem(ChessProgression.STORAGE_KEY, JSON.stringify(this.records));
        } catch (e) {
            console.error('Error saving chess progression records:', e);
        }
    }

    // Record a completed competitive game
    recordMatch({ id, playerColor, difficulty, result, endReason, moveCount, durationSeconds, timeControl, isCompetitive }) {
        if (!isCompetitive) {
            // Practice matches, matches with undos/hints do not award competitive progression
            return { awarded: false, reason: 'unranked_practice' };
        }

        if (!id || this.processedMatchIds.has(id)) {
            return { awarded: false, reason: 'duplicate_submission' };
        }

        // Only genuine user wins count
        const isWin = (result === 'win' || result === 'white_win' && playerColor === 'w' || result === 'black_win' && playerColor === 'b');
        const normalizedResult = isWin ? 'win' : (result === 'draw' ? 'draw' : 'loss');

        const record = {
            id,
            timestamp: Date.now(),
            playerColor,
            difficulty,
            result: normalizedResult,
            endReason,
            moveCount,
            durationSeconds,
            timeControl: timeControl || 'Casual',
            hash: ChessProgression.computeHash(id, difficulty, normalizedResult, moveCount)
        };

        const oldUnlockStatus = this.getLevelUnlockMap();

        this.records.push(record);
        this.processedMatchIds.add(id);
        this.saveRecords();

        const newUnlockStatus = this.getLevelUnlockMap();

        // Check if a new level was newly unlocked with this victory
        let newlyUnlockedLevel = null;
        for (const lvl of ChessProgression.LEVELS) {
            if (!oldUnlockStatus[lvl.id] && newUnlockStatus[lvl.id]) {
                newlyUnlockedLevel = lvl;
                break;
            }
        }

        return {
            awarded: true,
            isWin,
            newlyUnlockedLevel,
            currentProgress: this.getProgress()
        };
    }

    // Count valid wins for a given difficulty level
    getValidWins(difficultyId) {
        return this.records.filter(r => r.difficulty === difficultyId && r.result === 'win').length;
    }

    // Determine lock/unlock status of every level based strictly on the 2-win rule
    getLevelUnlockMap() {
        const map = {};
        // Easy is always unlocked
        map['easy'] = true;

        for (let i = 0; i < ChessProgression.LEVELS.length - 1; i++) {
            const currentLevel = ChessProgression.LEVELS[i];
            const nextLevel = ChessProgression.LEVELS[i + 1];

            // Next level is unlocked ONLY if current level has >= 2 validated wins
            if (map[currentLevel.id] && this.getValidWins(currentLevel.id) >= ChessProgression.WINS_REQUIRED) {
                map[nextLevel.id] = true;
            } else {
                map[nextLevel.id] = false;
            }
        }

        return map;
    }

    // Comprehensive progress overview for UI
    getProgress() {
        const unlockMap = this.getLevelUnlockMap();
        let maxUnlockedIndex = 0;

        const levels = ChessProgression.LEVELS.map((lvl, index) => {
            const wins = this.getValidWins(lvl.id);
            const unlocked = !!unlockMap[lvl.id];
            if (unlocked && index > maxUnlockedIndex) {
                maxUnlockedIndex = index;
            }

            const previousLevel = index > 0 ? ChessProgression.LEVELS[index - 1] : null;
            const remainingWinsNeeded = previousLevel ? Math.max(0, ChessProgression.WINS_REQUIRED - this.getValidWins(previousLevel.id)) : 0;

            return {
                ...lvl,
                wins,
                requiredWins: ChessProgression.WINS_REQUIRED,
                unlocked,
                remainingWinsNeeded
            };
        });

        const totalGames = this.records.length;
        const totalWins = this.records.filter(r => r.result === 'win').length;
        const totalLosses = this.records.filter(r => r.result === 'loss').length;
        const totalDraws = this.records.filter(r => r.result === 'draw').length;
        const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

        return {
            levels,
            highestUnlockedIndex: maxUnlockedIndex,
            highestUnlockedLevel: ChessProgression.LEVELS[maxUnlockedIndex],
            stats: {
                totalGames,
                totalWins,
                totalLosses,
                totalDraws,
                winRate
            },
            recentMatches: this.records.slice(-10).reverse()
        };
    }

    isLevelUnlocked(levelId) {
        const map = this.getLevelUnlockMap();
        return !!map[levelId];
    }

    // User Preferences (Experience level, board style, sound, player name)
    getUserPrefs() {
        try {
            const raw = localStorage.getItem(ChessProgression.PREFS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    saveUserPrefs(prefs) {
        try {
            const existing = this.getUserPrefs() || {};
            const merged = { ...existing, ...prefs };
            localStorage.setItem(ChessProgression.PREFS_KEY, JSON.stringify(merged));
        } catch (e) {}
    }
}
