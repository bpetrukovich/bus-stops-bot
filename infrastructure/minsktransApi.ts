export class MinsktransApi {
  async getBusStop(busstop: string): Promise<string> {
    const url = new URL("http://qr.minsktrans.by:13282/lookout/board");
    url.searchParams.append("busstop", busstop);
    const response = await fetch(url);
    console.log("minsktrans api call");

    if (!response.ok) {
      throw new Error(
        `Minsktrans API error! status: ${response.status} ${response.statusText}`,
      );
    }

    return await response.text();
  }
}
