import type { MinsktransApi } from "../infrastructure/minsktransApi";
import type { UserReminderConfig } from "../infrastructure/UserReminderConfig";

export interface UserReminderConfigKey {
  userId: number;
  busstop: string;
  transportName: string;
}

export interface UserReminderConfigDto {
  userId: number;
  busstop: string;
  transportName: string;
  remindInMinutes: number;
}

export interface ReminderRepository {
  getForUser(userId: number): UserReminderConfig[];
  add(userId: number, userConfig: UserReminderConfig): void;
  remove(key: UserReminderConfigKey): void;
}

export class AppService {
  constructor(
    private reminderRepository: ReminderRepository,
    private minsktransApi: MinsktransApi,
  ) {}

  getForUser(userId: number): UserReminderConfig[] {
    return this.reminderRepository.getForUser(userId);
  }

  add(userConfig: UserReminderConfigDto) {
    this.minsktransApi.tryBusStop(userConfig.busstop);

    this.reminderRepository.add(userConfig.userId, userConfig);
  }

  remove(key: UserReminderConfigKey) {
    this.reminderRepository.remove(key);
  }
}
