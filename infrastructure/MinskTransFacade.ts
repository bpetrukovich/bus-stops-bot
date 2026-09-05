import type { Transport } from "../Transport";
import type { MinsktransApi } from "./MinsktransApi";
import type { LinkedomParser } from "./Parser";

export class MinskTransFacade {
  constructor(
    private minsktransApi: MinsktransApi,
    private httpParser: LinkedomParser,
  ) {}

  async getStopName(busstop: string): Promise<string> {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    return this.httpParser.getStopName(htmlString);
  }

  async getBusStopTransports(busstop: string): Promise<Transport[]> {
    const htmlString = await this.minsktransApi.getBusStop(busstop);

    return this.httpParser
      .parse(htmlString)
      .map((transport) => ({ ...transport, busstop }));
  }
}
