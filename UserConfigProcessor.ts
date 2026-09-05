import type { MinsktransApi } from "./infrastructure/minsktransApi";
import type { LinkedomParser } from "./infrastructure/Parser";
import type { UserReminderConfig } from "./infrastructure/UserReminderConfig";
import type { Transport } from "./Transport";
import type { UserReminder } from "./UserReminder";

export class UserConfigProcessor {
  constructor(
    private httpParser: LinkedomParser,
    private UserReminder: UserReminder,
    private minsktransApi: MinsktransApi,
  ) {}

  async processAll(userId: number, userConfigs: UserReminderConfig[]) {
    Object.entries(
      Object.groupBy(userConfigs, (config) => config.busstop),
    ).forEach(([busstop, configs]) => {
      if (!configs) {
        throw new Error();
      }
      this.processOneBusStopReminders(userId, busstop, configs);
    });
  }

  async processOneBusStopReminders(
    userId: number,
    busstop: string,
    reminders: UserReminderConfig[],
  ) {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    const parsedTransports = this.httpParser.parse(htmlString);

    const transports = parsedTransports.map((transport) => {
      return {
        ...transport,
        busstop: busstop,
      };
    });

    const neededTransports: Transport[] = reminders
      .map(({ transportName, remindInMinutes }) =>
        transports
          .filter(({ name }) => name === transportName)
          .filter(({ minutes }) =>
            [...minutes].some((minute) => minute <= remindInMinutes),
          )
          .map((transport) => ({
            ...transport,
            minutes: new Set(
              [...transport.minutes].filter(
                (minute) => minute <= remindInMinutes,
              ),
            ),
          })),
      )
      .flat();

    if (neededTransports.length === 0) {
      console.log("No transports to remind");
      return;
    }

    this.UserReminder.remind(userId, neededTransports);
  }
}
