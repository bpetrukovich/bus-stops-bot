import type {
  ReminderRepository,
  UserReminderConfigDto,
} from "../application/ReminderService";

export interface UserReminderConfigEntity {
  busstop: string;
  transportName: string;
  remindInMinutes: number;
  key: number;
  userId: number;
  isActive: boolean;
}

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
  private db: UserReminderConfigEntity[] = [];

  getForUser(userId: number): UserReminderConfigEntity[] {
    return this.db.filter((config) => config.userId === userId);
  }

  getAllActive(): UserReminderConfigEntity[] {
    return this.db.filter((config) => config.isActive);
  }

  add(userId: number, userConfig: UserReminderConfigDto): void {
    const existingIndex = this.db.findIndex(
      (config) =>
        config.userId === userId &&
        config.busstop === userConfig.busstop &&
        config.transportName === userConfig.transportName,
    );

    if (existingIndex !== -1) {
      const existing = this.db[existingIndex]!;
      this.db[existingIndex] = {
        ...existing,
        remindInMinutes: userConfig.remindInMinutes,
      };
      return;
    }

    const newKey = this.db.length > 0
      ? Math.max(...this.db.map((c) => c.key), 0) + 1
      : 1;

    this.db.push({
      key: newKey,
      userId,
      isActive: true,
      busstop: userConfig.busstop,
      transportName: userConfig.transportName,
      remindInMinutes: userConfig.remindInMinutes,
    });
  }

  remove(userId: number, key: number): void {
    const initialLength = this.db.length;
    this.db = this.db.filter(
      (config) => !(config.userId === userId && config.key === key),
    );

    if (this.db.length === initialLength) {
      throw new ReminderDoesNotExistError(
        `Can't find config for user ${userId} and key ${key}.`,
        key,
      );
    }
  }

  removeAll(userId: number): void {
    const userConfigs = this.db.filter(
      (config) => config.userId === userId,
    );

    if (userConfigs.length === 0) {
      throw new RemindersNotFoundForUserError(
        `User with id ${userId} not found`,
      );
    }

    this.db = this.db.filter((config) => config.userId !== userId);
  }

  setActive(userId: number, key: number, isActive: boolean): void {
    const existing = this.db.find(
      (config) => config.userId === userId && config.key === key,
    );

    if (!existing) {
      throw new ReminderDoesNotExistError(
        `Can't find config for user ${userId} and key ${key}.`,
        key,
      );
    }

    existing.isActive = isActive;
  }
}
