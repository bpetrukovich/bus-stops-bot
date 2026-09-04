import type {
  ReminderRepository,
  UserReminderConfigDto,
} from "../application/AppService";
import type { UserReminderConfig } from "./UserReminderConfig";

export class ReminderDoesNotExistError extends Error {
  key: number;

  constructor(message: string, key: number) {
    super(message);
    this.name = "ReminderDoesNotExistError";
    this.key = key;
  }
}

export class RemindersNotFoundForUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RemindersNotFoundForUserError";
  }
}

export class ReminderRepositoryImpl implements ReminderRepository {
  private dbPerUser = new Map<
    number,
    { configs: UserReminderConfig[]; maxKey: number }
  >();

  private initUserIfAbsent(userId: number) {
    if (!this.dbPerUser.has(userId)) {
      this.dbPerUser.set(userId, { configs: [], maxKey: 0 });
    }
    return this.dbPerUser.get(userId)!;
  }

  getForUser(userId: number): UserReminderConfig[] {
    return this.dbPerUser.get(userId)?.configs || [];
  }

  add(userId: number, userConfig: UserReminderConfigDto): void {
    const userData = this.initUserIfAbsent(userId);

    const existingIndex = userData.configs.findIndex(
      (config) =>
        config.busstop === userConfig.busstop &&
        config.transportName === userConfig.transportName,
    );

    if (existingIndex !== -1) {
      userData.configs = userData.configs.map((config, index) =>
        index === existingIndex
          ? { ...config, remindInMinutes: userConfig.remindInMinutes }
          : config,
      );
      return;
    }

    userData.maxKey += 1;

    userData.configs = [
      ...userData.configs,
      { key: userData.maxKey, ...userConfig },
    ];
  }

  remove(userId: number, key: number): void {
    const userData = this.dbPerUser.get(userId);

    if (!userData) {
      throw new Error(`User with id ${userId} not found`);
    }

    const initialLength = userData.configs.length;
    userData.configs = userData.configs.filter((config) => config.key !== key);

    if (userData.configs.length === initialLength) {
      throw new ReminderDoesNotExistError(
        `Can't find config for user ${userId} and key ${key}.`,
        key,
      );
    }

    if (userData.configs.length === 0) {
      this.dbPerUser.delete(userId);
    }
  }

  removeAll(userId: number): void {
    const userData = this.dbPerUser.get(userId);

    if (!userData) {
      throw new RemindersNotFoundForUserError(
        `User with id ${userId} not found`,
      );
    }

    this.dbPerUser.delete(userId);
  }
}
