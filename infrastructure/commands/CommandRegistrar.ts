import type { Api, RawApi } from "grammy";
import {
  BOT_DESCRIPTION,
  BOT_SHORT_DESCRIPTION,
  MENU_COMMANDS,
} from "./registry";
import type { CommandMetadata } from "./registry";

interface MenuCommand {
  command: string;
  description: string;
}

function toMenuCommand(meta: CommandMetadata): MenuCommand {
  return { command: meta.name, description: meta.description };
}

export async function registerBotMetadata(api: Api<RawApi>): Promise<void> {
  await api.setMyCommands(MENU_COMMANDS.map(toMenuCommand));
  await api.setMyDescription(BOT_DESCRIPTION);
  await api.setMyShortDescription(BOT_SHORT_DESCRIPTION);
}