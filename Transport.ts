export type Transport = {
  stopName: string;
  name: string;
  destination: string;
  nearestMinutes: number | null;
  followingMinutes: number | null;
};
