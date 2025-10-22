import { DailyLog, Supplement } from '../types';
import { XP_PER_LEVEL } from '../constants';

export const HYDRATION_GOAL_ML = 3000;
export const HYDRATION_GOAL_XP = 15;
export const SUPPLEMENTS_ALL_TAKEN_XP = 5;

interface LevelInfo {
    level: number;
    currentLevelXp: number;
    xpForNextLevel: number;
    totalXp: number;
}

export const calculateXpAndLevel = (dailyLogs: Record<string, DailyLog>, supplements: Supplement[]): LevelInfo => {
    let totalXp = 0;

    for (const date in dailyLogs) {
        const log = dailyLogs[date];
        
        // XP from workout sessions
        log.sessions.forEach(session => {
            totalXp += session.xpGained;
        });

        // XP from hydration
        if (log.hydration >= HYDRATION_GOAL_ML) {
            totalXp += HYDRATION_GOAL_XP;
        }

        // XP from supplements
        const userSupplementIds = supplements.map(s => s.id);
        const loggedSupplementIds = Object.keys(log.supplementLog);
        
        if (userSupplementIds.length > 0 && loggedSupplementIds.length >= userSupplementIds.length) {
             const allTaken = userSupplementIds.every(id => log.supplementLog[id]);
             if (allTaken) {
                totalXp += SUPPLEMENTS_ALL_TAKEN_XP;
             }
        }
    }

    let level = 1;
    let xpForNextLevel = XP_PER_LEVEL(level);
    let cumulativeXpForLevel = 0;
    
    while (totalXp >= cumulativeXpForLevel + xpForNextLevel) {
        cumulativeXpForLevel += xpForNextLevel;
        level++;
        xpForNextLevel = XP_PER_LEVEL(level);
    }
    
    const currentLevelXp = totalXp - cumulativeXpForLevel;

    return {
        level,
        currentLevelXp,
        xpForNextLevel,
        totalXp
    };
};
