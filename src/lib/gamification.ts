import { db } from "@/db";
import { users, xpLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const LEVELS = [
  { level: 1, title: "Kohay (Boshlang'ich)", minXp: 0 },
  { level: 2, title: "Gakusei (Talaba)", minXp: 100 },
  { level: 3, title: "Deshi (Shogird)", minXp: 300 },
  { level: 4, title: "Senpay (Katta Shogird)", minXp: 600 },
  { level: 5, title: "Sensei (Ustoz)", minXp: 1000 },
  { level: 6, title: "Shihan (Katta Ustoz)", minXp: 2000 },
  { level: 7, title: "Meijin (Usta)", minXp: 4000 },
  { level: 8, title: "Legend (Afsona)", minXp: 10000 },
];

export function getUserLevel(currentXp: number) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXp >= LEVELS[i].minXp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i]; // Cap at max level
    } else {
      break;
    }
  }

  const xpForNextLevel = nextLevel.minXp - currentLevel.minXp;
  const xpIntoCurrentLevel = currentXp - currentLevel.minXp;
  const progress = nextLevel === currentLevel 
    ? 100 
    : Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpForNextLevel) * 100));

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXp,
    nextLevelXp: nextLevel.minXp,
    progress,
  };
}

export async function awardXp(userId: string, amount: number, reason: string) {
  // Add to xp logs
  await db.insert(xpLogs).values({
    userId,
    amount,
    reason,
  });

  // Update user's total xp
  await db.update(users)
    .set({ xp: sql`${users.xp} + ${amount}` })
    .where(eq(users.id, userId));

  // Try updating streak
  await updateStreak(userId);
}

export async function updateStreak(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return;

  const now = new Date();
  const lastStreak = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
  
  // Normalizing to just the date string (YYYY-MM-DD) in local timezone to check days easily
  const todayStr = now.toISOString().split('T')[0];
  const lastStreakStr = lastStreak ? lastStreak.toISOString().split('T')[0] : "";

  if (todayStr === lastStreakStr) {
    // Already increased streak today, do nothing
    return;
  }

  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = user.streakCount;
  if (lastStreakStr === yesterdayStr) {
    // Continuous streak!
    newStreak += 1;
  } else {
    // Missed a day or first time
    newStreak = 1;
  }

  await db.update(users)
    .set({
      streakCount: newStreak,
      lastStreakDate: now,
    })
    .where(eq(users.id, userId));
}
