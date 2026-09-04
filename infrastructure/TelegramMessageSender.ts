import type { Api, RawApi } from "grammy";
import type { MessageSender } from "./MessageSender";

export class TelegramMessageSender implements MessageSender {
  constructor(private api: Api<RawApi>) {}
  sendMessage(userId: number, message: string): void {
    this.api.sendMessage(userId, message, { parse_mode: "Markdown" });
  }
}
