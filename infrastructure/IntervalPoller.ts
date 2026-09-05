export class IntervalPoller {
  constructor(private intervalSeconds: number) {}

  private interval: ReturnType<typeof setInterval> | undefined;

  start(callback: () => Promise<void>): void {
    console.log("Poll...");
    void this.run(callback);

    const interval = setInterval(() => {
      console.log("Poll...");
      void this.run(callback);
    }, this.intervalSeconds * 1000);

    this.interval = interval;

    console.log(
      `Interval poller started with interval ${this.intervalSeconds} seconds`,
    );
  }

  private async run(callback: () => Promise<void>): Promise<void> {
    try {
      await callback();
    } catch (error) {
      console.error(error);
    }
  }

  stop(): void {
    if (!this.interval) {
      throw new Error("Interval poller is not started");
    }
    clearInterval(this.interval);
    this.interval = undefined;
  }
}