import type { Bot, Context } from "grammy";
import { escapeHtml } from "../escapeHtml";
import { buildHelpText, buildStartText } from "./registry";
import type { BotCommandHandler } from "./BotCommandHandler";

export class OnboardingCommand implements BotCommandHandler {
  register(bot: Bot): void {
    bot.command("start", (ctx) => this.handleStart(ctx));
    bot.command("help", (ctx) => this.handleHelp(ctx));
    bot.on("message:text", (ctx) => this.handleUnknown(ctx));
  }

  private handleStart(ctx: Context): void {
    ctx.reply(buildStartText(), { parse_mode: "HTML" });
  }

  private handleHelp(ctx: Context): void {
    ctx.reply(buildHelpText(), { parse_mode: "HTML" });
  }

  private async handleUnknown(ctx: Context): Promise<void> {
    const text = ctx.msg?.text;
    if (!text) {
      return;
    }

    if (text.startsWith("/")) {
      await ctx.reply(
        `Неизвестная команда <code>${escapeHtml(text)}</code>. Наберите /help для списка команд.`,
        { parse_mode: "HTML" },
      );
      return;
    }

    await ctx.reply("Используйте команды бота. Список команд — /help");
  }
}