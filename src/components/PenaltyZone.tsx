// src/components/PenaltyZone.tsx
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";

export const PenaltyZone = () => {
  const { clearPenalty } = usePlayerStore();
  const [isTaskDone, setIsTaskDone] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.warningBox}>
        <Text style={styles.alertText}>[ WARNING ]</Text>
        <Text style={styles.subAlertText}>
          PLAYER HAS FAILED THE DAILY QUEST
        </Text>
      </View>

      <Text style={styles.title}>PENALTY ZONE</Text>
      <Text style={styles.description}>
        You have been transferred to the Penalty Zone. Survival is mandatory.
        Your streak has been reset to 0. You will not regain access to the
        System until this task is complete.
      </Text>

      <View style={styles.taskContainer}>
        <Text style={styles.taskTitle}>EMERGENCY FORFEIT:</Text>

        <TouchableOpacity
          style={styles.objectiveRow}
          onPress={() => setIsTaskDone(!isTaskDone)}
        >
          <View style={[styles.checkbox, isTaskDone && styles.checkboxDone]} />
          <Text style={[styles.taskDesc, isTaskDone && styles.taskDescDone]}>
            Complete 50 Burpees
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.clearButton,
          isTaskDone ? styles.clearButtonActive : styles.clearButtonDisabled,
        ]}
        disabled={!isTaskDone}
        onPress={clearPenalty}
      >
        <Text
          style={[styles.clearButtonText, isTaskDone && styles.clearTextActive]}
        >
          {isTaskDone ? "RETURN TO SYSTEM" : "SURVIVAL INCOMPLETE"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a0505",
    justifyContent: "center",
    padding: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  warningBox: {
    borderWidth: 2,
    borderColor: "#ff3333",
    backgroundColor: "rgba(255, 51, 51, 0.1)",
    padding: 15,
    alignItems: "center",
    marginBottom: 30,
    borderRadius: 4,
  },
  alertText: {
    color: "#ff3333",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  subAlertText: {
    color: "#ffaaaa",
    fontSize: 12,
    marginTop: 5,
    letterSpacing: 1,
  },
  title: {
    color: "#ff3333",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 2,
  },
  description: {
    color: "#ffaaaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  taskContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff3333",
    alignItems: "center",
    marginBottom: 40,
  },
  taskTitle: {
    color: "#ff3333",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 1,
  },
  objectiveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#ff3333",
    marginRight: 15,
    borderRadius: 3,
    backgroundColor: "rgba(255, 51, 51, 0.1)",
  },
  checkboxDone: { backgroundColor: "#ff3333", borderColor: "#ff3333" },
  taskDesc: { color: "#ffffff", fontSize: 18, fontFamily: "monospace" },
  taskDescDone: {
    color: "#ffaaaa",
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  clearButton: {
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  clearButtonDisabled: {
    backgroundColor: "transparent",
    borderColor: "#4a1111",
  },
  clearButtonActive: {
    backgroundColor: "rgba(255, 51, 51, 0.2)",
    borderColor: "#ff3333",
    shadowColor: "#ff3333",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#4a1111",
  },
  clearTextActive: { color: "#ff3333" },
});
