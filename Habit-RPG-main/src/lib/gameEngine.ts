import { format, differenceInDays } from "date-fns";

export const gameEngine = {
  generateLogId: (userId: string, habitId: string, timestamp: number = Date.now()) => {
    const dateStr = format(timestamp, "yyyy-MM-dd");
    return `${userId}_${habitId}_${dateStr}`;
  },

  calculateNewStreak: (currentStreak: number, lastCheckInMs: number, nowMs: number = Date.now(), streakShields: number = 0) => {
    const daysDiff = differenceInDays(
      new Date(format(nowMs, "yyyy-MM-dd")),
      new Date(format(lastCheckInMs, "yyyy-MM-dd"))
    );

    if (daysDiff === 0) return { streak: currentStreak, shields: streakShields };
    if (daysDiff === 1) return { streak: currentStreak + 1, shields: streakShields };

    if (daysDiff === 2 && streakShields > 0) {
      return { streak: currentStreak + 1, shields: streakShields - 1 };
    }

    return { streak: 1, shields: streakShields };
  },

  /**
   * Simple scoring:
   *   Healthy food → +10 points
   *   Water        → +5  points
   *   Junk food    → -5  points (late night junk → -10)
   *
   * Health score is clamped to 0-100.
   */
  calculateHealthScore: (foodType: string, mealTime: string, _consistency: number) => {
    if (foodType === "Healthy") return 10;
    if (foodType === "Water") return 5;
    if (foodType === "Junk") {
      return mealTime === "Night" ? -10 : -5;
    }
    return 0;
  },

  generateSuggestions: (lastMealTimeMs: number | null, currentTime: Date = new Date()) => {
    const hour = currentTime.getHours();

    if (hour >= 22 || hour < 4) return "It's late — avoid snacking. Your body needs rest.";

    if (lastMealTimeMs) {
      const hoursSince = (currentTime.getTime() - lastMealTimeMs) / (1000 * 60 * 60);
      if (hoursSince > 5 && hour > 8 && hour < 22) {
        return "You haven't eaten in over 5 hours. Consider a balanced meal.";
      }
    }

    if (hour >= 6 && hour <= 9) return "Start your day with a healthy breakfast 🥗";
    if (hour >= 12 && hour <= 14) return "Lunch time! Try to include protein and fiber.";
    if (hour >= 18 && hour <= 20) return "Dinner time — keep it light and nutritious.";

    return "Log your next meal to improve your health score.";
  }
};
