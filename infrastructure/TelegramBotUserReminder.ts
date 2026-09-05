import type { Transport } from "../domain/Transport";
import type { UserReminder } from "../domain/UserReminder";
import { escapeHtml } from "./escapeHtml";
import type { MessageSender } from "./MessageSender";

export class TelegramBotUserReminder implements UserReminder {
  constructor(private telegramMessageSender: MessageSender) {}

  remind(userId: number, transports: Transport[]): void {
    const message = transports
      .map(
        (transport) =>
          `${escapeHtml(transport.name)} прибудет на <b>${escapeHtml(
            transport.stopName,
          )}</b> через ${Array.from(transport.minutes)
            .map((minute) => `<b>${minute} мин</b>`)
            .join(" и ")}`,
      )
      .join("\n");

    this.telegramMessageSender.sendMessage(userId, message);
  }
}