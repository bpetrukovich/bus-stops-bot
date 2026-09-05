export type Transport = {
  stopName: string;
  name: string;
  destination: string;
  minutes: Set<number>;
  busstop: string;
};

export type ParsedTransport = Omit<Transport, "busstop">;
