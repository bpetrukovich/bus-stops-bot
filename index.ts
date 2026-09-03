import { IntervalPoller } from "./infrastructure/IntervalPoller";
import { LoggingUserReminder } from "./infrastructure/LoggingUserReminder";
import { LinkedomParser } from "./infrastructure/Parser";
import type { UserConfig } from "./infrastructure/UserConfig";
import { UserConfigProcessor } from "./UserConfigProcessor";

interface ServiceConfig {
  pollingIntervalSeconds: number;
}

const config: ServiceConfig = {
  pollingIntervalSeconds: 10,
};

const mockUserConfigs: UserConfig[] = [
  {
    link: "http://qr.minsktrans.by:13282/lookout/board?busstop=46226",
    transportName: "TP3",
    remindInMinutes: 10,
  },
];

const loggingUserReminder = new LoggingUserReminder();

const userConfigProcessor = new UserConfigProcessor(
  new LinkedomParser(),
  loggingUserReminder,
);

const poller = new IntervalPoller(
  userConfigProcessor,
  mockUserConfigs,
  config.pollingIntervalSeconds,
);

poller.start();
