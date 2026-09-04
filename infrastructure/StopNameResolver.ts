import type { MinsktransApi } from "./minsktransApi";
import type { LinkedomParser } from "./Parser";

export class StopNameResolver {
  constructor(
    private minsktransApi: MinsktransApi,
    private httpParser: LinkedomParser,
  ) {}

  async getStopName(busstop: string): Promise<string> {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    return this.httpParser.getStopName(htmlString);
  }
}
