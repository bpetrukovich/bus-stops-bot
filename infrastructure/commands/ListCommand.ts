import {
  type Bot,
  type CallbackQueryContext,
  type CommandContext,
  type Context,
} from "grammy";
import type { ReminderService } from "../../application/ReminderService";
import { ReminderDoesNotExistError } from "../ReminderRepository";
import {
  isOwner,
  parseKeyedCallback,
  REMOVE_PREFIX,
  TOGGLE_PREFIX,
} from "./callbackData";
import { buildReminderKeyboard, renderReminderList } from "./ReminderListRenderer";
import type { BotCommandHandler } from "./BotCommandHandler";

export class ListCommand implements BotCommandHandler {
  constructor(private appService: ReminderService) {}

  register(bot: Bot): void {
    bot.command("list", (ctx) => this.handleList(ctx));
    bot.callbackQuery(new RegExp(`^${TOGGLE_PREFIX}:`), (ctx) =>
      this.handleToggle(ctx),
    );
    bot.callbackQuery(new RegExp(`^${REMOVE_PREFIX}:`), (ctx) =>
      this.handleRemove(ctx),
    );
  }

  private async handleList(ctx: CommandContext<Context>): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const reminders = await this.appService.getForUser(userId);

    if (reminders.length === 0) {
      await ctx.reply("У вас пока нет сохраненных напоминаний.");
      return;
    }

    await ctx.reply(renderReminderList(reminders), {
      parse_mode: "HTML",
      reply_markup: buildReminderKeyboard(reminders),
    });
  }

  private async handleToggle(ctx: CallbackQueryContext<Context>): Promise<void> {
    const { userId, key, targetActive } = parseKeyedCallback(
      ctx.callbackQuery.data,
      TOGGLE_PREFIX,
      true,
    );
    if (userId === undefined || key === undefined || targetActive === undefined) {
      await ctx.answerCallbackQuery("Неверные данные.");
      return;
    }
    if (!isOwner(ctx, userId)) {
      await ctx.answerCallbackQuery("Это не ваше напоминание.");
      return;
    }

    try {
      await this.appService.setActive(userId, key, targetActive);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        await ctx.answerCallbackQuery("Напоминание не найдено.");
        return;
      }
      throw e;
    }

    await ctx.answerCallbackQuery();
    await this.rerender(ctx, userId);
  }

  private async handleRemove(ctx: CallbackQueryContext<Context>): Promise<void> {
    const { userId, key } = parseKeyedCallback(
      ctx.callbackQuery.data,
      REMOVE_PREFIX,
      false,
    );
    if (userId === undefined || key === undefined) {
      await ctx.answerCallbackQuery("Неверные данные.");
      return;
    }
    if (!isOwner(ctx, userId)) {
      await ctx.answerCallbackQuery("Это не ваше напоминание.");
      return;
    }

    try {
      await this.appService.remove(userId, key);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        await ctx.answerCallbackQuery("Напоминание не найдено.");
        return;
      }
      throw e;
    }

    await ctx.answerCallbackQuery();
    await this.rerender(ctx, userId);
  }

  private async rerender(
    ctx: CallbackQueryContext<Context>,
    userId: number,
  ): Promise<void> {
    const reminders = await this.appService.getForUser(userId);

    if (reminders.length === 0) {
      await ctx.editMessageText("У вас пока нет сохраненных напоминаний.");
      return;
    }

    await ctx.editMessageText(renderReminderList(reminders), {
      parse_mode: "HTML",
      reply_markup: buildReminderKeyboard(reminders),
    });
  }
}