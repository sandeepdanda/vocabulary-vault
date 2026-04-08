"use client";

import { AnimatePresence } from "framer-motion";
import { XpPopup } from "./xp-popup";
import { LevelUpOverlay } from "./level-up-overlay";
import { AchievementToast } from "./achievement-toast";

export function GamificationOverlay() {
  return (
    <AnimatePresence>
      <XpPopup />
      <LevelUpOverlay />
      <AchievementToast />
    </AnimatePresence>
  );
}
