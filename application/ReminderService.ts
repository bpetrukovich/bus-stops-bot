import type { MinskTransFacade } from "../infrastructure/MinskTransFacade";
import type { UserReminderConfigEntity } from "../infrastructure/ReminderRepository";

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
  getForUser(userId: number): UserReminderConfigEntity[];
  getAllActive(): UserReminderConfigEntity[];
  add(userId: number, userConfig: UserReminderConfigDto): void;
  remove(userId: number, key: number): void;
  removeAll(userId: number): void;
  setActive(userId: number, key: number, isActive: boolean): void;
}

export class WrongBusstopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongBusstopError";
  }
}

export class ReminderService {
  constructor(
    private reminderRepository: ReminderRepository,
    private minskTransFacade: MinskTransFacade,
  ) {}

  getForUser(userId: number): UserReminderConfigEntity[] {
    return this.reminderRepository.getForUser(userId);
  }

  async add(userConfig: UserReminderConfigDto): Promise<string> {
    const busStopName = await this.minskTransFacade.getStopName(
      userConfig.busstop,
    );

    this.reminderRepository.add(userConfig.userId, userConfig);

    return busStopName;
  }

  remove(userId: number, key: number) {
    this.reminderRepository.remove(userId, key);
  }

  removeAll(userId: number) {
    this.reminderRepository.removeAll(userId);
  }

  setActive(userId: number, key: number, isActive: boolean) {
    this.reminderRepository.setActive(userId, key, isActive);
  }
}
