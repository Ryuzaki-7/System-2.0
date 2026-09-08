import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";
import { SystemAudio } from "../utils/soundSystem";

export const PlayerHeader = () => {
  const { name, title, level, xp, xpToNextLevel, syncBiometricData } =
    usePlayerStore();

  // Calculate exponential XP progress percentage
  const xpPercentage = Math.min((xp / xpToNextLevel) * 100, 100);

  const handleSync = async () => {
    SystemAudio.tick();
    await syncBiometricData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
        <View style={styles.rightActionRow}>
          <Text style={styles.levelText}>LVL {level}</Text>
        </View>
      </View>

      <Text style={styles.rankText}>{title.toUpperCase()}</Text>

      <View style={styles.xpContainer}>
        <View style={styles.xpBarBackground}>
          <View style={[styles.xpBarFill, { width: `${xpPercentage}%` }]} />
        </View>
        <Text style={styles.xpText}>
          {Math.floor(xp)} / {xpToNextLevel} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#0a192f",
    borderColor: "#64ffda",
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#64ffda",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  rightActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameText: {
    color: "#e6f1ff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  levelText: {
    color: "#64ffda",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  syncButton: {
    backgroundColor: "rgba(100, 255, 218, 0.1)",
    borderColor: "#64ffda",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  syncButtonText: {
    color: "#64ffda",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  rankText: {
    color: "#ffaa00",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 15,
  },
  xpContainer: {
    width: "100%",
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: "#112240",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5,
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#64ffda",
    borderRadius: 4,
  },
  xpText: {
    color: "#8892b0",
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "right",
  },
});
