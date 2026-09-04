import { Bot, Context, type CommandContext } from "grammy";
import {
  WrongBusstopError,
  type AppService,
  type UserReminderConfigDto,
} from "../application/AppService";
import {
  ReminderDoesNotExistError,
  RemindersNotFoundForUserError,
} from "./ReminderRepository";

export class TelegramBot {
  constructor(private reminderService: AppService) {}

  async start() {
    const bot = new Bot(Bun.env.BOT_TOKEN!);

    bot.command("my_reminders", (ctx) => this.handleMyReminders(ctx));

    // Format: /add_reminder <busstop> <transport> <minutes>
    bot.command("add_reminder", (ctx) => this.handleAddReminder(ctx));

    bot.command("remove_reminder", (ctx) => this.handleRemoveReminder(ctx));

    bot.command("remove_all", (ctx) => this.handleRemoveAll(ctx));

    bot.command("start_reminders", (ctx) => this.handleStartReminders(ctx));

    bot.command("stop_reminders", (ctx) => this.handleStopReminders(ctx));

    bot.start();

    console.log("Bot started");
  }

  handleRemoveAll(ctx: CommandContext<Context>): void {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      this.reminderService.removeAll(userId);

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

  handleRemoveReminder(ctx: CommandContext<Context>): void {
    const userId = ctx.from?.id;
    if (!userId) return;

    const args = ctx.match.trim().split(/\s+/);

    if (args.length < 1 || !ctx.match) {
      ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/remove_reminder 2",
        { parse_mode: "Markdown" },
      );
      return;
    }

    const [keyStr] = args;
    if (!keyStr) {
      ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/remove_reminder 2",
        { parse_mode: "Markdown" },
      );
      return;
    }

    const key = parseInt(keyStr, 10);

    if (isNaN(key)) {
      ctx.reply("❌ Номер напоминания должен быть числом.");
      return;
    }

    try {
      this.reminderService.remove(userId, key);

      ctx.reply(`✅ Напоминание ${key} успешно удалено!`);
    } catch (e) {
      if (e instanceof ReminderDoesNotExistError) {
        ctx.reply("❌ Напоминание с таким номером не существует.");
        return;
      }
    }
  }

  handleStopReminders(ctx: CommandContext<Context>): unknown {
    const userId = ctx.from?.id;
    if (!userId) return;

    throw new Error("Method not implemented.");
  }
  handleStartReminders(ctx: CommandContext<Context>): unknown {
    const userId = ctx.from?.id;
    if (!userId) return;

    throw new Error("Method not implemented.");
  }

  async handleMyReminders(ctx: CommandContext<Context>) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const reminders = this.reminderService.getForUser(userId);

    if (reminders.length === 0) {
      return ctx.reply("У вас пока нет сохраненных напоминаний.");
    }

    const response = reminders
      .map(
        (r, index) =>
          `${index + 1}. 🚏 Остановка: *${r.busstop}*, 🚌 Транспорт: *${r.transportName}*, ⏱ Напомнить за *${r.remindInMinutes}* мин.`,
      )
      .join("\n");

    ctx.reply(`Ваши напоминания:\n\n${response}`, {
      parse_mode: "Markdown",
    });
  }

  async handleAddReminder(ctx: CommandContext<Context>) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const args = ctx.match.trim().split(/\s+/);

    if (args.length < 3 || !ctx.match) {
      return ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/add_reminder 46226 TP3 20",
        { parse_mode: "Markdown" },
      );
    }

    const [busstop, transportName, remindStr] = args;
    if (!busstop || !transportName || !remindStr) {
      return ctx.reply(
        "❌ Неверный формат! Используйте команду так:\n/add_reminder 46226 TP3 20",
        { parse_mode: "Markdown" },
      );
    }
    const remindInMinutes = parseInt(remindStr, 10);

    if (isNaN(remindInMinutes)) {
      return ctx.reply("❌ Время напоминания (минуты) должно быть числом.");
    }

    const newReminderDto: UserReminderConfigDto = {
      userId,
      busstop,
      transportName,
      remindInMinutes,
    };

    try {
      const stopName = await this.reminderService.add(newReminderDto);

      ctx.reply(
        `✅ Напоминание успешно добавлено!\nОстановка: ${stopName} (${busstop}), Транспорт: ${transportName}\nНапомнить за ${remindInMinutes} мин.`,
      );
    } catch (e) {
      if (e instanceof WrongBusstopError) {
        return ctx.reply("❌ Неверный номер остановки.");
      }
    }
  }
}
