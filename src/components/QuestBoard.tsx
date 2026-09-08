// src/components/QuestBoard.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePlayerStore } from "../store/usePlayerStore";
import { SystemAudio } from "../utils/soundSystem";

// --- ANIMATED & UI COMPONENTS ---

const SystemCheckbox = ({ isCompleted }: { isCompleted: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCompleted) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [isCompleted]);

  return (
    <View style={styles.checkboxBase}>
      <Animated.View
        style={[
          styles.checkboxGlow,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons name="check-bold" size={16} color="#ffffff" />
      </Animated.View>
    </View>
  );
};

const SystemBackground = () => {
  const scanlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const scanlineY = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 1000],
  });

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "#020617", overflow: "hidden" },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          width: "100%",
          height: 150,
          borderBottomWidth: 1.5,
          borderBottomColor: "rgba(0, 212, 255, 0.4)",
          backgroundColor: "rgba(0, 212, 255, 0.02)",
          transform: [{ translateY: scanlineY }],
          shadowColor: "#00d4ff",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 15,
        }}
      />
    </View>
  );
};

const HolographicCorners = ({ color }: { color: string }) => {
  const corner = {
    position: "absolute" as const,
    width: 12,
    height: 12,
    borderColor: color,
  };
  return (
    <>
      <View
        style={[
          corner,
          { top: -1.5, left: -1.5, borderTopWidth: 2, borderLeftWidth: 2 },
        ]}
      />
      <View
        style={[
          corner,
          { top: -1.5, right: -1.5, borderTopWidth: 2, borderRightWidth: 2 },
        ]}
      />
      <View
        style={[
          corner,
          {
            bottom: -1.5,
            left: -1.5,
            borderBottomWidth: 2,
            borderLeftWidth: 2,
          },
        ]}
      />
      <View
        style={[
          corner,
          {
            bottom: -1.5,
            right: -1.5,
            borderBottomWidth: 2,
            borderRightWidth: 2,
          },
        ]}
      />
    </>
  );
};

// Simplified to act as geometric border gaps
const SystemMicroLabels = () => (
  <>
    <View
      style={[styles.microLabelContainer, { top: -2, right: 30, width: 80 }]}
    />
    <View
      style={[styles.microLabelContainer, { bottom: -2, left: 30, width: 120 }]}
    />
  </>
);

// --- MAIN BOARD ---

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

  // 1. PENALTY ZONE LOCKDOWN
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
            <HolographicCorners color="#ff0000" />
            <SystemMicroLabels />

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
                disabled={penaltyQuest.isClaimed}
                onPress={() => {
                  SystemAudio.tick();
                  updateObjectiveProgress(
                    penaltyQuest.id,
                    obj.id,
                    obj.isCompleted ? 0 : obj.targetCount,
                  );
                }}
              >
                <SystemCheckbox isCompleted={obj.isCompleted} />
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
  const suddenQuestCount = activeQuests.filter(
    (q) => q.type === "EMERGENCY" && !q.isClaimed,
  ).length;

  const displayedQuests = activeQuests.filter((quest) => {
    if (quest.type !== activeTab) return false;
    if (quest.type === "EMERGENCY" && quest.isClaimed) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <SystemBackground />

      <View style={styles.tabWrapper}>
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
              numberOfLines={1}
              adjustsFontSizeToFit
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
              numberOfLines={1}
              adjustsFontSizeToFit
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
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {suddenQuestCount > 0
                ? `[ SUDDEN ] (${suddenQuestCount})`
                : "[ SUDDEN ]"}
            </Text>
          </TouchableOpacity>
        </View>
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

            const cardThemeColor = isEmergency
              ? "#ff3333"
              : isSide
                ? "#8b5cf6"
                : "#00d4ff";

            return (
              <View
                key={quest.id}
                style={[
                  styles.card,
                  isEmergency && styles.emergencyCard,
                  isSide && styles.sideCard,
                ]}
              >
                <HolographicCorners color={cardThemeColor} />
                <SystemMicroLabels />

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
                    disabled={quest.isClaimed}
                    onPress={() => {
                      SystemAudio.tick();
                      updateObjectiveProgress(
                        quest.id,
                        obj.id,
                        obj.isCompleted ? 0 : obj.targetCount,
                      );
                    }}
                  >
                    <SystemCheckbox isCompleted={obj.isCompleted} />
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", overflow: "hidden", borderRadius: 8 },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  tabWrapper: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    paddingBottom: 10,
    zIndex: 2,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 5,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTabDaily: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "#00d4ff",
  },
  activeTabSide: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderColor: "#8b5cf6",
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
    fontWeight: "900",
    letterSpacing: 1,
  },
  activeTabTextDaily: { color: "#00d4ff" },
  activeTabTextSide: { color: "#8b5cf6" },
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
    backgroundColor: "rgba(4, 12, 25, 0.4)",
    borderColor: "#00d4ff",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 2,
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
    zIndex: 2,
    overflow: "visible",
  },
  emergencyCard: {
    borderColor: "#ff3333",
    backgroundColor: "rgba(26, 5, 5, 0.6)",
    shadowColor: "#ff3333",
  },
  sideCard: {
    borderColor: "#8b5cf6",
    backgroundColor: "rgba(13, 5, 26, 0.6)",
    shadowColor: "#8b5cf6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  systemTag: {
    color: "#00d4ff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  emergencyTag: { color: "#ff3333" },
  sideTag: { color: "#8b5cf6" },
  timerText: {
    color: "#ff3333",
    fontSize: 12,
    fontFamily: "monospace",
    flexShrink: 1,
    textAlign: "right",
  },
  sideTimer: { color: "#8b5cf6" },
  questTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontFamily: "serif",
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  questDesc: {
    color: "#a8b2d1",
    fontSize: 13,
    fontFamily: "serif",
    fontStyle: "italic",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 212, 255, 0.4)",
    marginVertical: 10,
  },
  emergencyDivider: { backgroundColor: "rgba(255, 51, 51, 0.3)" },
  sideDivider: { backgroundColor: "rgba(139, 92, 246, 0.4)" },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "rgba(0, 212, 255, 0.5)",
    marginRight: 15,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 212, 255, 0.05)",
  },
  checkboxGlow: {
    width: 24,
    height: 24,
    backgroundColor: "#00d4ff",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  objectiveText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "sans-serif",
  },
  objectiveTextDone: {
    color: "#00d4ff",
    textDecorationLine: "none",
    fontWeight: "bold",
  },
  rewardText: {
    color: "#8b5cf6",
    fontSize: 10,
    marginTop: 4,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  sideRewardText: { color: "#8b5cf6" },
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
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "#00d4ff",
  },
  emergencyButtonActive: {
    backgroundColor: "rgba(255, 51, 51, 0.2)",
    borderColor: "#ff3333",
  },
  sideButtonActive: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "#8b5cf6",
  },
  claimText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#8892b0",
  },
  claimTextActive: { color: "#00d4ff" },
  emergencyTextActive: { color: "#ff3333" },
  sideTextActive: { color: "#8b5cf6" },
  subText: {
    color: "#8892b0",
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
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
    backgroundColor: "rgba(26, 0, 0, 0.8)",
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
  microLabelContainer: {
    position: "absolute",
    backgroundColor: "#020617",
    height: 6,
    zIndex: 10,
  },
});
