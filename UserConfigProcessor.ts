import type { MinsktransApi } from "./infrastructure/minsktransApi";
import type { LinkedomParser } from "./infrastructure/Parser";
import type { UserReminderConfig } from "./infrastructure/UserReminderConfig";
import type { UserReminder } from "./UserReminder";

export class UserConfigProcessor {
  constructor(
    private httpParser: LinkedomParser,
    private UserReminder: UserReminder,
    private minsktransApi: MinsktransApi,
  ) {}

  async processAll(userConfigs: UserReminderConfig[]) {
    userConfigs.forEach((config) => this.process(config));
  }

  async process({ busstop, transportName, remindInMinutes }: UserReminderConfig) {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    const parsedTransports = this.httpParser.parse(htmlString);

    const transports = parsedTransports.map((transport) => {
      return {
        ...transport,
        busstop: busstop,
      };
    });

    const neededTransports = transports
      .filter(({ name }) => {
        return name === transportName;
      })
      .filter(({ minutes }) =>
        [...minutes].some((minute) => {
          return minute < remindInMinutes;
        }),
      )
      .map((transport) => {
        return {
          ...transport,
          minutes: new Set(
            [...transport.minutes].filter((minute) => {
              return minute < remindInMinutes;
            }),
          ),
        };
      });

    this.UserReminder.remind(neededTransports);
  }
}
