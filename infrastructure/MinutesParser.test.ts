import { expect, test } from "bun:test";
import { MinutesParser } from "./MinutesParser";

test("X мин.", () => {
  expect(MinutesParser.parse("5 мин.")).toBe(5);
  expect(MinutesParser.parse("10 мин.")).toBe(10);
  expect(MinutesParser.parse("1 мин.")).toBe(1);
  expect(MinutesParser.parse("100 мин.")).toBe(100);
});

test("<1 мин.", () => {
  expect(MinutesParser.parse("<1 мин.")).toBe(1);
});

test("-", () => {
  expect(MinutesParser.parse("-")).toBe(null);
});

test("unexpected format", () => {
  expect(MinutesParser.parse("wbejlba")).toBe(null);
  expect(MinutesParser.parse("0 мин.")).toBe(null);
});
