import type {
  ReminderRepository,
  UserReminderConfigDto,
  UserReminderConfigKey,
} from "../application/AppService";
import type { UserReminderConfig } from "./UserReminderConfig";

export class ReminderRepositoryImpl implements ReminderRepository {
  db = new Map<number, UserReminderConfig[]>();

  getForUser(userId: number): UserReminderConfig[] {
    return this.db.get(userId) || [];
  }

  add(userId: number, userConfig: UserReminderConfigDto) {
    if (!this.db.has(userId)) {
      this.db.set(userId, []);
    }
    this.db.set(userId, [...this.db.get(userId)!, userConfig]);
  }

  remove({ userId, busstop, transportName }: UserReminderConfigKey) {
    if (!this.db.has(userId)) {
      throw new Error(`User with id ${userId} not found`);
    }

    const userConfig = this.db
      .get(userId)!
      .find(
        (config) =>
          config.busstop === busstop && config.transportName === transportName,
      );

    if (!userConfig) {
      throw new Error(
        `Can't find config for user ${userId} and busstop ${busstop} and transportName ${transportName}`,
      );
    }

    this.db.set(
      userId,
      this.db.get(userId)!.filter((config) => config !== userConfig),
    );
  }
}
