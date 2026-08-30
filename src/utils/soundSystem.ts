// src/utils/soundSystem.ts
import * as Haptics from "expo-haptics";

export const SystemAudio = {
  // Light tick for checkboxes / UI movement
  tick: async () => {
    await Haptics.selectionAsync();
  },

  // Success feedback when completing an objective or claiming rewards
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Warning feedback for Emergency Quests or Penalties
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Heavy impact for level ups or major milestones
  impact: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};
