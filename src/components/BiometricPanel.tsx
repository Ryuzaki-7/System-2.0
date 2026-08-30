import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";
import { SystemAudio } from "../utils/soundSystem";

export const BiometricPanel = () => {
  // Pull 'streak' or 'vitals' here to replace the missing calories data
  const { metrics, streak, syncBiometricData } = usePlayerStore();

  const STEP_GOAL = 10000;
  const stepPercentage = Math.min((metrics.steps / STEP_GOAL) * 100, 100);

  const handleManualSync = () => {
    SystemAudio.tick();
    syncBiometricData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>[ VESSEL STATUS ]</Text>
        <TouchableOpacity onPress={handleManualSync} style={styles.syncBtn}>
          <Text style={styles.syncText}>SYNC HEALTH</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.stepHeader}>
          <Text style={styles.metricLabel}>MOVEMENT GAUGE</Text>
          <Text style={styles.metricValue}>
            {metrics.steps.toLocaleString()} / {STEP_GOAL.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${stepPercentage}%` }]}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.metricCard, { flex: 1, marginRight: 5 }]}>
          <Text style={styles.metricLabel}>HUNTER STREAK</Text>
          <Text style={styles.metricValue}>{streak} Days</Text>
        </View>
        <View style={[styles.metricCard, { flex: 1, marginLeft: 5 }]}>
          <Text style={styles.metricLabel}>RECOVERY TIME</Text>
          <Text style={styles.metricValue}>{metrics.sleepHours} hrs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    color: "#00d4ff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  syncBtn: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#00d4ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  syncText: {
    color: "#00d4ff",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  metricCard: {
    backgroundColor: "#0a192f",
    borderColor: "#233554",
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  metricLabel: {
    color: "#8892b0",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    color: "#e6f1ff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#05141a",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1d2d50",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#64ffda",
  },
});
