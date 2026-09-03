import type { UserReminderConfig } from "./infrastructure/UserReminderConfig";

export class ReminderService {
  db = new Map<number, UserReminderConfig[]>();

  get(userId: number): UserReminderConfig[] {
    return this.db.get(userId) || [];
  }

  set(userId: number, userConfigs: UserReminderConfig[]) {
    this.db.set(userId, userConfigs);
  }
}
