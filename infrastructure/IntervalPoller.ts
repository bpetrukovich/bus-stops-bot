import type { UserConfigProcessor } from "../UserConfigProcessor";
import type { IntervalPollerRepository } from "./IntervalPollerRepository";
import type { UserReminderConfig } from "./UserReminderConfig";

export class IntervalPoller {
  constructor(
    // NOTE: UserConfigProcessor dependency can be removed
    private userConfigProcessor: UserConfigProcessor,
    private intervalPollerRepository: IntervalPollerRepository,
    private intervalSeconds: number,
  ) {}

  start(userId: number, userConfigs: UserReminderConfig[]) {
    const existingInterval = this.intervalPollerRepository.get(userId);
    if (existingInterval) {
      throw new Error("Interval poller already started");
    }
    this.userConfigProcessor.processAll(userId, userConfigs);
    const interval = setInterval(async () => {
      this.userConfigProcessor.processAll(userId, userConfigs);
    }, this.intervalSeconds * 1000);

    console.log(
      `Interval poller started with interval ${this.intervalSeconds} seconds`,
    );

    this.intervalPollerRepository.set(userId, interval);
  }

  stop(userId: number) {
    const interval = this.intervalPollerRepository.get(userId);
    if (!interval) {
      throw new Error("Interval poller is not started");
    }
    clearInterval(interval);
    this.intervalPollerRepository.remove(userId);
  }
}
