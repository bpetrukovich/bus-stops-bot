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

  async processAll(userId: number, userConfigs: UserReminderConfig[]) {
    userConfigs.forEach((config) => this.process(userId, config));
  }

  async process(
    userId: number,
    { busstop, transportName, remindInMinutes }: UserReminderConfig,
  ) {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    let parsedTransports = this.httpParser.parse(htmlString);
    parsedTransports = [
      {
        stopName: "Теартальный",
        name: "ТР3",
        destination: "",
        minutes: new Set([10, 15]),
      },
    ];

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

    this.UserReminder.remind(userId, neededTransports);
  }
}
