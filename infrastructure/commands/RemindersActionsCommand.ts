import {
  type Bot,
  type CallbackQueryContext,
  type CommandContext,
  type Context,
  InlineKeyboard,
} from "grammy";
import type { ReminderService } from "../../application/ReminderService";
import {
  ReminderDoesNotExistError,
  RemindersNotFoundForUserError,
} from "../ReminderRepository";
import {
  isOwner,
  parseRemoveAllCallback,
  REMOVE_ALL_PREFIX,
} from "./callbackData";
import { parseIntegerArg } from "./commandArgs";
import type { BotCommandHandler } from "./BotCommandHandler";

export class RemindersActionsCommand implements BotCommandHandler {
  constructor(private appService: ReminderService) {}

  register(bot: Bot): void {
    bot.command("remove", (ctx) => this.handleRemove(ctx));
    bot.command("disable", (ctx) => this.handleSetActive(ctx, false, "/disable 2"));
    bot.command("enable", (ctx) => this.handleSetActive(ctx, true, "/enable 2"));
    bot.command("remove_all", (ctx) => this.handleConfirmRemoveAll(ctx));
    bot.callbackQuery(new RegExp(`^${REMOVE_ALL_PREFIX}:`), (ctx) =>
      this.handleRemoveAllConfirm(ctx),
    );
  }

  private async handleRemove(ctx: CommandContext<Context>): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const key = parseIntegerArg(ctx, "/remove 2");
    if (key === undefined) {
      return;
    }

    try {
      await this.appService.remove(userId, key);
      await ctx.reply(`✅ Напоминание ${key} успешно удалено!`);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        await ctx.reply("❌ Напоминание с таким номером не существует.");
        return;
      }
      await ctx.reply("❌ Ошибка при удалении напоминания.");
    }
  }

  private async handleSetActive(
    ctx: CommandContext<Context>,
    isActive: boolean,
    formatExample: string,
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const key = parseIntegerArg(ctx, formatExample);
    if (key === undefined) {
      return;
    }

    try {
      await this.appService.setActive(userId, key, isActive);
      await ctx.reply(
        `✅ Напоминание ${key} ${isActive ? "включено" : "выключено"}!`,
      );
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        await ctx.reply("❌ Напоминание с таким номером не существует.");
        return;
      }
      await ctx.reply("❌ Ошибка при изменении настройки напоминания.");
    }
  }

  private async handleConfirmRemoveAll(
    ctx: CommandContext<Context>,
  ): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const keyboard = new InlineKeyboard()
      .text("✅ Да, удалить", `${REMOVE_ALL_PREFIX}:ok:${userId}`)
      .text("❌ Отмена", `${REMOVE_ALL_PREFIX}:cancel:${userId}`);

    await ctx.reply("Вы уверены, что хотите удалить все напоминания?", {
      reply_markup: keyboard,
    });
  }

  private async handleRemoveAllConfirm(
    ctx: CallbackQueryContext<Context>,
  ): Promise<void> {
    const { action, userId } = parseRemoveAllCallback(ctx.callbackQuery.data);
    if (userId === undefined) {
      await ctx.answerCallbackQuery("Неверные данные.");
      return;
    }
    if (!isOwner(ctx, userId)) {
      await ctx.answerCallbackQuery("Это не ваши напоминания.");
      return;
    }

    if (action === "cancel") {
      await ctx.answerCallbackQuery("Отменено");
      await ctx.editMessageText("❌ Удаление отменено.");
      return;
    }

    try {
      await this.appService.removeAll(userId);
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("✅ Все напоминания удалены.");
    } catch (e) {
      if (e instanceof RemindersNotFoundForUserError) {
        await ctx.answerCallbackQuery("Нет напоминаний");
        await ctx.editMessageText("У вас нет напоминаний.");
        return;
      }
      throw e;
    }
  }
}