import { Bot, GrammyError, HttpError } from "grammy";
import {
  WrongBusstopError,
  type ReminderService,
} from "../application/ReminderService";
import { ParsingError } from "./Parser";
import type { BotCommandHandler } from "./commands/BotCommandHandler";
import { AddReminderCommand } from "./commands/AddReminderCommand";
import { ListCommand } from "./commands/ListCommand";
import { RemindersActionsCommand } from "./commands/RemindersActionsCommand";
import { OnboardingCommand } from "./commands/OnboardingCommand";

export class TelegramBot {
  constructor(
    private bot: Bot,
    private appService: ReminderService,
  ) {}

  listenCommands() {
    this.setupGlobalErrorHandler();
    this.registerCommands();
  }

  private registerCommands(): void {
    const handlers: BotCommandHandler[] = [
      new AddReminderCommand(this.appService),
      new ListCommand(this.appService),
      new RemindersActionsCommand(this.appService),
      new OnboardingCommand(),
    ];

    for (const handler of handlers) {
      handler.register(this.bot);
    }
  }

  private setupGlobalErrorHandler() {
    this.bot.catch((err) => {
      const ctx = err.ctx;
      const error = err.error;

      console.error(`Error then updating ${ctx.update.update_id}:`);

      if (error instanceof GrammyError) {
        console.error("Error request to Telegram:", error.description);
        return;
      }

      if (error instanceof HttpError) {
        console.error("Can't connect to Telegram:", error);
        return;
      }

      if (error instanceof WrongBusstopError) {
        ctx.reply("❌ Неверный номер остановки.");
        return;
      }

      if (error instanceof ParsingError) {
        ctx.reply(
          "❌ Неверный формат ответа от минсктранс. Пожалуйста, попробуйте позже.",
        );
        return;
      }

      try {
        ctx.reply(
          "❌ Произошла непредвиденная ошибка на сервере. Пожалуйста, попробуйте позже.",
        );
      } catch (replyError) {
        console.error("Error of sending error message:", replyError);
      }
    });
  }
}

