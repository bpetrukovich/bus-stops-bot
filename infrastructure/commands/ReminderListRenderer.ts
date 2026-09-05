import { InlineKeyboard } from "grammy";
import type { UserReminderConfigEntity } from "../ReminderRepository";
import { escapeHtml } from "../escapeHtml";
import { REMOVE_PREFIX, TOGGLE_PREFIX } from "./callbackData";

export function renderReminderList(
  reminders: UserReminderConfigEntity[],
): string {
  const lines = reminders.map(
    (r) =>
      `${r.key}. ${r.isActive ? "" : "🔇 (выключено) "}` +
      `🚏 Остановка: <b>${escapeHtml(r.busstop)}</b>, ` +
      `🚌 Транспорт: <b>${escapeHtml(r.transportName)}</b>, ` +
      `⏱ Напомнить за <b>${r.remindInMinutes}</b> мин.`,
  );

  return `Ваши напоминания:\n\n${lines.join("\n")}`;
}

export function buildReminderKeyboard(
  reminders: UserReminderConfigEntity[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  reminders.forEach((reminder, index) => {
    if (index > 0) {
      keyboard.row();
    }
    keyboard.text(
      reminder.isActive ? "🔇 Выкл" : "🔊 Вкл",
      `${TOGGLE_PREFIX}:${reminder.userId}:${reminder.key}:${reminder.isActive ? 0 : 1}`,
    );
    keyboard.text(
      "🗑 Удалить",
      `${REMOVE_PREFIX}:${reminder.userId}:${reminder.key}`,
    );
  });

  return keyboard;
}