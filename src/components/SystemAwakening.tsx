import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SystemAudio } from "../utils/soundSystem";

interface SystemAwakeningProps {
  onInitialize: () => void;
}

export const SystemAwakening: React.FC<SystemAwakeningProps> = ({
  onInitialize,
}) => {
  const [step, setStep] = useState<"boot" | "prompt">("boot");
  const [bootText, setBootText] = useState("Initializing Neural Link...");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Simulate boot sequence logs
    const logs = [
      "Initializing Neural Link...",
      "Calibrating Biometric Sensors [6'3\" / 23 Yrs]...",
      "Syncing Local Environment: Hyderabad Node...",
      "Verifying Daily Routine Protocols...",
      "SYSTEM ONLINE.",
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < logs.length) {
        setBootText(logs[currentIndex]);
        SystemAudio.tick();
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStep("prompt");
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        }, 600);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {step === "boot" ? (
        <View style={styles.bootContainer}>
          <Text style={styles.bootLogo}>[ SYSTEM BOOT ]</Text>
          <Text style={styles.bootLogText}>{bootText}</Text>
        </View>
      ) : (
        <Animated.View style={[styles.promptCard, { opacity: fadeAnim }]}>
          <Text style={styles.alertHeader}>[ SYSTEM ALERT ]</Text>

          <Text style={styles.promptTitle}>
            You have met all the conditions for the Secret Quest.
          </Text>

          <Text style={styles.promptBody}>
            "Will you accept the role of the System Player and undertake the
            responsibility of self-evolution?"
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              WARNING: Refusal or failure to complete assigned directives will
              result in immediate isolation within the Penalty Zone.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => {
              SystemAudio.success();
              onInitialize();
            }}
          >
            <Text style={styles.acceptButtonText}>[ ACCEPT ]</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050b14",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bootContainer: {
    alignItems: "center",
  },
  bootLogo: {
    color: "#64ffda",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 4,
    marginBottom: 20,
  },
  bootLogText: {
    color: "#8892b0",
    fontFamily: "monospace",
    fontSize: 14,
  },
  promptCard: {
    width: "100%",
    backgroundColor: "#0a192f",
    borderColor: "#64ffda",
    borderWidth: 2,
    borderRadius: 8,
    padding: 24,
    shadowColor: "#64ffda",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    color: "#ff3333",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 15,
  },
  promptTitle: {
    color: "#e6f1ff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    lineHeight: 28,
  },
  promptBody: {
    color: "#8892b0",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: "rgba(255, 51, 51, 0.08)",
    borderColor: "rgba(255, 51, 51, 0.3)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    marginBottom: 25,
  },
  warningText: {
    color: "#ff6b6b",
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  acceptButton: {
    backgroundColor: "rgba(100, 255, 218, 0.15)",
    borderColor: "#64ffda",
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#64ffda",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 3,
  },
});
