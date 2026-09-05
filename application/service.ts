import type { UserConfigProcessor } from "../UserConfigProcessor";
import type { ReminderRepository } from "./AppService";

export class Service {
  constructor(
    private reminderRepository: ReminderRepository,
    private userConfigProcessor: UserConfigProcessor,
  ) {}

  async poll(): Promise<void> {
    const activeConfigs = this.reminderRepository.getAllActive();
    if (activeConfigs.length === 0) {
      return;
    }
    await this.userConfigProcessor.processAll(activeConfigs);
  }
}