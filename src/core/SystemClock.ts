// src/core/SystemClock.ts

type TimeListener = (currentTime: Date) => void;

class SystemClock {
  private static instance: SystemClock;
  private offsetMs: number = 0; // Milliseconds to shift from real time
  private listeners: Set<TimeListener> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startClock();
  }

  public static getInstance(): SystemClock {
    if (!SystemClock.instance) {
      SystemClock.instance = new SystemClock();
    }
    return SystemClock.instance;
  }

  private startClock(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.notifyListeners();
    }, 1000);
  }

  public now(): Date {
    return new Date(Date.now() + this.offsetMs);
  }

  public getTime(): number {
    return this.now().getTime();
  }

  // --- Fast-Forward / Testing Methods ---

  public addHours(hours: number): void {
    this.offsetMs += hours * 60 * 60 * 1000;
    this.notifyListeners();
  }

  public addMinutes(minutes: number): void {
    this.offsetMs += minutes * 60 * 1000;
    this.notifyListeners();
  }

  public addDays(days: number): void {
    this.offsetMs += days * 24 * 60 * 60 * 1000;
    this.notifyListeners();
  }

  public fastForwardToMidnight(): void {
    const current = this.now();
    const midnight = new Date(current);
    midnight.setHours(23, 59, 0, 0);

    let targetTime = midnight.getTime();
    if (targetTime <= current.getTime()) {
      // If already past 23:59, jump to next day's 23:59
      targetTime += 24 * 60 * 60 * 1000;
    }

    this.offsetMs += targetTime - current.getTime();
    this.notifyListeners();
  }

  public resetToRealTime(): void {
    this.offsetMs = 0;
    this.notifyListeners();
  }

  // --- Subscriptions for Reactive UI Updates ---

  public subscribe(listener: TimeListener): () => void {
    this.listeners.add(listener);
    listener(this.now());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentTime = this.now();
    this.listeners.forEach((listener) => listener(currentTime));
  }
}

export const systemClock = SystemClock.getInstance();
