import type { LinkedomParser } from "./infrastructure/Parser";
import type { UserConfig } from "./infrastructure/UserConfig";
import type { UserReminder } from "./UserReminder";

export class UserConfigProcessor {
  constructor(
    private httpParser: LinkedomParser,
    private UserReminder: UserReminder,
  ) {}

  async processAll(userConfigs: UserConfig[]) {
    userConfigs.forEach((config) => this.process(config));
  }

  async process({ link, transportName, remindInMinutes }: UserConfig) {
    const response = await fetch(link);
    if (!response.ok) {
      throw new Error(
        `Minsktrans API error! status: ${response.status} ${response.statusText}`,
      );
    }

    const htmlString = await response.text();

    const transports = this.httpParser.parse(htmlString);

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
