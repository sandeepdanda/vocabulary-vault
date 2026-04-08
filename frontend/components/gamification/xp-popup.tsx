"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGamification } from "@/providers/gamification-provider";

export function XpPopup() {
  const { state, dismissXpPopup } = useGamification();

  useEffect(() => {
    if (state.xpPopup) {
      const timer = setTimeout(dismissXpPopup, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.xpPopup, dismissXpPopup]);

  if (!state.xpPopup) return null;

  return (
    <motion.div
      key={`xp-${Date.now()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: -30 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <span className="text-2xl font-bold text-primary drop-shadow-lg">
        +{state.xpPopup.amount} XP
      </span>
    </motion.div>
  );
}
