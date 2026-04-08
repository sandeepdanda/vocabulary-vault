"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/providers/gamification-provider";

export function AchievementToast() {
  const { state, dismissAchievement } = useGamification();
  const current = state.achievementQueue[0];

  useEffect(() => {
    if (current) {
      const timer = setTimeout(dismissAchievement, 5000);
      return () => clearTimeout(timer);
    }
  }, [current, dismissAchievement]);

  if (!current) return null;

  return (
    <motion.div
      key={current.key}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div
        className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-start gap-3 cursor-pointer"
        onClick={dismissAchievement}
      >
        <span className="text-3xl flex-shrink-0">{current.emoji}</span>
        <div className="min-w-0">
          <p className="font-bold text-sm text-primary">
            Achievement Unlocked!
          </p>
          <p className="font-semibold text-foreground">{current.title}</p>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
