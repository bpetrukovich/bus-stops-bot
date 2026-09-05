import type { CommandContext, Context } from "grammy";

export function parseIntegerArg(
  ctx: CommandContext<Context>,
  formatExample: string,
): number | undefined {
  if (!ctx.match) {
    replyFormatError(ctx, formatExample);
    return;
  }

  const args = ctx.match.trim().split(/\s+/);
  const [value] = args;

  if (args.length < 1 || !value) {
    replyFormatError(ctx, formatExample);
    return;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    ctx.reply("❌ Номер напоминания должен быть числом.");
    return;
  }

  return parsed;
}

export function replyFormatError(
  ctx: CommandContext<Context>,
  formatExample: string,
): void {
  ctx.reply(`❌ Неверный формат! Используйте команду так:\n${formatExample}`, {
    parse_mode: "HTML",
  });
}