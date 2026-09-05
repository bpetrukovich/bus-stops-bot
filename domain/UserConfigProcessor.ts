import type { MinskTransFacade } from "../infrastructure/MinskTransFacade";
import type { UserReminderConfigEntity } from "../infrastructure/ReminderRepository";
import type { Transport } from "./Transport";
import type { UserReminder } from "./UserReminder";

export class UserConfigProcessor {
  constructor(
    private userReminder: UserReminder,
    private minskTransFacade: MinskTransFacade,
  ) {}

  async processAll(configs: UserReminderConfigEntity[]): Promise<void> {
    const groupedByBusstop = Object.groupBy(
      configs,
      (config) => config.busstop,
    );

    const perBusstop = await Promise.all(
      Object.entries(groupedByBusstop).map(
        async ([busstop, busstopConfigs]) => {
          if (!busstopConfigs) {
            throw new Error("No configs for busstop");
          }

          return {
            busstop,
            transports:
              await this.minskTransFacade.getBusStopTransports(busstop),
            configs: busstopConfigs,
          };
        },
      ),
    );

    const perUser = new Map<number, Transport[]>();

    perBusstop.forEach(({ transports, configs }) => {
      configs.forEach((config) => {
        const needed = this.getNeededTransports(transports, config);
        if (needed.length === 0) {
          return;
        }

        const userTransports = perUser.get(config.userId) ?? [];
        userTransports.push(...needed);
        perUser.set(config.userId, userTransports);
      });
    });

    perUser.forEach((transports, userId) => {
      this.userReminder.remind(userId, transports);
    });
  }

  private getNeededTransports(
    transports: Transport[],
    config: UserReminderConfigEntity,
  ): Transport[] {
    return transports
      .filter(({ name }) => name === config.transportName)
      .filter(({ minutes }) =>
        [...minutes].some((minute) => minute <= config.remindInMinutes),
      )
      .map((transport) => ({
        ...transport,
        minutes: new Set(
          [...transport.minutes].filter(
            (minute) => minute <= config.remindInMinutes,
          ),
        ),
      }));
  }
}
