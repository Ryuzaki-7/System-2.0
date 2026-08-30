import {
  initialize,
  requestPermission,
  readRecords,
  aggregateRecord,
} from "react-native-health-connect";

export class HealthSyncEngine {
  static async initializeHealthConnect(): Promise<boolean> {
    try {
      const isInitialized = await initialize();
      if (!isInitialized) return false;

      // Request permissions to read steps and sleep from Zepp/Google Fit ecosystem
      const granted = await requestPermission([
        { accessType: "read", recordType: "Steps" },
        { accessType: "read", recordType: "SleepSession" },
        { accessType: "read", recordType: "HeartRate" },
      ]);

      return granted.length > 0;
    } catch (e) {
      console.error("[SYSTEM HEALTH SYNC ERROR]:", e);
      return false;
    }
  }

  static async fetchDailyMetrics(): Promise<{
    steps: number;
    sleepHours: number;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
      const endTime = now.toISOString();

      // 1. Fetch Steps using Aggregation (Handles deduplication automatically)
      const stepAggregation = await aggregateRecord({
        recordType: "Steps",
        timeRangeFilter: {
          operator: "between",
          startTime: startOfDay,
          endTime: endTime,
        },
      });

      // Extract the deduplicated total
      const totalSteps = stepAggregation.COUNT_TOTAL || 0;

      // 2. Fetch Sleep Sessions (readRecords is fine here, less overlap issues)
      const sleepRecords = await readRecords("SleepSession", {
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(Date.now() - 86400000).toISOString(), // Last 24 hours
          endTime: endTime,
        },
      });

      let totalSleepMinutes = 0;
      sleepRecords.records.forEach((record: any) => {
        const start = new Date(record.startTime).getTime();
        const end = new Date(record.endTime).getTime();
        totalSleepMinutes += (end - start) / (1000 * 60);
      });

      const sleepHours = Number((totalSleepMinutes / 60).toFixed(1));

      return {
        steps: totalSteps,
        sleepHours: sleepHours,
      };
    } catch (e) {
      console.error("[SYSTEM] Failed to read biometrics:", e);
      return { steps: 0, sleepHours: 0 };
    }
  }
}
