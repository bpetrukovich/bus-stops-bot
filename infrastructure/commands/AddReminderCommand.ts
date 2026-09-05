import type { Bot, Context, CommandContext } from "grammy";
import type { ReminderService } from "../../application/ReminderService";
import {
  MaxRemindersError,
  MAX_REMINDERS_PER_USER,
  WrongBusstopError,
  type UserReminderConfigDto,
} from "../../application/ReminderService";
import { escapeHtml } from "../escapeHtml";
import { replyFormatError } from "./commandArgs";
import type { BotCommandHandler } from "./BotCommandHandler";

const FORMAT_EXAMPLE = "/add 46226 TP3 20";

export class AddReminderCommand implements BotCommandHandler {
  constructor(private appService: ReminderService) {}

  register(bot: Bot): void {
    bot.command("add", (ctx) => this.handleAdd(ctx));
  }

  private async handleAdd(ctx: CommandContext<Context>): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const reminder = this.parseArgs(ctx);
    if (!reminder) {
      return;
    }

    try {
      const { stopName, alreadyExisted } = await this.appService.add(reminder);
      const action = alreadyExisted ? "обновлено" : "добавлено";

      await ctx.reply(
        `✅ Напоминание успешно ${action}!\n` +
          `Остановка: <b>${escapeHtml(stopName)}</b> (${escapeHtml(reminder.busstop)}), ` +
          `Транспорт: <b>${escapeHtml(reminder.transportName)}</b>\n` +
          `Напомнить за ${reminder.remindInMinutes} мин.`,
        { parse_mode: "HTML" },
      );
    } catch (e) {
      if (e instanceof WrongBusstopError) {
        await ctx.reply("❌ Неверный номер остановки.");
        return;
      }
      if (e instanceof MaxRemindersError) {
        await ctx.reply(
          `❌ Достигнут лимит: максимум ${MAX_REMINDERS_PER_USER} напоминаний. ` +
            "Удалите лишние через /list.",
        );
        return;
      }
      console.error(e);
      await ctx.reply("❌ Не удалось добавить напоминание. Попробуйте позже.");
    }
  }

  private parseArgs(ctx: CommandContext<Context>): UserReminderConfigDto | undefined {
    const userId = ctx.from?.id;
    if (!userId) return;

    if (!ctx.match) {
      replyFormatError(ctx, FORMAT_EXAMPLE);
      return;
    }

    const args = ctx.match.trim().split(/\s+/);
    const [busstop, transportName, remindStr] = args;

    if (args.length < 3 || !busstop || !transportName || !remindStr) {
      replyFormatError(ctx, FORMAT_EXAMPLE);
      return;
    }

    const remindInMinutes = parseInt(remindStr, 10);
    if (isNaN(remindInMinutes) || remindInMinutes <= 0) {
      ctx.reply("❌ Время напоминания (минуты) должно быть положительным числом.");
      return;
    }

    return { userId, busstop, transportName, remindInMinutes };
  }
}