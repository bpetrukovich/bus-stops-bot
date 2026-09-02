import type { UserConfigProcessor } from "../UserConfigProcessor";
import type { UserConfig } from "./UserConfig";

class IntervalPoller {
  interval: ReturnType<typeof setInterval> | undefined;

  constructor(
    private userConfigProcessor: UserConfigProcessor,
    private userConfigs: UserConfig[],
    private intervalSeconds: number,
  ) {}

  start() {
    this.interval = setInterval(async () => {
      this.userConfigProcessor.processAll(this.userConfigs);
    }, this.intervalSeconds * 1000);
  }

  stop() {
    clearInterval(this.interval);
  }
}
