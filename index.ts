import { IntervalPoller } from "./infrastructure/IntervalPoller";
import { LoggingUserReminder } from "./infrastructure/LoggingUserReminder";
import { MinsktransApi } from "./infrastructure/minsktransApi";
import { LinkedomParser } from "./infrastructure/Parser";
import { TelegramBot } from "./infrastructure/telegramBot";
import { AppService } from "./application/AppService";
import { UserConfigProcessor } from "./UserConfigProcessor";
import { ReminderRepositoryImpl } from "./infrastructure/ReminderRepository";
import { StopNameResolver } from "./infrastructure/StopNameResolver";
import { PollerService } from "./application/PollerService";
import { IntervalPollerRepository } from "./infrastructure/IntervalPollerRepository";
import { TelegramBotUserReminder } from "./infrastructure/TelegramBotUserReminder";
import { Bot } from "grammy";
import { TelegramMessageSender } from "./infrastructure/TelegramMessageSender";

interface ServiceConfig {
  pollingIntervalSeconds: number;
}

const config: ServiceConfig = {
  pollingIntervalSeconds: 10,
};

const botInstance = new Bot(Bun.env.BOT_TOKEN!);

const minsktransApi = new MinsktransApi();

const reminderRepository = new ReminderRepositoryImpl();

const parser = new LinkedomParser();

const stopNameResolver = new StopNameResolver(minsktransApi, parser);

const telegramMessageSender = new TelegramMessageSender(botInstance.api);

const telegramBotUserReminder = new TelegramBotUserReminder(
  telegramMessageSender,
);

const loggingUserReminder = new LoggingUserReminder(telegramBotUserReminder);

const userConfigProcessor = new UserConfigProcessor(
  new LinkedomParser(),
  loggingUserReminder,
  minsktransApi,
);

const intervalPollerRepository = new IntervalPollerRepository();

const poller = new IntervalPoller(
  userConfigProcessor,
  intervalPollerRepository,
  config.pollingIntervalSeconds,
);

const pollerService = new PollerService(poller, reminderRepository);

const bot = new TelegramBot(
  botInstance,
  new AppService(reminderRepository, stopNameResolver),
  pollerService,
);

botInstance.start();
bot.start();
