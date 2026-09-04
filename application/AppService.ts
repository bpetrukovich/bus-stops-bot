import type { StopNameResolver } from "../infrastructure/StopNameResolver";
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

export class WrongBusstopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongBusstopError";
  }
}

export class AppService {
  constructor(
    private reminderRepository: ReminderRepository,
    private stopNameResolver: StopNameResolver,
  ) {}

  getForUser(userId: number): UserReminderConfig[] {
    return this.reminderRepository.getForUser(userId);
  }

  async add(userConfig: UserReminderConfigDto): Promise<string> {
    const busStopName = await this.stopNameResolver.getStopName(
      userConfig.busstop,
    );

    this.reminderRepository.add(userConfig.userId, userConfig);

    return busStopName;
  }

  remove(key: UserReminderConfigKey) {
    this.reminderRepository.remove(key);
  }
}
