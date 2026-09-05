import { IntervalPoller } from "./infrastructure/IntervalPoller";
import { LoggingUserReminder } from "./infrastructure/LoggingUserReminder";
import { MinsktransApi } from "./infrastructure/MinsktransApi";
import { LinkedomParser } from "./infrastructure/Parser";
import { TelegramBot } from "./infrastructure/TelegramBot";
import { ReminderService } from "./application/ReminderService";
import { SyncService } from "./application/SyncService";
import { UserConfigProcessor } from "./domain/UserConfigProcessor";
import { ReminderRepositoryImpl } from "./infrastructure/ReminderRepository";
import { TelegramBotUserReminder } from "./infrastructure/TelegramBotUserReminder";
import { Bot } from "grammy";
import { TelegramMessageSender } from "./infrastructure/TelegramMessageSender";
import { MinskTransFacade } from "./infrastructure/MinskTransFacade";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { registerBotMetadata } from "./infrastructure/commands/CommandRegistrar";

interface ServiceConfig {
  pollingIntervalSeconds: number;
}

const config: ServiceConfig = {
  pollingIntervalSeconds: 10,
};

if (!Bun.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

if (!Bun.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not set");
}

const pool = new Pool({
  connectionString: Bun.env.DATABASE_URL,
});

const db = drizzle({ client: pool });

await db.execute("select 1");

const botInstance = new Bot(Bun.env.BOT_TOKEN);

const minsktransApi = new MinsktransApi();

const reminderRepository = new ReminderRepositoryImpl(db);

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

const syncService = new SyncService(reminderRepository, userConfigProcessor);

const bot = new TelegramBot(
  botInstance,
  new ReminderService(reminderRepository, minskTransFacade),
);

try {
  await registerBotMetadata(botInstance.api);
} catch (error) {
  console.error("Failed to register bot metadata:", error);
}

botInstance.start();
bot.listenCommands();

poller.start(() => syncService.poll());
