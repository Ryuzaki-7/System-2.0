import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";
import { SystemAudio } from "../utils/soundSystem";

export const SystemResetButton = () => {
  const resetSystem = usePlayerStore((state) => state.resetSystem);

  const handleReset = () => {
    SystemAudio.tick();

    Alert.alert(
      "[ SYSTEM WARNING ]",
      "Are you sure you want to completely wipe your player data? This action will reset your level, stats, and inventory back to zero.",
      [
        {
          text: "ABORT",
          style: "cancel",
        },
        {
          text: "PURGE SYSTEM",
          style: "destructive",
          onPress: () => {
            resetSystem();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleReset}>
      <Text style={styles.text}>[ INITIATE SYSTEM RESET ]</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 30,
    marginBottom: 40,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 51, 51, 0.05)",
    borderColor: "#ff3333",
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
  },
  text: {
    color: "#ff3333",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
