import type { IntervalPoller } from "./IntervalPoller";

export class IntervalPollerRepository {
  private intervalPollers: Map<number, ReturnType<typeof setInterval>> =
    new Map();

  get(userId: number): ReturnType<typeof setInterval> | undefined {
    return this.intervalPollers.get(userId);
  }

  set(userId: number, intervalPoller: ReturnType<typeof setInterval>): void {
    this.intervalPollers.set(userId, intervalPoller);
  }

  remove(userId: number): void {
    this.intervalPollers.delete(userId);
  }
}
