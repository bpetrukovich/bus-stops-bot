import type { IntervalPoller } from "../infrastructure/IntervalPoller";
import type { ReminderRepository } from "./AppService";

export class PollerService {
  constructor(
    private intervalPoller: IntervalPoller,
    private reminderRepository: ReminderRepository,
  ) {}

  start(userId: number) {
    const userReminders = this.reminderRepository.getForUser(userId);
    this.intervalPoller.start(userId, userReminders);
  }

  stop(userId: number) {
    this.intervalPoller.stop(userId);
  }
}
