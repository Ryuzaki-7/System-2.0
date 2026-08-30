// src/utils/rankSystem.ts

export const getHunterRank = (level: number): string => {
  if (level >= 100) return "S-Rank";
  if (level >= 75) return "A-Rank";
  if (level >= 50) return "B-Rank";
  if (level >= 30) return "C-Rank";
  if (level >= 10) return "D-Rank";
  return "E-Rank";
};

// Numeric weights for easy comparison (e.g., checking if C-Rank >= E-Rank)
export const RANK_WEIGHTS: Record<string, number> = {
  "E-Rank": 1,
  "D-Rank": 2,
  "C-Rank": 3,
  "B-Rank": 4,
  "A-Rank": 5,
  "S-Rank": 6,
};

// Helper to check if a player meets an item/quest's unlock requirement
export const isRankUnlocked = (
  playerLevel: number,
  unlockRank?: string,
): boolean => {
  if (!unlockRank) return true; // Unlocked by default
  const currentRank = getHunterRank(playerLevel);
  return RANK_WEIGHTS[currentRank] >= RANK_WEIGHTS[unlockRank];
};
