export const LEVELS = [
  { key: 'beginner', label: '🌱 מתחיל', labelEn: '🌱 Beginner', min: 0 },
  { key: 'builder', label: '⚡ בונה', labelEn: '⚡ Builder', min: 500 },
  { key: 'automator', label: '🔧 אוטומטור', labelEn: '🔧 Automator', min: 2000 },
  { key: 'pro', label: '🚀 פרו', labelEn: '🚀 Pro', min: 5000 },
  { key: 'master', label: '🏆 מאסטר', labelEn: '🏆 Master', min: 10000 },
] as const;

export const XP_VIDEO = 10;
export const XP_LESSON = 50;
export const XP_CHALLENGE = 100;
export const XP_HINT_PENALTY = 10;
export const STREAK_MULTIPLIER = 1.2;

export type Level = (typeof LEVELS)[number];

export function getLevelFromXp(xp: number): Level {
  let current: Level = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.min) current = level;
  }
  return current;
}

export function getXpToNextLevel(xp: number): number | null {
  const idx = LEVELS.findIndex((l) => l.min > xp);
  if (idx === -1) return null;
  return LEVELS[idx].min - xp;
}

export function applyStreakMultiplier(baseXp: number, streak: number): number {
  if (streak >= 7) return Math.floor(baseXp * STREAK_MULTIPLIER);
  return baseXp;
}

export function checkBadgeEligibility(
  badgeKey: string,
  xp: number,
  streak: number,
  completedLessons: number
): boolean {
  switch (badgeKey) {
    case 'first_workflow':
      return completedLessons >= 1;
    case 'api_whisperer':
      return xp >= 500;
    case 'error_handler':
      return xp >= 300;
    case 'ai_builder':
      return xp >= 1000;
    case 'streak_7':
      return streak >= 7;
    default:
      return false;
  }
}
