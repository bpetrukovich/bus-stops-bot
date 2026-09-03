import type { MinsktransApi } from "./infrastructure/minsktransApi";
import type { UserReminderConfig } from "./infrastructure/UserReminderConfig";

export class ReminderService {
  constructor(private minsktransApi: MinsktransApi) {}

  db = new Map<number, UserReminderConfig[]>();

  get(userId: number): UserReminderConfig[] {
    return this.db.get(userId) || [];
  }

  add(userId: number, userConfig: UserReminderConfig) {
    this.minsktransApi.tryBusStop(userConfig.busstop);

    if (!this.db.has(userId)) {
      this.db.set(userId, []);
    }
    this.db.set(userId, [...this.db.get(userId)!, userConfig]);
  }
}
