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
import { BiometricPanel } from "./src/components/BiometricPanel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- UI COMPONENTS ---
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
            {
              width: `${percentage}%`,
              backgroundColor: color,
              shadowColor: color,
            },
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

  useEffect(() => {
    const initializeNotifications = async () => {
      const granted = await NotificationService.requestPermissions();
      if (!granted) return;

      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
      );

      await NotificationService.scheduleDailyWarnings(midnight.getTime());
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = systemClock.subscribe((newTime) => {
      setTime(newTime);
      const currentDay = newTime.getDate();
      if (currentDay !== lastDateRef.current) {
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
                  <PlayerHeader />
                  <BiometricPanel />

                  <View style={styles.card}>
                    <HolographicCorners color="#00d4ff" />

                    <View style={styles.infoContainer}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>NAME</Text>
                        <Text style={styles.infoValue}>{name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>LEVEL</Text>
                        <Text style={styles.infoValueTech}>{level}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CLASS</Text>
                        <Text style={styles.infoValueTech}>NONE</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>TITLE</Text>
                        <Text style={styles.infoValueTech}>NONE</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>EXP</Text>
                        <Text style={styles.infoValueTech}>
                          {xp} / {xpToNextLevel}
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
                        style={[styles.button, { borderColor: "#ffaa00" }]}
                        onPress={() =>
                          usePlayerStore.setState({ isAwakened: false })
                        }
                      >
                        <Text style={[styles.buttonText, { color: "#ffaa00" }]}>
                          Re-Awaken
                        </Text>
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
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" }, // Dropped to deep void black
  penaltyBackground: { backgroundColor: "#1a0505" },
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
    fontFamily: "serif", // Added serif for authority
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
    backgroundColor: "rgba(4, 12, 25, 0.4)", // Highly transparent glass
    borderColor: "#00d4ff",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 2, // Sharpened corners
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    overflow: "visible",
  },
  infoContainer: {
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    color: "#00d4ff",
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "bold",
    width: 70,
    letterSpacing: 1,
  },
  infoValue: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: "serif",
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoValueTech: {
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 212, 255, 0.4)",
    marginVertical: 15,
  },
  statLine: {
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "monospace",
    marginVertical: 2,
  },
  gaugeContainer: { marginVertical: 8 },
  gaugeLabel: {
    color: "#00d4ff",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 6,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  gaugeBackground: {
    height: 10,
    backgroundColor: "rgba(0, 212, 255, 0.05)", // Transparent void fill
    borderColor: "rgba(0, 212, 255, 0.3)", // Tech border
    borderWidth: 1,
    borderRadius: 0, // Squared edges
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
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
    backgroundColor: "rgba(4, 12, 25, 0.4)",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#233554",
  },
  debugHeader: {
    color: "#ffaa00",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "monospace",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    backgroundColor: "rgba(0, 212, 255, 0.05)",
    borderColor: "#00d4ff",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 2,
  },
  buttonText: { color: "#00d4ff", fontSize: 12, fontWeight: "bold" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 212, 255, 0.3)",
    paddingBottom: 10,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  activeTab: {
    borderTopWidth: 2, // Moved border to the top for a floor-lit hologram look
    borderTopColor: "#00d4ff",
    marginTop: -10, // Offsets the padding to attach directly to the top border
    paddingTop: 12,
  },
  tabText: {
    color: "#8892b0",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  activeTabText: { color: "#00d4ff" },
});
