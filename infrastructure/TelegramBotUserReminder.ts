import type { Transport } from "../Transport";
import type { UserReminder } from "../domain/UserReminder";
import type { MessageSender } from "./MessageSender";

export class TelegramBotUserReminder implements UserReminder {
  constructor(private telegramMessageSender: MessageSender) {}

  remind(userId: number, transports: Transport[]): void {
    const message = transports
      .map(
        (transport) =>
          `${transport.name} прибудет на ${transport.stopName} через ${Array.from(
            transport.minutes,
          )
            .map((minute) => `*${minute} мин*`)
            .join(" и ")}`,
      )
      .join("\n");

    this.telegramMessageSender.sendMessage(userId, message);
  }
}
