export interface CommandMetadata {
  name: string;
  description: string;
  usage?: string;
  example?: string;
  inMenu?: boolean;
}

const command = (name: string, meta: Omit<CommandMetadata, "name">): CommandMetadata => ({
  name,
  ...meta,
});

export const COMMAND_METADATA: CommandMetadata[] = [
  command("start", { description: "Начало работы с ботом" }),
  command("help", { description: "Список всех команд", inMenu: true }),
  command("add", {
    description: "Добавить напоминание",
    usage: "/add <остановка> <транспорт> <минут>",
    example: "/add 46226 TP3 20",
    inMenu: true,
  }),
  command("list", { description: "Мои напоминания", inMenu: true }),
  command("remove", {
    description: "Удалить напоминание",
    usage: "/remove <номер>",
    example: "/remove 2",
    inMenu: true,
  }),
  command("remove_all", { description: "Удалить все напоминания", inMenu: true }),
  command("disable", {
    description: "Выключить напоминание",
    usage: "/disable <номер>",
    example: "/disable 2",
    inMenu: true,
  }),
  command("enable", {
    description: "Включить напоминание",
    usage: "/enable <номер>",
    example: "/enable 2",
    inMenu: true,
  }),
];

export const MENU_COMMANDS = COMMAND_METADATA.filter((meta) => meta.inMenu);

export const BOT_DESCRIPTION =
  "Слежу за остановками и напоминаю, когда нужный транспорт уже близко. " +
  "Добавьте напоминание командой /add и я предупрежу вас за несколько минут до прибытия.";

export const BOT_SHORT_DESCRIPTION =
  "Напоминает, когда нужный транспорт уже близко к вашей остановке.";

const placeholders = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const hasUsage = (meta: CommandMetadata): meta is CommandMetadata & { usage: string } =>
  Boolean(meta.usage);

export function buildHelpText(): string {
  const lines = COMMAND_METADATA.filter(hasUsage).map((meta) => {
    const example = meta.example ? `\n  📌 ${meta.example}` : "";
    return `/${meta.name} — ${meta.description}\n  📝 ${placeholders(meta.usage)}${example}`;
  });

  return `<b>Доступные команды:</b>\n\n${lines.join("\n\n")}`;
}

export function buildStartText(): string {
  return [
    "Привет! Я помогу вам не пропустить нужный транспорт.",
    "",
    "Я слежу за остановками и напоминаю, когда транспорт уже близко.",
    "",
    "Пример команды:",
    "📌 <code>/add 46226 TP3 20</code>",
    "",
    "Это значит: напомнить мне о транспорте TP3 на остановке 46226 за 20 минут до прибытия.",
    "",
    "📋 Список всех команд — /help",
  ].join("\n");
}