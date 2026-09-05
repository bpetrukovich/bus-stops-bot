import { Bot, Context, type CommandContext } from "grammy";
import {
  WrongBusstopError,
  type ReminderService,
  type UserReminderConfigDto,
} from "../application/ReminderService";
import {
  ReminderDoesNotExistError,
  RemindersNotFoundForUserError,
} from "./ReminderRepository";
import { ParsingError } from "./Parser";

export class TelegramBot {
  constructor(
    private bot: Bot,
    private appService: ReminderService,
  ) {}

  async listenCommands() {
    this.bot.command("list", (ctx) => this.handleMyReminders(ctx));

    // Format: /add <busstop> <transport> <minutes>
    this.bot.command("add", (ctx) => this.handleAddReminder(ctx));

    this.bot.command("remove", (ctx) => this.handleRemoveReminder(ctx));

    this.bot.command("remove_all", (ctx) => this.handleRemoveAll(ctx));

    // Format: /disable <key>
    this.bot.command("disable", (ctx) => this.handleSetActive(ctx, false));

    // Format: /enable <key>
    this.bot.command("enable", (ctx) => this.handleSetActive(ctx, true));

    console.log("Bot started");
  }

  private handleRemoveAll(ctx: CommandContext<Context>): void {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      this.appService.removeAll(userId);

      ctx.reply(`✅ Напоминания успешно удалены!`);
    } catch (e) {
      if (e instanceof RemindersNotFoundForUserError) {
        ctx.reply(
          "❌ Нет ни одного напоминания или не удалось найти данные пользователя.",
        );
        return;
      }
      ctx.reply("❌ Ошибка при удалении всех напоминаний.");
      return;
    }
  }

  private handleRemoveReminder(ctx: CommandContext<Context>): void {
    const userId = ctx.from?.id;
    if (!userId) return;

    const args = ctx.match.trim().split(/\s+/);

    if (args.length < 1 || !ctx.match) {
      ctx.reply("❌ Неверный формат! Используйте команду так:\n/remove 2", {
        parse_mode: "Markdown",
      });
      return;
    }

    const [keyStr] = args;
    if (!keyStr) {
      ctx.reply("❌ Неверный формат! Используйте команду так:\n/remove 2", {
        parse_mode: "Markdown",
      });
      return;
    }

    const key = parseInt(keyStr, 10);

    if (isNaN(key)) {
      ctx.reply("❌ Номер напоминания должен быть числом.");
      return;
    }

    try {
      this.appService.remove(userId, key);

      ctx.reply(`✅ Напоминание ${key} успешно удалено!`);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        ctx.reply("❌ Напоминание с таким номером не существует.");
        return;
      }
    }
  }

  private handleSetActive(ctx: CommandContext<Context>, isActive: boolean): void {
    const userId = ctx.from?.id;
    if (!userId) return;

    const args = ctx.match.trim().split(/\s+/);

    if (args.length < 1 || !ctx.match) {
      ctx.reply("❌ Неверный формат! Используйте команду так:\n/disable 2", {
        parse_mode: "Markdown",
      });
      return;
    }

    const [keyStr] = args;
    if (!keyStr) {
      ctx.reply("❌ Неверный формат! Используйте команду так:\n/disable 2", {
        parse_mode: "Markdown",
      });
      return;
    }

    const key = parseInt(keyStr, 10);

    if (isNaN(key)) {
      ctx.reply("❌ Номер напоминания должен быть числом.");
      return;
    }

    try {
      this.appService.setActive(userId, key, isActive);

      const action = isActive ? "включено" : "выключено";
      ctx.reply(`✅ Напоминание ${key} ${action}!`);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        ctx.reply("❌ Напоминание с таким номером не существует.");
        return;
      }
      ctx.reply("❌ Ошибка при изменении настройки напоминания.");
    }
  }

  private async handleMyReminders(ctx: CommandContext<Context>) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const reminders = this.appService.getForUser(userId);

    if (reminders.length === 0) {
      return ctx.reply("У вас пока нет сохраненных напоминаний.");
    }

    const response = reminders
      .map(
        (r, index) =>
          `${index + 1}. ${r.isActive ? "" : "🔇 (выключено)"} 🚏 Остановка: *${r.busstop}*, 🚌 Транспорт: *${r.transportName}*, ⏱ Напомнить за *${r.remindInMinutes}* мин.`,
      )
      .join("\n");

    ctx.reply(`Ваши напоминания:\n\n${response}`, {
      parse_mode: "Markdown",
    });
  }

  private async handleAddReminder(ctx: CommandContext<Context>): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;

    const args = ctx.match.trim().split(/\s+/);

    if (args.length < 3 || !ctx.match) {
      ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/add 46226 TP3 20",
        { parse_mode: "Markdown" },
      );
      return;
    }

    const [busstop, transportName, remindStr] = args;
    if (!busstop || !transportName || !remindStr) {
      ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/add 46226 TP3 20",
        { parse_mode: "Markdown" },
      );
      return;
    }
    const remindInMinutes = parseInt(remindStr, 10);

    if (isNaN(remindInMinutes)) {
      ctx.reply("❌ Время напоминания (минуты) должно быть числом.");
      return;
    }

    const newReminderDto: UserReminderConfigDto = {
      userId,
      busstop,
      transportName,
      remindInMinutes,
    };

    try {
      const stopName = await this.appService.add(newReminderDto);

      ctx.reply(
        `✅ Напоминание успешно добавлено!\nОстановка: ${stopName} (${busstop}), Транспорт: ${transportName}\nНапомнить за ${remindInMinutes} мин.`,
      );
    } catch (e) {
      console.error(e);
      if (e instanceof WrongBusstopError) {
        ctx.reply("❌ Неверный номер остановки.");
        return;
      }
      if (e instanceof ParsingError) {
        ctx.reply("❌ Неверный формат ответа минского транспорта.");
      }
    }
  }
}
