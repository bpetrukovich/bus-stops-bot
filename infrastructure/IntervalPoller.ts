import type { ReminderRepository } from "../application/AppService";
import type { UserConfigProcessor } from "../UserConfigProcessor";
import type { IntervalPollerRepository } from "./IntervalPollerRepository";

export class NoRemindersForUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoRemindersForUserError";
  }
}

export class IntervalPoller {
  constructor(
    // NOTE: UserConfigProcessor and ReminderRepository dependencies can be removed
    private reminderRepository: ReminderRepository,
    private userConfigProcessor: UserConfigProcessor,
    private intervalPollerRepository: IntervalPollerRepository,
    private intervalSeconds: number,
  ) {}

  start(userId: number) {
    const userReminders = this.reminderRepository.getForUser(userId);
    if (!userReminders) {
      throw new NoRemindersForUserError("User has no reminders");
    }

    const existingInterval = this.intervalPollerRepository.get(userId);
    if (existingInterval) {
      throw new Error("Interval poller already started");
    }
    this.userConfigProcessor.processAll(userId, userReminders);
    const interval = setInterval(async () => {
      console.log("Poll...");
      this.userConfigProcessor.processAll(userId, userReminders);
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
