import { RateCardRate } from "./types";

export type RateMap = Record<string, RateCardRate>;

export const rateKey = (kind: "Equipment" | "Staff", id: string) =>
  `${kind}:${id}`;
