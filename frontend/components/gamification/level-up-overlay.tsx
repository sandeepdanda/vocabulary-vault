"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/providers/gamification-provider";

export function LevelUpOverlay() {
  const { state, dismissLevelUp } = useGamification();

  useEffect(() => {
    if (state.levelUp) {
      const timer = setTimeout(dismissLevelUp, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.levelUp, dismissLevelUp]);

  if (!state.levelUp) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={dismissLevelUp}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="bg-card border border-border rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-2">✨ ⭐ ✨</div>
        <h2 className="text-3xl font-bold text-primary mb-2">LEVEL UP!</h2>
        <p className="text-lg text-muted-foreground mb-1">You are now a</p>
        <p className="text-2xl font-bold text-secondary">
          {state.levelUp.newLevel}
        </p>
        <div className="text-4xl mt-2">🌟 🎉 🌟</div>
        <p className="text-xs text-muted-foreground mt-4">
          Tap anywhere to dismiss
        </p>
      </motion.div>
    </motion.div>
  );
}
