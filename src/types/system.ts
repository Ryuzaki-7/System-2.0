// src/types/system.ts

export type StatType = "STR" | "AGI" | "VIT" | "INT" | "PER";

export interface PlayerStats {
  STR: number;
  AGI: number;
  VIT: number;
  INT: number;
  PER: number;
}

export interface PlayerVitals {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number; // 0 to 100
}

export type QuestType = "DAILY" | "EMERGENCY" | "PENALTY" | "SIDE";

export interface QuestObjective {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  statReward: StatType;
  statGain: number;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  type: "DAILY" | "EMERGENCY" | "PENALTY" | "SIDE"; // Ensure 'SIDE' is here
  description: string;
  deadline: string;
  isClaimed: boolean;
  xpReward: number;
  objectives: QuestObjective[];
  lootDrop?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  dropWeight?: number;
  effect: {
    target: string;
    value: string | number | boolean;
  };
  quantity: number; // For stacking multiple potions/tokens
}

export interface PlayerState {
  name: string;
  title: string;
  job: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  streakProtectionActive: boolean;
  isPenaltyActive: boolean;
  statPoints: number; // <-- Add this line
  isAwakened: boolean;
  stats: Record<StatType, number>;
  vitals: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    fatigue: number;
  };
  inventory: InventoryItem[];
  activeQuests: Quest[];
  metrics: {
    steps: number;
    sleepHours: number;
  };
}
