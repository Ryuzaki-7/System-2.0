// src/core/QuestEngine.ts
import gymData from "../data/gym_quests.json";
import optionalData from "../data/optional_quests.json";
import emergencyData from "../data/emergency_quests.json";
import penaltyData from "../data/penalty_quests.json";
import lootData from "../data/loot_pool.json";
import { Quest } from "../types/system";
import { systemClock } from "./SystemClock";

// Rank helper utilities
const RANK_ORDER = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];

export const getHunterRank = (level: number): string => {
  if (level >= 100) return "S-Rank";
  if (level >= 75) return "A-Rank";
  if (level >= 50) return "B-Rank";
  if (level >= 30) return "C-Rank";
  if (level >= 10) return "D-Rank";
  return "E-Rank";
};

export const isRankUnlocked = (
  playerLevel: number,
  unlockRank?: string,
): boolean => {
  if (!unlockRank) return true;
  const currentRank = getHunterRank(playerLevel);
  return RANK_ORDER.indexOf(currentRank) >= RANK_ORDER.indexOf(unlockRank);
};

export class QuestEngine {
  static generateDailyQuests(level: number = 1): Quest[] {
    const currentRank = getHunterRank(level);
    const currentDate = systemClock.now();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayName = dayNames[currentDate.getDay()];

    // 1. Mandatory Step Quest with dynamic rank target
    const mandatoryStepQuest = (gymData.daily_pool as any[])[0];
    const stepTargetDesc = mandatoryStepQuest.targets
      ? `${mandatoryStepQuest.description} [Target: ${mandatoryStepQuest.targets[currentRank] || mandatoryStepQuest.targets["E-Rank"]}]`
      : mandatoryStepQuest.description;

    // 2. Gym Exercise Pool (Filtered by unlockRank and mapped to current rank targets)
    const gymQuestsMap = gymData.gym_pool as Record<string, any>;
    const todayGymData = gymQuestsMap[todayName] || gymQuestsMap["Sunday"];
    const todaysPool: any[] = todayGymData.exercise_pool;

    // Filter exercises unlocked at the player's current rank
    const availableExercises = todaysPool.filter((ex) =>
      isRankUnlocked(level, ex.unlockRank),
    );

    const shuffledExercises = [...availableExercises].sort(
      () => 0.5 - Math.random(),
    );
    const selectedExercises = shuffledExercises.slice(0, 5);
    const dailyXpReward =
      mandatoryStepQuest.xpReward +
      selectedExercises.reduce((sum, ex) => sum + ex.xpReward, 0);

    const deadlineDate = systemClock.now();
    deadlineDate.setHours(23, 59, 59, 999);

    const mainDailyQuest: Quest = {
      id: `daily_${deadlineDate.getTime()}`,
      title: `Shredding Protocol [${todayGymData.focus.toUpperCase()}]`,
      type: "DAILY",
      description:
        "Mandatory daily routines. Failure leads to the Penalty Zone.",
      deadline: deadlineDate.toISOString(),
      isClaimed: false,
      xpReward: dailyXpReward,
      objectives: [
        {
          id: mandatoryStepQuest.id,
          description: stepTargetDesc,
          targetCount: mandatoryStepQuest.targetCount || 1,
          currentCount: 0,
          statReward: mandatoryStepQuest.statReward as any,
          statGain: mandatoryStepQuest.statGain,
          isCompleted: false,
        },
        ...selectedExercises.map((ex) => {
          const specificTarget = ex.targets
            ? ex.targets[currentRank] || ex.targets["E-Rank"]
            : "";
          const descWithTarget = specificTarget
            ? `${ex.description} [${specificTarget}]`
            : ex.description;

          return {
            id: ex.id,
            description: descWithTarget,
            targetCount: ex.targetCount || 1,
            currentCount: 0,
            statReward: ex.statReward as any,
            statGain: ex.statGain,
            isCompleted: false,
          };
        }),
      ],
    };

    // 3. Optional Quests (Unchanged)
    const optionalPool = (optionalData as any).optional_pool;
    const coreOptionals = optionalPool.filter((opt: any) =>
      ["opt_protein", "opt_hydration", "opt_sleep"].includes(opt.id),
    );
    const rotatingOptionals = optionalPool.filter(
      (opt: any) =>
        !["opt_protein", "opt_hydration", "opt_sleep"].includes(opt.id),
    );

    const shuffledRotating = [...rotatingOptionals].sort(
      () => 0.5 - Math.random(),
    );
    const selectedOptionals = [
      ...coreOptionals,
      ...shuffledRotating.slice(0, 2),
    ];

    const sideXpReward = selectedOptionals.reduce(
      (sum: number, opt: any) => sum + opt.xpReward,
      0,
    );

    const sideQuestCard: Quest = {
      id: `side_${deadlineDate.getTime()}`,
      title: "Lifestyle Side Quests",
      type: "SIDE",
      description:
        "Hydration, nutrition, sleep, and cognitive discipline for optimal shredding.",
      deadline: deadlineDate.toISOString(),
      isClaimed: false,
      xpReward: sideXpReward,
      objectives: selectedOptionals.map((opt: any) => ({
        id: opt.id,
        description: opt.description,
        targetCount: opt.targetCount,
        currentCount: 0,
        statReward: opt.statReward as any,
        statGain: opt.statGain,
        isCompleted: false,
      })),
    };

    return [mainDailyQuest, sideQuestCard];
  }

  static rollForLoot(questType: string, level: number = 1): any | null {
    // 1. Gatekeeper Roll: Did loot drop at all?
    let dropChance = 0;
    if (questType === "EMERGENCY") dropChance = 100;
    else if (questType === "DAILY") dropChance = 30;
    else if (questType === "SIDE") dropChance = 10;
    else if (questType === "PENALTY") dropChance = 5;

    const baseRoll = Math.random() * 100;
    if (baseRoll > dropChance) {
      return null;
    }

    // 2. Weighted Lottery (Filtered by unlockRank)
    const rawPool = (lootData as any).loot_pool || [];
    const availablePool = rawPool.filter((item: any) =>
      isRankUnlocked(level, item.unlockRank),
    );

    if (availablePool.length === 0) return null;

    const totalWeight = availablePool.reduce(
      (sum: number, item: any) => sum + item.dropWeight,
      0,
    );
    let randomWeight = Math.random() * totalWeight;

    for (const item of availablePool) {
      randomWeight -= item.dropWeight;
      if (randomWeight <= 0) {
        return item;
      }
    }
    return null;
  }

  static generateEmergencyQuest(level: number = 1): Quest {
    const rawPool: any[] =
      (emergencyData as any).emergency_quests ||
      (emergencyData as any).emergency_pool ||
      [];

    // Match emergency quest rank with player rank when available
    const currentRankLetter = getHunterRank(level).charAt(0);
    const matchedPool = rawPool.filter(
      (eq) => !eq.rank || eq.rank <= currentRankLetter,
    );
    const poolToUse = matchedPool.length > 0 ? matchedPool : rawPool;

    const selected = poolToUse[Math.floor(Math.random() * poolToUse.length)];

    const deadlineDate = systemClock.now();
    const timeLimit = selected.time_limit_minutes || 120;
    deadlineDate.setMinutes(deadlineDate.getMinutes() + timeLimit);

    return {
      id: `emg_${systemClock.now().getTime()}`,
      title: selected.title,
      type: "EMERGENCY",
      description: selected.description || selected.trigger,
      deadline: deadlineDate.toISOString(),
      isClaimed: false,
      xpReward: selected.xpReward || selected.reward?.exp || 50,
      objectives: [
        {
          id: `obj_${selected.id}`,
          description: selected.objective,
          targetCount: selected.targetCount || 1,
          currentCount: 0,
          statReward: (selected.statReward || "VIT") as any,
          statGain: selected.statGain || 1,
          isCompleted: false,
        },
      ],
      lootDrop: selected.lootDrop,
    } as Quest & { lootDrop?: string };
  }

  static generatePenaltyQuest(level: number = 1): Quest {
    const currentRank = getHunterRank(level);
    const pool = (penaltyData as any).penalty_pool;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    const specificTarget = selected.targets
      ? selected.targets[currentRank] || selected.targets["E-Rank"]
      : selected.objective;

    // Exactly 4 hours to clear the penalty once triggered
    const deadlineDate = systemClock.now();
    deadlineDate.setHours(deadlineDate.getHours() + 4);

    return {
      id: `pen_${systemClock.now().getTime()}`,
      title: selected.title,
      type: "PENALTY",
      description: `${selected.description}\n\n[ REQUIRED ]: ${specificTarget}`,
      deadline: deadlineDate.toISOString(),
      isClaimed: false,
      xpReward: selected.xpReward || 25,
      objectives: [
        {
          id: `obj_${selected.id}`,
          description: specificTarget || selected.objective,
          targetCount: 1,
          currentCount: 0,
          statReward: (selected.statReward || "VIT") as any,
          statGain: selected.statGain || 0,
          isCompleted: false,
        },
      ],
    };
  }
}
