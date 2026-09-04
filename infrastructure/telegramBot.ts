import { Bot } from "grammy";
import type { AppService } from "../application/AppService";
import type { UserReminderConfig } from "./UserReminderConfig";

export class TelegramBot {
  constructor(private reminderService: AppService) {}

  async start() {
    const bot = new Bot(Bun.env.BOT_TOKEN!);

    bot.command("my_reminders", (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const reminders = this.reminderService.get(userId);

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
    });

    // Format: /add_reminder <busstop> <transport> <minutes>
    bot.command("add_reminder", (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const args = ctx.match.trim().split(/\s+/);

      if (args.length < 3 || !ctx.match) {
        return ctx.reply(
          "❌ Неверный формат! Используйте команду так:\n`/add_reminder 46226 TP3 20`",
          { parse_mode: "Markdown" },
        );
      }

      const [busstop, transportName, remindStr] = args;
      if (!busstop || !transportName || !remindStr) {
        return ctx.reply(
          "❌ Неверный формат! Используйте команду так:\n`/add_reminder 46226 TP3 20`",
          { parse_mode: "Markdown" },
        );
      }
      const remindInMinutes = parseInt(remindStr, 10);

      if (isNaN(remindInMinutes)) {
        return ctx.reply("❌ Время напоминания (минуты) должно быть числом.");
      }

      const newReminder: UserReminderConfig = {
        busstop,
        transportName,
        remindInMinutes,
      };

      this.reminderService.add(userId, newReminder);

      ctx.reply(
        `✅ Напоминание успешно добавлено!\nОстановка: ${busstop}, Транспорт: ${transportName}`,
      );
    });

    bot.start();
  }
}
