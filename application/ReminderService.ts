import type { MinskTransFacade } from "../infrastructure/MinskTransFacade";
import type { UserReminderConfigEntity } from "../infrastructure/ReminderRepository";

export const MAX_REMINDERS_PER_USER = 5;

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

export interface AddReminderResult {
  stopName: string;
  alreadyExisted: boolean;
}

export interface ReminderRepository {
  getForUser(userId: number): Promise<UserReminderConfigEntity[]>;
  getAllActive(): Promise<UserReminderConfigEntity[]>;
  add(userId: number, userConfig: UserReminderConfigDto): Promise<void>;
  remove(userId: number, key: number): Promise<void>;
  removeAll(userId: number): Promise<void>;
  setActive(userId: number, key: number, isActive: boolean): Promise<void>;
}

export class WrongBusstopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongBusstopError";
  }
}

export class MaxRemindersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaxRemindersError";
  }
}

export class ReminderService {
  constructor(
    private reminderRepository: ReminderRepository,
    private minskTransFacade: MinskTransFacade,
  ) {}

  async getForUser(userId: number): Promise<UserReminderConfigEntity[]> {
    return this.reminderRepository.getForUser(userId);
  }

  async add(userConfig: UserReminderConfigDto): Promise<AddReminderResult> {
    const stopName = await this.minskTransFacade.getStopName(userConfig.busstop);

    const existing = await this.reminderRepository.getForUser(userConfig.userId);
    const alreadyExisted = existing.some(
      (reminder) =>
        reminder.busstop === userConfig.busstop &&
        reminder.transportName === userConfig.transportName,
    );

    if (!alreadyExisted && existing.length >= MAX_REMINDERS_PER_USER) {
      throw new MaxRemindersError(
        `User ${userConfig.userId} reached the limit of ${MAX_REMINDERS_PER_USER} reminders.`,
      );
    }

    await this.reminderRepository.add(userConfig.userId, userConfig);

    return { stopName, alreadyExisted };
  }

  async remove(userId: number, key: number) {
    await this.reminderRepository.remove(userId, key);
  }

  async removeAll(userId: number) {
    await this.reminderRepository.removeAll(userId);
  }

  async setActive(userId: number, key: number, isActive: boolean) {
    await this.reminderRepository.setActive(userId, key, isActive);
  }
}