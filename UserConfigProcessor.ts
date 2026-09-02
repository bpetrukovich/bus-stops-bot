import type { UserConfig } from "./infrastructure";
import type { LinkedomParser } from "./infrastructure/Parser";

export class UserConfigProcessor {
  constructor(private httpParser: LinkedomParser) {}

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

    const neededTransports = transports.filter((transport) => {
      return transport.name === transportName;
    });

    console.log(neededTransports);
  }
}
