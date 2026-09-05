import { expect, test } from "bun:test";
import {
  MAX_REMINDERS_PER_USER,
  MaxRemindersError,
  ReminderService,
  type ReminderRepository,
  type UserReminderConfigDto,
} from "./ReminderService";
import type { MinskTransFacade } from "../infrastructure/MinskTransFacade";
import type { UserReminderConfigEntity } from "../infrastructure/ReminderRepository";

class FakeRepository implements ReminderRepository {
  items: UserReminderConfigEntity[] = [];

  async getForUser(userId: number): Promise<UserReminderConfigEntity[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async add(userId: number, config: UserReminderConfigDto): Promise<void> {
    const existing = this.items.find(
      (item) =>
        item.userId === userId &&
        item.busstop === config.busstop &&
        item.transportName === config.transportName,
    );

    if (existing) {
      existing.remindInMinutes = config.remindInMinutes;
      return;
    }

    this.items.push({
      userId,
      busstop: config.busstop,
      transportName: config.transportName,
      remindInMinutes: config.remindInMinutes,
      key: this.items.length + 1,
      isActive: true,
    });
  }

  async remove(): Promise<void> {}
  async removeAll(): Promise<void> {}
  async setActive(): Promise<void> {}
  async getAllActive(): Promise<UserReminderConfigEntity[]> {
    return this.items;
  }
}

function createService(
  repository: ReminderRepository,
): ReminderService {
  const facade = {
    getStopName: async () => "Остановка",
  } as unknown as MinskTransFacade;

  return new ReminderService(repository, facade);
}

const config = (overrides: Partial<UserReminderConfigDto> = {}): UserReminderConfigDto => ({
  userId: 1,
  busstop: "46226",
  transportName: "TP3",
  remindInMinutes: 20,
  ...overrides,
});

test("add returns alreadyExisted=false for a new reminder", async () => {
  const repository = new FakeRepository();
  const service = createService(repository);

  const result = await service.add(config());

  expect(result.stopName).toBe("Остановка");
  expect(result.alreadyExisted).toBe(false);
});

test("add returns alreadyExisted=true and updates an existing reminder", async () => {
  const repository = new FakeRepository();
  const service = createService(repository);

  await service.add(config({ remindInMinutes: 20 }));

  const result = await service.add(config({ remindInMinutes: 5 }));

  expect(result.alreadyExisted).toBe(true);
  const stored = await repository.getForUser(1);
  expect(stored).toHaveLength(1);
  expect(stored[0]?.remindInMinutes).toBe(5);
});

test("add allows updating an existing reminder after reaching the limit", async () => {
  const repository = new FakeRepository();
  const service = createService(repository);

  for (let i = 0; i < MAX_REMINDERS_PER_USER; i++) {
    await service.add(config({ busstop: `stop${i}`, transportName: `T${i}` }));
  }

  const result = await service.add(
    config({ busstop: "stop0", transportName: "T0", remindInMinutes: 1 }),
  );

  expect(result.alreadyExisted).toBe(true);
});

test("add throws MaxRemindersError when the limit is reached", async () => {
  const repository = new FakeRepository();
  const service = createService(repository);

  for (let i = 0; i < MAX_REMINDERS_PER_USER; i++) {
    await service.add(config({ busstop: `stop${i}`, transportName: `T${i}` }));
  }

  await expect(service.add(config({ busstop: "other", transportName: "X1" }))).rejects.toThrow(
    MaxRemindersError,
  );
});