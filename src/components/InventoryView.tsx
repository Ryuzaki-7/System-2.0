// src/components/InventoryView.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { usePlayerStore } from "../store/usePlayerStore";

export const InventoryView = () => {
  const { inventory, consumeItem, streakProtectionActive } = usePlayerStore();

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
      {/* System Status Banner for Active Effects */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>[ ACTIVE SYSTEM BUFFS ]</Text>
        <Text style={styles.bannerText}>
          Streak Protection:{" "}
          <Text style={styles.highlight}>
            {streakProtectionActive ? "ACTIVE (SECURED)" : "INACTIVE"}
          </Text>
        </Text>
      </View>

      {inventory.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.systemTag}>[ INVENTORY EMPTY ]</Text>
          <Text style={styles.subText}>
            Complete Emergency Quests to acquire loot drops.
          </Text>
        </View>
      ) : (
        inventory.map((item) => {
          const isProtection = item.type === "PROTECTION";

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.systemTag}>[ {item.type} ]</Text>
                <Text style={styles.quantityText}>QTY: {item.quantity}</Text>
              </View>

              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.consumeButton}
                onPress={() => consumeItem(item.id)}
              >
                <Text style={styles.consumeButtonText}>
                  {isProtection && streakProtectionActive
                    ? "ALREADY ACTIVE"
                    : "CONSUME / ACTIVATE"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    backgroundColor: "#112240",
    borderColor: "#64ffda",
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerTitle: {
    color: "#64ffda",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 1,
  },
  bannerText: { color: "#8892b0", fontSize: 13, fontFamily: "monospace" },
  highlight: { color: "#64ffda", fontWeight: "bold" },
  card: {
    width: "100%",
    backgroundColor: "#0a192f",
    borderColor: "#64ffda",
    borderWidth: 1.5,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#64ffda",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  systemTag: {
    color: "#64ffda",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  quantityText: { color: "#ccd6f6", fontSize: 12, fontFamily: "monospace" },
  itemName: {
    color: "#e6f1ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDesc: {
    color: "#8892b0",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(100, 255, 218, 0.3)",
    marginVertical: 10,
  },
  consumeButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#64ffda",
    backgroundColor: "rgba(100, 255, 218, 0.1)",
  },
  consumeButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#64ffda",
  },
  subText: {
    color: "#8892b0",
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },
});
