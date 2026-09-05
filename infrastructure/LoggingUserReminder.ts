import type { Transport } from "../Transport";
import type { UserReminder } from "../domain/UserReminder";

export class LoggingUserReminder implements UserReminder {
  constructor(private userReminder: UserReminder) {}

  remind(userId: number, transports: Transport[]): void {
    console.log(transports);
    this.userReminder.remind(userId, transports);
  }
}
