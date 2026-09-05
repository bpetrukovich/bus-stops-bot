import type { UserConfigProcessor } from "../domain/UserConfigProcessor";
import type { ReminderRepository } from "./ReminderService";

export class SyncService {
  constructor(
    private reminderRepository: ReminderRepository,
    private userConfigProcessor: UserConfigProcessor,
  ) {}

  async poll(): Promise<void> {
    const activeConfigs = await this.reminderRepository.getAllActive();
    if (activeConfigs.length === 0) {
      return;
    }
    await this.userConfigProcessor.processAll(activeConfigs);
  }
}
