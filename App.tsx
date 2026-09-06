// App.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { systemClock } from "./src/core/SystemClock";
import { usePlayerStore } from "./src/store/usePlayerStore";
import { StatRadar } from "./src/components/StatRadar";
import { QuestBoard } from "./src/components/QuestBoard";
import { PenaltyZone } from "./src/components/PenaltyZone";
import { QuestEngine } from "./src/core/QuestEngine";
import { InventoryView } from "./src/components/InventoryView";
import { SystemAudio } from "./src/utils/soundSystem";
import { PlayerHeader } from "./src/components/PlayerHeader";
import { SystemAwakening } from "./src/components/SystemAwakening";
import { NotificationService } from "./src/services/NotificationService";
import { BiometricPanel } from "./src/components/BiometricPanel"; // Adjust path if needed

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProgressBar = ({
  label,
  current,
  max,
  color,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <View style={styles.gaugeContainer}>
      <Text style={styles.gaugeLabel}>
        {label} [{current}/{max}]
      </Text>
      <View style={styles.gaugeBackground}>
        <View
          style={[
            styles.gaugeFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

export default function App() {
  const [time, setTime] = useState<Date>(systemClock.now());
  const [activeTab, setActiveTab] = useState<"STATUS" | "QUESTS" | "INVENTORY">(
    "STATUS",
  );
  const horizontalScrollRef = useRef<ScrollView>(null);
  const lastDateRef = useRef<number>(systemClock.now().getDate());
  const isAwakened = usePlayerStore((state) => state.isAwakened);

  const {
    name,
    level,
    xp,
    xpToNextLevel,
    stats,
    vitals,
    streak,
    isPenaltyActive,
  } = usePlayerStore();
  const handleMidnight = usePlayerStore((state) => state.handleMidnight);

  useEffect(() => {
    const initializeNotifications = async () => {
      // 1. Request Android/iOS notification permissions
      const granted = await NotificationService.requestPermissions();
      if (!granted) return;

      // 2. Calculate midnight timestamp for today's deadline
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
      );

      // 3. Arm the scary 4-hour and 30-minute warning schedules
      await NotificationService.scheduleDailyWarnings(midnight.getTime());
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = systemClock.subscribe((newTime) => {
      setTime(newTime);

      const currentDay = newTime.getDate();
      if (currentDay !== lastDateRef.current) {
        console.log(
          `[CLOCK]: Date changed from ${lastDateRef.current} to ${currentDay}`,
        );
        lastDateRef.current = currentDay;
        usePlayerStore.getState().handleMidnight();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTabPress = (tab: "STATUS" | "QUESTS" | "INVENTORY") => {
    SystemAudio.tick();
    setActiveTab(tab);
    const index = tab === "STATUS" ? 0 : tab === "QUESTS" ? 1 : 2;
    horizontalScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveTab(
      pageIndex === 0 ? "STATUS" : pageIndex === 1 ? "QUESTS" : "INVENTORY",
    );
  };

  if (!isAwakened) {
    return (
      <SystemAwakening
        onInitialize={() => usePlayerStore.setState({ isAwakened: true })}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, isPenaltyActive && styles.penaltyBackground]}
      >
        {isPenaltyActive ? (
          <PenaltyZone />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.systemTag}>
                {activeTab === "STATUS"
                  ? "[ STATUS WINDOW ]"
                  : activeTab === "QUESTS"
                    ? "[ QUEST LOG ]"
                    : "[ INVENTORY ]"}
              </Text>
              <Text style={styles.clockText}>
                {time.toLocaleTimeString()} | {time.toDateString()}
              </Text>
            </View>

            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              style={styles.pagerArea}
            >
              {/* PAGE 1: STATUS WINDOW */}
              <View style={styles.pageContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* Moved Header and Biometrics to Status Screen */}
                  <PlayerHeader />
                  <BiometricPanel />

                  <View style={styles.card}>
                    <View style={styles.profileRow}>
                      <View>
                        <Text style={styles.nameText}>NAME: {name}</Text>
                        <Text style={styles.statLine}>LEVEL: {level}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.statLine}>STREAK: {streak}</Text>
                        <Text style={styles.statLine}>
                          EXP: {xp}/{xpToNextLevel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <ProgressBar
                      label="HP"
                      current={vitals.hp}
                      max={vitals.maxHp}
                      color="#ff3333"
                    />
                    <ProgressBar
                      label="MP"
                      current={vitals.mp}
                      max={vitals.maxMp}
                      color="#3377ff"
                    />
                    <ProgressBar
                      label="FATIGUE"
                      current={vitals.fatigue}
                      max={100}
                      color="#ffaa00"
                    />

                    <View style={styles.divider} />

                    <View style={styles.radarContainer}>
                      <StatRadar stats={stats} maxStat={50} />
                    </View>

                    <View style={styles.statsGrid}>
                      <Text style={styles.statLine}>STR: {stats.STR}</Text>
                      <Text style={styles.statLine}>AGI: {stats.AGI}</Text>
                      <Text style={styles.statLine}>VIT: {stats.VIT}</Text>
                      <Text style={styles.statLine}>INT: {stats.INT}</Text>
                      <Text style={styles.statLine}>PER: {stats.PER}</Text>
                    </View>
                  </View>

                  <View style={styles.debugControls}>
                    <Text style={styles.debugHeader}>[ DEV TIME WARP ]</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => systemClock.addHours(1)}
                      >
                        <Text style={styles.buttonText}>+1 Hour</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => systemClock.fastForwardToMidnight()}
                      >
                        <Text style={styles.buttonText}>To 23:59</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => systemClock.resetToRealTime()}
                      >
                        <Text style={styles.buttonText}>Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* PAGE 2: QUEST LOG */}
              <View style={styles.pageContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  {/* QuestBoard is now completely isolated */}
                  <QuestBoard />
                </ScrollView>
              </View>

              {/* PAGE 3: INVENTORY */}
              <View style={styles.pageContainer}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                >
                  <InventoryView />
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => handleTabPress("STATUS")}
                style={[styles.tab, activeTab === "STATUS" && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "STATUS" && styles.activeTabText,
                  ]}
                >
                  STATUS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabPress("QUESTS")}
                style={[styles.tab, activeTab === "QUESTS" && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "QUESTS" && styles.activeTabText,
                  ]}
                >
                  QUESTS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabPress("INVENTORY")}
                style={[
                  styles.tab,
                  activeTab === "INVENTORY" && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "INVENTORY" && styles.activeTabText,
                  ]}
                >
                  INVENTORY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { borderColor: "#ff3333" }]}
                onPress={() => {
                  SystemAudio.warning(); // 🚨 Fires the emergency haptic/error vibration
                  usePlayerStore.setState((state) => ({
                    activeQuests: [
                      ...state.activeQuests,
                      QuestEngine.generateEmergencyQuest(),
                    ],
                  }));
                }}
              >
                <Text style={[styles.buttonText, { color: "#ff3333" }]}>
                  Trigger Emergency
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050a14" },
  penaltyBackground: { backgroundColor: "#2a0505" },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  systemTag: {
    color: "#00d4ff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  clockText: {
    color: "#8892b0",
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 4,
  },
  pagerArea: { flex: 1 },
  pageContainer: { width: SCREEN_WIDTH },
  scrollContent: { padding: 20, alignItems: "center", paddingBottom: 40 },
  card: {
    width: "100%",
    backgroundColor: "rgba(10, 25, 47, 0.85)",
    borderColor: "#00d4ff",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  nameText: {
    color: "#e6f1ff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 212, 255, 0.3)",
    marginVertical: 15,
  },
  statLine: {
    color: "#ccd6f6",
    fontSize: 14,
    fontFamily: "monospace",
    marginVertical: 2,
  },
  gaugeContainer: { marginVertical: 6 },
  gaugeLabel: {
    color: "#ccd6f6",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: "#112240",
    borderRadius: 4,
    overflow: "hidden",
  },
  gaugeFill: { height: "100%" },
  radarContainer: { alignItems: "center", marginVertical: 15 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  debugControls: {
    marginTop: 30,
    width: "100%",
    padding: 15,
    backgroundColor: "#112240",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#233554",
  },
  debugHeader: {
    color: "#ffaa00",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    backgroundColor: "#0a192f",
    borderColor: "#00d4ff",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
  },
  buttonText: { color: "#00d4ff", fontSize: 12, fontWeight: "bold" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#0a192f",
    borderTopWidth: 1,
    borderTopColor: "#233554",
    paddingBottom: 10,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#00d4ff" },
  tabText: {
    color: "#8892b0",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  activeTabText: { color: "#00d4ff" },
});
