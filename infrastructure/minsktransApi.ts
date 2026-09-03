export class MinsktransApi {
  async getBusStop(busstop: string): Promise<string> {
    const response = await this.callBusStop(busstop);

    return await response.text();
  }

  async tryBusStop(busstop: string): Promise<undefined> {
    await this.callBusStop(busstop);
  }

  async callBusStop(busstop: string): Promise<Response> {
    const url = new URL("http://qr.minsktrans.by:13282/lookout/board");
    url.searchParams.append("busstop", busstop);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Minsktrans API error! status: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  }
}
