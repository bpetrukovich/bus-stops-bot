import type { UserConfigProcessor } from "../UserConfigProcessor";
import type { UserReminderConfig } from "./UserReminderConfig";

export class IntervalPoller {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(
    private userConfigProcessor: UserConfigProcessor,
    private userConfigs: UserReminderConfig[],
    private intervalSeconds: number,
  ) {}

  start() {
    this.userConfigProcessor.processAll(this.userConfigs);
    this.interval = setInterval(async () => {
      this.userConfigProcessor.processAll(this.userConfigs);
    }, this.intervalSeconds * 1000);

    console.log(
      `Interval poller started with interval ${this.intervalSeconds} seconds`,
    );
  }

  stop() {
    clearInterval(this.interval);
  }
}
