import { and, asc, eq, max } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type {
  ReminderRepository,
  UserReminderConfigDto,
} from "../application/ReminderService";
import { reminders } from "./drizzle/schema";

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
  constructor(private db: NodePgDatabase) {}

  async getForUser(userId: number): Promise<UserReminderConfigEntity[]> {
    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(asc(reminders.key));
  }

  async getAllActive(): Promise<UserReminderConfigEntity[]> {
    return this.db
      .select()
      .from(reminders)
      .where(eq(reminders.isActive, true));
  }

  async add(
    userId: number,
    userConfig: UserReminderConfigDto,
  ): Promise<void> {
    const existing = await this.db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.busstop, userConfig.busstop),
          eq(reminders.transportName, userConfig.transportName),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(reminders)
        .set({ remindInMinutes: userConfig.remindInMinutes })
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.key, existing[0]!.key),
          ),
        );
      return;
    }

    const maxKeyResult = await this.db
      .select({ maxKey: max(reminders.key) })
      .from(reminders)
      .where(eq(reminders.userId, userId));

    const newKey = (maxKeyResult[0]?.maxKey ?? 0) + 1;

    await this.db.insert(reminders).values({
      key: newKey,
      userId,
      busstop: userConfig.busstop,
      transportName: userConfig.transportName,
      remindInMinutes: userConfig.remindInMinutes,
      isActive: true,
    });
  }

  async remove(userId: number, key: number): Promise<void> {
    const result = await this.db
      .delete(reminders)
      .where(and(eq(reminders.userId, userId), eq(reminders.key, key)));

    if (result.rowCount === 0) {
      throw new ReminderDoesNotExistError(
        `Can't find config for user ${userId} and key ${key}.`,
        key,
      );
    }
  }

  async removeAll(userId: number): Promise<void> {
    const userConfigs = await this.db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .limit(1);

    if (userConfigs.length === 0) {
      throw new RemindersNotFoundForUserError(
        `User with id ${userId} not found`,
      );
    }

    await this.db
      .delete(reminders)
      .where(eq(reminders.userId, userId));
  }

  async setActive(
    userId: number,
    key: number,
    isActive: boolean,
  ): Promise<void> {
    const result = await this.db
      .update(reminders)
      .set({ isActive })
      .where(and(eq(reminders.userId, userId), eq(reminders.key, key)));

    if (result.rowCount === 0) {
      throw new ReminderDoesNotExistError(
        `Can't find config for user ${userId} and key ${key}.`,
        key,
      );
    }
  }
}