import type { Transport } from "./Transport";

export interface UserReminder {
  remind(transports: Transport[]): void;
}
