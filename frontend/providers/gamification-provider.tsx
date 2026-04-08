"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { GamificationEvent, AchievementResponse } from "@/lib/types";

interface GamificationState {
  xpPopup: { amount: number } | null;
  levelUp: { newLevel: string } | null;
  achievementQueue: AchievementResponse[];
}

interface GamificationContextValue {
  state: GamificationState;
  triggerGamification: (event: GamificationEvent) => void;
  dismissXpPopup: () => void;
  dismissLevelUp: () => void;
  dismissAchievement: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(
  null,
);

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error(
      "useGamification must be used within a GamificationProvider",
    );
  }
  return ctx;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GamificationState>({
    xpPopup: null,
    levelUp: null,
    achievementQueue: [],
  });

  const triggerGamification = useCallback((event: GamificationEvent) => {
    // Queue: XP popup first
    if (event.xp_earned > 0) {
      setState((prev) => ({
        ...prev,
        xpPopup: { amount: event.xp_earned },
      }));
    }

    // Then level-up overlay
    if (event.level_up) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          levelUp: { newLevel: event.level_up! },
        }));
      }, 1200);
    }

    // Then achievement toasts
    if (event.achievements_unlocked.length > 0) {
      const delay = event.level_up ? 2400 : 1200;
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          achievementQueue: [
            ...prev.achievementQueue,
            ...event.achievements_unlocked,
          ],
        }));
      }, delay);
    }
  }, []);

  const dismissXpPopup = useCallback(() => {
    setState((prev) => ({ ...prev, xpPopup: null }));
  }, []);

  const dismissLevelUp = useCallback(() => {
    setState((prev) => ({ ...prev, levelUp: null }));
  }, []);

  const dismissAchievement = useCallback(() => {
    setState((prev) => ({
      ...prev,
      achievementQueue: prev.achievementQueue.slice(1),
    }));
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        state,
        triggerGamification,
        dismissXpPopup,
        dismissLevelUp,
        dismissAchievement,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}
