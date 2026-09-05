import { IntervalPoller } from "./infrastructure/IntervalPoller";
import { LoggingUserReminder } from "./infrastructure/LoggingUserReminder";
import { MinsktransApi } from "./infrastructure/minsktransApi";
import { LinkedomParser } from "./infrastructure/Parser";
import { TelegramBot } from "./infrastructure/telegramBot";
import { AppService } from "./application/AppService";
import { Service } from "./application/service";
import { UserConfigProcessor } from "./UserConfigProcessor";
import { ReminderRepositoryImpl } from "./infrastructure/ReminderRepository";
import { TelegramBotUserReminder } from "./infrastructure/TelegramBotUserReminder";
import { Bot } from "grammy";
import { TelegramMessageSender } from "./infrastructure/TelegramMessageSender";
import { MinskTransFacade } from "./infrastructure/MinskTransFacade";

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

const telegramMessageSender = new TelegramMessageSender(botInstance.api);

const telegramBotUserReminder = new TelegramBotUserReminder(
  telegramMessageSender,
);

const loggingUserReminder = new LoggingUserReminder(telegramBotUserReminder);

const minskTransFacade = new MinskTransFacade(minsktransApi, parser);

const userConfigProcessor = new UserConfigProcessor(
  loggingUserReminder,
  minskTransFacade,
);

const poller = new IntervalPoller(config.pollingIntervalSeconds);

const service = new Service(reminderRepository, userConfigProcessor);

const bot = new TelegramBot(
  botInstance,
  new AppService(reminderRepository, minskTransFacade),
);

botInstance.start();
bot.start();

poller.start(() => service.poll());
