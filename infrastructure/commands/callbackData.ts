import type { CallbackQueryContext, Context } from "grammy";

export const TOGGLE_PREFIX = "tg";
export const REMOVE_PREFIX = "rm";
export const REMOVE_ALL_PREFIX = "rmall";

export interface KeyedCallback {
  userId?: number;
  key?: number;
  targetActive?: boolean;
}

export function parseKeyedCallback(
  data: string,
  prefix: string,
  withTarget: boolean,
): KeyedCallback {
  const parts = data.split(":");
  const expected = withTarget ? 4 : 3;

  if (parts.length !== expected || parts[0] !== prefix) {
    return {};
  }

  const userId = Number(parts[1]);
  const key = Number(parts[2]);
  if (!Number.isInteger(userId) || !Number.isInteger(key)) {
    return {};
  }

  return withTarget
    ? { userId, key, targetActive: parts[3] === "1" }
    : { userId, key };
}

export interface RemoveAllCallback {
  action?: string;
  userId?: number;
}

export function parseRemoveAllCallback(
  data: string,
): RemoveAllCallback {
  const parts = data.split(":");

  if (parts.length !== 3 || parts[0] !== REMOVE_ALL_PREFIX) {
    return {};
  }

  const userId = Number(parts[2]);
  if (!Number.isInteger(userId)) {
    return {};
  }

  return { action: parts[1], userId };
}

export function isOwner(
  ctx: CallbackQueryContext<Context>,
  userId: number,
): boolean {
  return ctx.from?.id === userId;
}