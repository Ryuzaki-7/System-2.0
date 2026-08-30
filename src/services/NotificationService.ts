import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[SYSTEM] Notification permissions denied.");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("system-alerts", {
        name: "System Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF0000",
      });
    }
    return true;
  }

  // 1. Cold Victory Notification (Triggered instantly on daily quest completion)
  static async sendVictoryNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "[ SYSTEM ]: OBJECTIVE COMPLETE",
        body: "Daily parameters met. Your vessel grows stronger. Rest, Hunter—until the next cycle begins.",
        sound: true,
      },
      trigger: null,
    });
  }

  // 2 & 3. Scary Warnings (Triggered at 4 hours and 30 minutes remaining before midnight/failure)
  static async scheduleDailyWarnings(deadlineTimestamp: number) {
    // Clear any existing scheduled warning alerts first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    const timeRemaining = deadlineTimestamp - now;

    if (timeRemaining <= 0) return;

    const fourHoursBefore = timeRemaining - 4 * 60 * 60 * 1000;
    const thirtyMinsBefore = timeRemaining - 30 * 60 * 1000;

    // Schedule 4-hour warning if valid
    if (fourHoursBefore > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[ WARNING: 4 HOURS REMAINING ]",
          body: "Your compulsory tasks remain incomplete. Continued negligence will result in immediate transfer to the Penalty Zone.",
          sound: true,
          data: { type: "PENALTY_WARNING" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor(fourHoursBefore / 1000),
        },
      });
    }

    // Schedule 30-minute critical warning
    if (thirtyMinsBefore > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[ CRITICAL SYSTEM ALERT: 30 MINUTES ]",
          body: "WARNING. Failure imminent. Prepare for spatial displacement into the Wasteland Penalty Zone immediately.",
          sound: true,
          data: { type: "PENALTY_CRITICAL" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor(thirtyMinsBefore / 1000),
        },
      });
    }

    console.log("[SYSTEM] Penalty countdown triggers successfully armed.");
  }
}
