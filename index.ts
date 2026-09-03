import { LinkedomParser } from "./infrastructure/Parser";
import type { UserConfig } from "./infrastructure/UserConfig";
import { UserConfigProcessor } from "./UserConfigProcessor";

const mockUserConfigs: UserConfig[] = [
  {
    link: "http://qr.minsktrans.by:13282/lookout/board?busstop=46226",
    transportName: "TP3п",
    remindInMinutes: 5,
  },
];

const userConfigProcessor = new UserConfigProcessor(new LinkedomParser());

userConfigProcessor.processAll(mockUserConfigs);
