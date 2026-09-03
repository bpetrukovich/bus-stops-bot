import type { Transport } from "../Transport";
import type { UserReminder } from "../UserReminder";

export class LoggingUserReminder implements UserReminder {
  remind(transports: Transport[]): void {
    console.log(transports);
  }
}
