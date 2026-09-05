import type { Bot } from "grammy";

export interface BotCommandHandler {
  register(bot: Bot): void;
}