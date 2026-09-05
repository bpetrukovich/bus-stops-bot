import type { Transport } from "../Transport";

export interface UserReminder {
  remind(userId: number, transports: Transport[]): void;
}
