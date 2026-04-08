"use client";

import { motion } from "framer-motion";

interface XpProgressRingProps {
  currentXp: number;
  currentThreshold: number;
  nextThreshold: number | null;
  size?: number;
  strokeWidth?: number;
}

export function XpProgressRing({
  currentXp,
  currentThreshold,
  nextThreshold,
  size = 120,
  strokeWidth = 10,
}: XpProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = nextThreshold
    ? Math.min(
        (currentXp - currentThreshold) / (nextThreshold - currentThreshold),
        1,
      )
    : 1;

  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold">{currentXp}</p>
        <p className="text-xs text-muted-foreground">XP</p>
      </div>
    </div>
  );
}
