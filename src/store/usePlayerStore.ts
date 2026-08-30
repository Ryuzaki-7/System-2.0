// src/store/usePlayerStore.ts
import { create } from "zustand";
import { PlayerState, StatType, Quest, InventoryItem } from "../types/system";
import { QuestEngine } from "../core/QuestEngine";
import { HealthSyncEngine } from "../core/HealthSyncEngine";
import { NotificationService } from "../services/NotificationService";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CloudSyncEngine } from "../engine/CloudSyncEngine";

interface PlayerActions {
  addXP: (amount: number) => void;
  increaseStat: (stat: StatType, amount: number) => void;
  updateObjectiveProgress: (
    questId: string,
    objectiveId: string,
    count: number,
  ) => void;
  completeQuest: (questId: string) => void;
  consumeItem: (itemId: string) => void;
  triggerPenalty: () => void;
  clearPenalty: () => void;
  handleMidnight: () => void;
  syncBiometricData: () => Promise<void>;
  resetSystem: () => void;
}

const calculateXpRequirement = (level: number) => {
  return 100 * Math.floor(Math.pow(level, 1.6));
};

export const getHunterRank = (level: number): string => {
  if (level < 10) return "E-Rank";
  if (level < 25) return "D-Rank";
  if (level < 50) return "C-Rank";
  if (level < 75) return "B-Rank";
  if (level < 100) return "A-Rank";
  return "S-Rank";
};

// Note: ensure `isAwakened: boolean;` is added to your PlayerState interface in "../types/system"
export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      name: "RYUZAKI",
      title: "Courage of the Weak",
      job: "None",
      level: 1,
      xp: 0,
      xpToNextLevel: calculateXpRequirement(1),
      streak: 0,
      streakProtectionActive: false,
      isPenaltyActive: false,
      isAwakened: false,
      statPoints: 0,
      metrics: {
        steps: 0,
        sleepHours: 0,
      },

      stats: {
        STR: 10,
        AGI: 10,
        VIT: 10,
        INT: 10,
        PER: 10,
      },

      vitals: {
        hp: 100,
        maxHp: 100,
        mp: 100,
        maxMp: 100,
        fatigue: 0,
      },

      inventory: [
        {
          id: "potion_healing_minor",
          name: "Minor Healing Potion",
          type: "CONSUMABLE",
          rarity: "COMMON",
          description: "Restores micro-tears in muscle tissue. Restores 30 HP.",
          effect: { target: "hp", value: 30 },
          quantity: 1,
        },
      ],

      activeQuests: QuestEngine.generateDailyQuests(),

      addXP: (amount: number) => {
        let { xp, level, vitals } = get();
        let newXp = xp + amount;
        let newLevel = level;
        let newXpToNext = calculateXpRequirement(newLevel);
        let levelsGained = 0;

        // Exponential level up check
        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel += 1;
          levelsGained += 1;
          newXpToNext = calculateXpRequirement(newLevel);
        }

        set((state) => ({
          xp: newXp,
          level: newLevel,
          title: `${getHunterRank(newLevel)} Hunter`, // Dynamically updates your rank title
          xpToNextLevel: newXpToNext,
          statPoints: state.statPoints + levelsGained * 3,
          vitals: {
            ...vitals,
            maxHp: vitals.maxHp + levelsGained * 10,
            maxMp: vitals.maxMp + levelsGained * 10,
            hp: vitals.maxHp + levelsGained * 10,
          },
        }));
      },

      increaseStat: (stat: StatType, amount: number) => {
        set((state) => ({
          stats: {
            ...state.stats,
            [stat]: state.stats[stat] + amount,
          },
        }));
      },

      updateObjectiveProgress: (
        questId: string,
        objectiveId: string,
        count: number,
      ) => {
        set((state) => ({
          activeQuests: state.activeQuests.map((quest) => {
            if (quest.id !== questId) return quest;
            return {
              ...quest,
              objectives: quest.objectives.map((obj) => {
                if (obj.id !== objectiveId) return obj;
                const updatedCount = Math.min(count, obj.targetCount);
                return {
                  ...obj,
                  currentCount: updatedCount,
                  isCompleted: updatedCount >= obj.targetCount,
                };
              }),
            };
          }),
        }));
      },

      completeQuest: (questId: string) => {
        const { activeQuests, addXP, increaseStat, inventory } = get();
        const quest = activeQuests.find((q) => q.id === questId);

        console.log("[DEBUG] Attempting to complete quest:", questId, quest);
        if (!quest || quest.isClaimed) {
          console.log("[DEBUG] Aborted: Quest not found or already claimed.");
          return;
        }

        const allObjectivesDone = quest.objectives.every(
          (obj) => obj.isCompleted,
        );
        console.log(
          "[DEBUG] Are all objectives done?",
          allObjectivesDone,
          quest.objectives,
        );
        if (!allObjectivesDone) {
          console.log("[DEBUG] Aborted: Objectives incomplete.");
          return;
        }

        // 1. Grant Base Stats and XP
        quest.objectives.forEach((obj) =>
          increaseStat(obj.statReward, obj.statGain),
        );
        addXP(quest.xpReward);

        // 2. Trigger Loot Roll
        const droppedLoot = QuestEngine.rollForLoot(quest.type);
        let updatedInventory = [...inventory];

        if (droppedLoot) {
          console.log(
            `[SYSTEM] Drop Acquired: ${droppedLoot.name} (${droppedLoot.rarity})`,
          );

          const existingItemIndex = updatedInventory.findIndex(
            (i) => i.id === droppedLoot.id,
          );
          if (existingItemIndex >= 0) {
            updatedInventory[existingItemIndex].quantity += 1;
          } else {
            updatedInventory.push({ ...droppedLoot, quantity: 1 });
          }
        }

        // 3. Handle Penalty Survival
        if (quest.type === "PENALTY") {
          console.log(
            "[SYSTEM ALERT]: You have survived the Penalty Zone. Restoring daily protocols.",
          );
          const freshDailyQuests = QuestEngine.generateDailyQuests();
          set((state) => ({
            isPenaltyActive: false,
            activeQuests: [
              ...state.activeQuests.filter((q) => q.type === "EMERGENCY"),
              ...freshDailyQuests,
            ],
            inventory: updatedInventory,
          }));
          return;
        }

        // 4. Standard Quest Completion
        set((state) => {
          const isDaily = quest.type === "DAILY";
          if (isDaily) {
            NotificationService.sendVictoryNotification();
          }

          return {
            streak: isDaily ? state.streak + 1 : state.streak,
            inventory: updatedInventory,
            activeQuests: state.activeQuests.map((q) =>
              q.id === questId ? { ...q, isClaimed: true } : q,
            ),
          };
        });
      },

      consumeItem: (itemId: string) => {
        const { inventory, streakProtectionActive } = get();
        const item = inventory.find((i) => i.id === itemId);

        if (!item || item.quantity <= 0) return;

        let newStreakProtection = streakProtectionActive;
        if (itemId === "streak_shield") {
          newStreakProtection = true;
        }

        set((state) => ({
          streakProtectionActive: newStreakProtection,
          inventory: state.inventory
            .map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
            )
            .filter((i) => i.quantity > 0),
        }));
      },

      triggerPenalty: () => {
        const penaltyQuest = QuestEngine.generatePenaltyQuest();
        console.log("[SYSTEM ALERT]: TELEPORTING TO PENALTY ZONE.");

        set((state) => ({
          streak: 0,
          isPenaltyActive: true,
          activeQuests: [
            ...state.activeQuests.filter((q) => q.type === "EMERGENCY"),
            penaltyQuest,
          ],
        }));
      },

      clearPenalty: () => {
        console.log(
          "[SYSTEM] Penalty manually cleared. Restoring daily protocols.",
        );
        const freshDailyQuests = QuestEngine.generateDailyQuests();
        set((state) => ({
          isPenaltyActive: false,
          activeQuests: [
            ...state.activeQuests.filter((q) => q.type === "EMERGENCY"),
            ...freshDailyQuests,
          ],
        }));
      },

      handleMidnight: () => {
        console.log("[SYSTEM ALERT]: Midnight protocol triggered.");
        const { activeQuests, triggerPenalty, streakProtectionActive } = get();

        const dailyQuest = activeQuests.find((q) => q.type === "DAILY");
        const isFailed = dailyQuest && !dailyQuest.isClaimed;

        // Generate the new quests using the current level for rank-scaling
        const newGymQuests = QuestEngine.generateDailyQuests(get().level);

        if (isFailed) {
          if (streakProtectionActive) {
            console.log("Streak Protection consumed. Penalty bypassed.");
            set((state) => ({
              streakProtectionActive: false,
              activeQuests: [
                ...state.activeQuests.filter((q) => q.type === "EMERGENCY"),
                ...newGymQuests,
              ],
            }));
          } else {
            triggerPenalty();
          }
        } else {
          set((state) => ({
            vitals: {
              ...state.vitals,
              hp: state.vitals.maxHp,
              mp: state.vitals.maxMp,
              fatigue: 0,
            },
            activeQuests: [
              ...state.activeQuests.filter((q) => q.type === "EMERGENCY"),
              ...newGymQuests,
            ],
          }));
        }

        const now = new Date();
        const nextMidnight = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          0,
        );
        NotificationService.scheduleDailyWarnings(nextMidnight.getTime());

        // Trigger background cloud save to GitHub after state is updated
        import("../engine/CloudSyncEngine").then(({ CloudSyncEngine }) => {
          CloudSyncEngine.backupToGitHub().then((success) => {
            if (success)
              console.log("[SYSTEM] Cloud backup to GitHub successful.");
          });
        });
      },

      syncBiometricData: async () => {
        const isConnected = await HealthSyncEngine.initializeHealthConnect();
        if (!isConnected) {
          console.log(
            "[SYSTEM] Health Connect authorization denied or unavailable.",
          );
          return;
        }

        const metrics = await HealthSyncEngine.fetchDailyMetrics();
        console.log("[SYSTEM] Biometric Data Fetched:", metrics);

        set((state) => {
          const updatedQuests = state.activeQuests.map((quest) => {
            const updatedObjectives = quest.objectives.map((obj) => {
              if (
                obj.description.toLowerCase().includes("steps") &&
                metrics.steps >= obj.targetCount
              ) {
                return {
                  ...obj,
                  currentCount: obj.targetCount,
                  isCompleted: true,
                };
              }
              return obj;
            });

            return { ...quest, objectives: updatedObjectives };
          });

          // Save both the updated quests and the raw metrics to the store
          return {
            activeQuests: updatedQuests,
            metrics: {
              steps: metrics.steps || 0,
              sleepHours: metrics.sleepHours || 0,
            },
          };
        });
      },

      resetSystem: () => {
        set({
          level: 1,
          xp: 0,
          xpToNextLevel: calculateXpRequirement(1),
          title: "Courage of the Weak",
          streak: 0,
          streakProtectionActive: false,
          isPenaltyActive: false,
          isAwakened: false,
          statPoints: 0,
          stats: { STR: 10, AGI: 10, VIT: 10, INT: 10, PER: 10 },
          vitals: { hp: 100, maxHp: 100, mp: 100, maxMp: 100, fatigue: 0 },
          inventory: [
            {
              id: "potion_healing_minor",
              name: "Minor Healing Potion",
              type: "CONSUMABLE",
              rarity: "COMMON",
              description:
                "Restores micro-tears in muscle tissue. Restores 30 HP.",
              effect: { target: "hp", value: 30 },
              quantity: 1,
            },
          ],
          activeQuests: QuestEngine.generateDailyQuests(),
        });
      },
    }),
    {
      name: "solo-system-player-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
