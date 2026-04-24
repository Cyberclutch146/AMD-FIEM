import { format, differenceInDays } from "date-fns";

export const gameEngine = {
  /**
   * Generates a unique idempotency key for checking off a habit for a day.
   */
  generateLogId: (userId: string, habitId: string, timestamp: number = Date.now()) => {
    const dateStr = format(timestamp, "yyyy-MM-dd");
    return `${userId}_${habitId}_${dateStr}`;
  },

  /**
   * Evaluates the new streak based on the last checkin Date and today.
   * If they checked in today already, streak remains unchanged.
   * If they checked in yesterday, streak + 1.
   * If they missed days, it checks if they have a streak shield to burn.
   * Rules: Cannot protect multiple consecutive missed days (daysDiff > 2 breaks streak).
   */
  calculateNewStreak: (currentStreak: number, lastCheckInMs: number, nowMs: number = Date.now(), streakShields: number = 0) => {
    const daysDiff = differenceInDays(
      new Date(format(nowMs, "yyyy-MM-dd")),
      new Date(format(lastCheckInMs, "yyyy-MM-dd"))
    );

    if (daysDiff === 0) return { streak: currentStreak, shields: streakShields }; 
    if (daysDiff === 1) return { streak: currentStreak + 1, shields: streakShields }; 
    
    // They missed a day. Can they shield it?
    // Rule: Cannot trigger 2 days in a row. So daysDiff MUST be exactly 2 (missed precisely 1 day).
    if (daysDiff === 2 && streakShields > 0) {
      // Shield consumed. Streak remains the same (effectively pausing it for the missed day)
      // Since they are checking in *today*, we also add 1 for today's checkin!
      return { streak: currentStreak + 1, shields: streakShields - 1 };
    }

    // Streak broken, shield couldn't save it or no shields left. Restart at 1.
    return { streak: 1, shields: streakShields };
  },

  // --- HEALTH INTELLIGENCE ---

  calculateHealthScore: (foodType: string, mealTime: string, consistency: number) => {
    let score = 0;
    if (foodType === "Healthy") score += 50;
    if (foodType === "Water") score += 10;
    if (foodType === "Junk") score -= 30;

    // Time multiplier
    if (mealTime === "Night" && foodType === "Junk") {
      score -= 20; // Heavy penalty for late night junk
    }

    // Consistency bonus
    if (consistency > 3 && score > 0) {
      score = Math.floor(score * 1.2);
    }

    return score;
  },

  detectPatterns: (logs: any[]) => {
    // Only look at recent logs for patterns
    const recentLogs = logs.slice(-20); 
    const junkCount = recentLogs.filter(l => l.foodType === "Junk").length;
    const nightJunkCount = recentLogs.filter(l => l.foodType === "Junk" && l.mealTime === "Night").length;
    
    const patterns = [];
    if (junkCount >= 5) patterns.push("You are consuming junk food frequently.");
    if (nightJunkCount >= 2) patterns.push("You have a pattern of eating junk food late at night.");
    
    return patterns;
  },

  predictRisk: (logs: any[]) => {
    const recentLogs = logs.slice(-10);
    const junkCount = recentLogs.filter(l => l.foodType === "Junk").length;
    
    if (junkCount >= 4) return "HIGH RISK INCOMING: At this rate, your health risk will increase this week.";
    if (junkCount >= 2) return "MODERATE RISK: Watch your junk food intake.";
    return "LOW RISK: You are maintaining a healthy pattern.";
  },

  generateSuggestions: (lastMealTimeMs: number | null, currentTime: Date = new Date()) => {
    const currentHour = currentTime.getHours();
    
    if (currentHour >= 22 || currentHour < 4) {
      return "It's late. Avoid junk food now, your night pattern is unhealthy.";
    }

    if (lastMealTimeMs) {
      const hoursSinceLastMeal = (currentTime.getTime() - lastMealTimeMs) / (1000 * 60 * 60);
      if (hoursSinceLastMeal > 5 && currentHour > 8 && currentHour < 22) {
        return "You haven't eaten in over 5 hours. Consider a balanced meal.";
      }
    }

    if (currentHour >= 6 && currentHour <= 9) {
      return "Start your day with a healthy breakfast and hydrate.";
    }

    return "Log your next meal to track your health consistency.";
  }
};

// -- Multi-Boss Roster --

export interface RPG_Boss {
  id: string;
  name: string;
  title: string;
  imagePath: string; // e.g. /boss.png
  maxHp: number;
  weakness: string; // Habit type that does 2x damage
  themeColor: string; // CSS custom color for StarBorder
}

export const BOSS_ROSTER: RPG_Boss[] = [
  {
    id: "boss_1",
    name: "The Sloth Demon",
    title: "SLOTH SLAYER",
    imagePath: "/boss_1.png",
    maxHp: 2000,
    weakness: "Workout",
    themeColor: "rgba(255,100,100,0.8)"
  },
  {
    id: "boss_2",
    name: "The Procrastination Dragon",
    title: "DRAGON BANE",
    imagePath: "/boss_2.png",
    maxHp: 5000,
    weakness: "Custom",
    themeColor: "rgba(100,200,255,0.8)"
  },
  {
    id: "boss_3",
    name: "The Sugar Golem",
    title: "SUGAR SMASHER",
    imagePath: "/boss_3.png",
    maxHp: 3500,
    weakness: "Diet",
    themeColor: "rgba(255,100,255,0.8)"
  },
  {
    id: "boss_4",
    name: "The Scroll-Wraith of Doomsurfing",
    title: "WRAITH WALKER",
    imagePath: "/boss_4.png",
    maxHp: 4000,
    weakness: "Steps",
    themeColor: "rgba(100,255,100,0.8)"
  },
  {
    id: "boss_5",
    name: "The Void Titan",
    title: "VOID BREAKER",
    imagePath: "/boss_5.png",
    maxHp: 7500,
    weakness: "Workout",
    themeColor: "rgba(180,100,255,0.8)"
  },
  {
    id: "boss_6",
    name: "Chronophage — Devourer of Time",
    title: "TIME LORD",
    imagePath: "/boss_6.png",
    maxHp: 10000,
    weakness: "Custom",
    themeColor: "rgba(255,215,0,0.8)"
  },
  {
    id: "boss_7",
    name: "The Eternal Spectral King",
    title: "APEX LEGEND",
    imagePath: "/boss_7.png",
    maxHp: 20000,
    weakness: "Steps",
    themeColor: "rgba(255,80,80,0.8)"
  }
];

