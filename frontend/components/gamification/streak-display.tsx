"use client";

import { motion } from "framer-motion";

interface StreakDisplayProps {
  streak: number;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  if (streak < 1) return null;

  return (
    <div className="flex items-center gap-2">
      {streak >= 2 ? (
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
        >
          🔥
        </motion.span>
      ) : (
        <span className="text-2xl">🔥</span>
      )}
      <div>
        <p className="text-2xl font-bold">{streak}</p>
        <p className="text-xs text-muted-foreground">day streak</p>
      </div>
    </div>
  );
}
