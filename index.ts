import { IntervalPoller } from "./infrastructure/IntervalPoller";
import { LoggingUserReminder } from "./infrastructure/LoggingUserReminder";
import { MinsktransApi } from "./infrastructure/minsktransApi";
import { LinkedomParser } from "./infrastructure/Parser";
import { TelegramBot } from "./infrastructure/telegramBot";
import type { UserReminderConfig } from "./infrastructure/UserReminderConfig";
import { AppService } from "./application/AppService";
import { UserConfigProcessor } from "./UserConfigProcessor";
import { ReminderRepositoryImpl } from "./infrastructure/ReminderRepository";
import { StopNameResolver } from "./infrastructure/StopNameResolver";

interface ServiceConfig {
  pollingIntervalSeconds: number;
}

const config: ServiceConfig = {
  pollingIntervalSeconds: 10,
};

const mockUserConfigs: UserReminderConfig[] = [
  {
    busstop: "46226",
    transportName: "TP3",
    remindInMinutes: 20,
  },
];

const minsktransApi = new MinsktransApi();

const reminderRepository = new ReminderRepositoryImpl();

const parser = new LinkedomParser();

const stopNameResolver = new StopNameResolver(minsktransApi, parser);

const bot = new TelegramBot(
  new AppService(reminderRepository, stopNameResolver),
);

bot.start();

// const loggingUserReminder = new LoggingUserReminder();
//
// const userConfigProcessor = new UserConfigProcessor(
//   new LinkedomParser(),
//   loggingUserReminder,
//   minsktransApi,
// );
//
// const poller = new IntervalPoller(
//   userConfigProcessor,
//   mockUserConfigs,
//   config.pollingIntervalSeconds,
// );
//
// poller.start();
