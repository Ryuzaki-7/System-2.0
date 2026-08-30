// src/components/QuestBoard.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";
import { SystemAudio } from "../utils/soundSystem";
import { SystemResetButton } from "./SystemResetButton";

export const QuestBoard = () => {
  const {
    activeQuests,
    updateObjectiveProgress,
    completeQuest,
    isPenaltyActive,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<"DAILY" | "SIDE" | "EMERGENCY">(
    "DAILY",
  );

  // 1. PENALTY ZONE LOCKDOWN (Overrides standard UI when penalty is active)
  if (isPenaltyActive) {
    const penaltyQuest = activeQuests.find((q) => q.type === "PENALTY");

    if (!penaltyQuest) return null;

    const allComplete = penaltyQuest.objectives.every((obj) => obj.isCompleted);

    return (
      <View style={styles.container}>
        <View style={styles.penaltyLockdownHeader}>
          <Text style={styles.penaltyLockdownText}>SYSTEM OVERRIDE</Text>
          <Text style={styles.penaltySubText}>
            All standard functions disabled. Survive the zone.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.card, styles.penaltyCard]}>
            <View style={styles.headerRow}>
              <Text style={styles.penaltyTag}>[ PENALTY ZONE ]</Text>
              <Text
                style={styles.timerText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                DEADLINE: {new Date(penaltyQuest.deadline).toLocaleTimeString()}
              </Text>
            </View>

            <Text style={styles.questTitle}>{penaltyQuest.title}</Text>
            <Text style={styles.questDesc}>{penaltyQuest.description}</Text>

            <View style={[styles.divider, styles.penaltyDivider]} />

            {penaltyQuest.objectives.map((obj) => (
              <TouchableOpacity
                key={obj.id}
                style={styles.objectiveRow}
                onPress={() => {
                  SystemAudio.tick();
                  updateObjectiveProgress(
                    penaltyQuest.id,
                    obj.id,
                    obj.isCompleted ? 0 : obj.targetCount,
                  );
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    styles.penaltyCheckbox,
                    obj.isCompleted && styles.checkboxDone,
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.objectiveText,
                      obj.isCompleted && styles.objectiveTextDone,
                    ]}
                  >
                    {obj.description}
                  </Text>
                  <Text style={styles.rewardText}>
                    Reward: Escape Penalty Zone
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.claimButton,
                allComplete
                  ? styles.penaltyButtonActive
                  : styles.claimButtonDisabled,
              ]}
              disabled={!allComplete || penaltyQuest.isClaimed}
              onPress={() => {
                console.log("Button pressed!");
                SystemAudio.success();
                completeQuest(penaltyQuest.id);
              }}
            >
              <Text
                style={[
                  styles.claimText,
                  allComplete && styles.penaltyTextActive,
                ]}
              >
                {penaltyQuest.isClaimed
                  ? "ESCAPED"
                  : allComplete
                    ? "SURVIVE"
                    : "INCOMPLETE"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 2. STANDARD DASHBOARD UI
  const displayedQuests = activeQuests.filter(
    (quest) => quest.type === activeTab,
  );
  const suddenQuestCount = activeQuests.filter(
    (q) => q.type === "EMERGENCY" && !q.isClaimed,
  ).length;

  return (
    <View style={styles.container}>
      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "DAILY" && styles.activeTabDaily]}
          onPress={() => setActiveTab("DAILY")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "DAILY" && styles.activeTabTextDaily,
            ]}
          >
            [ DAILY ]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "SIDE" && styles.activeTabSide]}
          onPress={() => setActiveTab("SIDE")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "SIDE" && styles.activeTabTextSide,
            ]}
          >
            [ AUXILIARY ]
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "EMERGENCY" && styles.activeTabEmergency,
            suddenQuestCount > 0 &&
              activeTab !== "EMERGENCY" &&
              styles.urgentTabAlert,
          ]}
          onPress={() => setActiveTab("EMERGENCY")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "EMERGENCY" && styles.activeTabTextEmergency,
              suddenQuestCount > 0 &&
                activeTab !== "EMERGENCY" &&
                styles.urgentTabTextAlert,
            ]}
          >
            [ SUDDEN QUEST ] {suddenQuestCount > 0 && `(${suddenQuestCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {displayedQuests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.systemTag}>[ SECTOR CLEAR ]</Text>
            <Text style={styles.subText}>
              No active quests in this category.
            </Text>
          </View>
        ) : (
          displayedQuests.map((quest) => {
            const allComplete = quest.objectives.every(
              (obj) => obj.isCompleted,
            );
            const isEmergency = quest.type === "EMERGENCY";
            const isSide = quest.type === "SIDE";

            return (
              <View
                key={quest.id}
                style={[
                  styles.card,
                  isEmergency && styles.emergencyCard,
                  isSide && styles.sideCard,
                ]}
              >
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.systemTag,
                      isEmergency && styles.emergencyTag,
                      isSide && styles.sideTag,
                    ]}
                  >
                    {isEmergency
                      ? "[ SUDDEN QUEST ]"
                      : isSide
                        ? "[ LIFESTYLE SIDE QUEST ]"
                        : "[ DAILY QUEST ]"}
                  </Text>
                  <Text
                    style={[styles.timerText, isSide && styles.sideTimer]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    DEADLINE: {new Date(quest.deadline).toLocaleTimeString()}
                  </Text>
                </View>

                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDesc}>{quest.description}</Text>

                <View
                  style={[
                    styles.divider,
                    isEmergency && styles.emergencyDivider,
                    isSide && styles.sideDivider,
                  ]}
                />

                {quest.objectives.map((obj) => (
                  <TouchableOpacity
                    key={obj.id}
                    style={styles.objectiveRow}
                    onPress={() => {
                      SystemAudio.tick();
                      updateObjectiveProgress(
                        quest.id,
                        obj.id,
                        obj.isCompleted ? 0 : obj.targetCount,
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isEmergency && styles.emergencyCheckbox,
                        isSide && styles.sideCheckbox,
                        obj.isCompleted && styles.checkboxDone,
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.objectiveText,
                          obj.isCompleted && styles.objectiveTextDone,
                        ]}
                      >
                        {obj.description}
                      </Text>
                      <Text
                        style={[
                          styles.rewardText,
                          isSide && styles.sideRewardText,
                        ]}
                      >
                        Reward: +{obj.statGain} {obj.statReward}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.claimButton,
                    allComplete
                      ? isEmergency
                        ? styles.emergencyButtonActive
                        : isSide
                          ? styles.sideButtonActive
                          : styles.claimButtonActive
                      : styles.claimButtonDisabled,
                  ]}
                  disabled={!allComplete || quest.isClaimed}
                  onPress={() => {
                    SystemAudio.success();
                    completeQuest(quest.id);
                  }}
                >
                  <Text
                    style={[
                      styles.claimText,
                      allComplete &&
                        (isEmergency
                          ? styles.emergencyTextActive
                          : isSide
                            ? styles.sideTextActive
                            : styles.claimTextActive),
                    ]}
                  >
                    {quest.isClaimed
                      ? "COMPLETED"
                      : allComplete
                        ? "CLAIM REWARD"
                        : "INCOMPLETE"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <SystemResetButton />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#1d2d50",
    paddingBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTabDaily: {
    backgroundColor: "rgba(255, 170, 0, 0.1)",
    borderColor: "#ffaa00",
  },
  activeTabSide: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "#00d4ff",
  },
  activeTabEmergency: {
    backgroundColor: "rgba(255, 51, 51, 0.1)",
    borderColor: "#ff3333",
  },
  urgentTabAlert: {
    borderColor: "#ff3333",
    backgroundColor: "rgba(255, 51, 51, 0.05)",
  },
  tabText: {
    color: "#8892b0",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "bold",
  },
  activeTabTextDaily: { color: "#ffaa00" },
  activeTabTextSide: { color: "#00d4ff" },
  activeTabTextEmergency: { color: "#ff3333" },
  urgentTabTextAlert: { color: "#ff3333" },
  emptyCard: {
    width: "100%",
    backgroundColor: "#0a192f",
    borderColor: "#233554",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#0a192f",
    borderColor: "#ffaa00",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#ffaa00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  emergencyCard: {
    borderColor: "#ff3333",
    backgroundColor: "#1a0505",
    shadowColor: "#ff3333",
  },
  sideCard: {
    borderColor: "#00d4ff",
    backgroundColor: "#05141a",
    shadowColor: "#00d4ff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  systemTag: {
    color: "#ffaa00",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  emergencyTag: { color: "#ff3333" },
  sideTag: { color: "#00d4ff" },
  timerText: {
    color: "#ff3333",
    fontSize: 12,
    fontFamily: "monospace",
    flexShrink: 1,
    textAlign: "right",
  },
  sideTimer: { color: "#00d4ff" },
  questTitle: {
    color: "#e6f1ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  questDesc: {
    color: "#8892b0",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 170, 0, 0.3)",
    marginVertical: 10,
  },
  emergencyDivider: { backgroundColor: "rgba(255, 51, 51, 0.3)" },
  sideDivider: { backgroundColor: "rgba(0, 212, 255, 0.3)" },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ffaa00",
    marginRight: 15,
    borderRadius: 3,
  },
  emergencyCheckbox: { borderColor: "#ff3333" },
  sideCheckbox: { borderColor: "#00d4ff" },
  checkboxDone: { backgroundColor: "#64ffda", borderColor: "#64ffda" },
  objectiveText: { color: "#ccd6f6", fontSize: 14, fontFamily: "monospace" },
  objectiveTextDone: {
    color: "#64ffda",
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  rewardText: {
    color: "#ffaa00",
    fontSize: 10,
    marginTop: 2,
    fontFamily: "monospace",
  },
  sideRewardText: { color: "#00d4ff" },
  claimButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#233554",
  },
  claimButtonDisabled: { backgroundColor: "transparent" },
  claimButtonActive: {
    backgroundColor: "rgba(100, 255, 218, 0.1)",
    borderColor: "#64ffda",
  },
  emergencyButtonActive: {
    backgroundColor: "rgba(255, 51, 51, 0.2)",
    borderColor: "#ff3333",
  },
  sideButtonActive: {
    backgroundColor: "rgba(0, 212, 255, 0.2)",
    borderColor: "#00d4ff",
  },
  claimText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#8892b0",
  },
  claimTextActive: { color: "#64ffda" },
  emergencyTextActive: { color: "#ff3333" },
  sideTextActive: { color: "#00d4ff" },
  subText: {
    color: "#8892b0",
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
  // Penalty Zone Custom Styles
  penaltyLockdownHeader: {
    padding: 15,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#ff0000",
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  penaltyLockdownText: {
    color: "#ff0000",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  penaltySubText: {
    color: "#ff3333",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 5,
  },
  penaltyCard: {
    borderColor: "#ff0000",
    backgroundColor: "#1a0000",
    shadowColor: "#ff0000",
  },
  penaltyTag: {
    color: "#ff0000",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  penaltyDivider: { backgroundColor: "rgba(255, 0, 0, 0.4)" },
  penaltyCheckbox: { borderColor: "#ff0000" },
  penaltyButtonActive: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderColor: "#ff0000",
  },
  penaltyTextActive: { color: "#ff0000" },
});
