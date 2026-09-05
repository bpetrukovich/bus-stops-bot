import { expect, test } from "bun:test";
import { buildHelpText, buildStartText } from "./registry";
import { escapeHtml } from "../escapeHtml";

test("help text escapes placeholder brackets for HTML mode", () => {
  const text = buildHelpText();

  expect(text).toContain("&lt;остановка&gt;");
  expect(text).toContain("&lt;номер&gt;");
  expect(text).not.toContain("<остановка>");
  expect(text).toContain("<b>Доступные команды:</b>");
});

test("help text contains all commands with usage", () => {
  const text = buildHelpText();

  for (const command of ["add", "remove", "disable", "enable"]) {
    expect(text).toContain(`/${command}`);
  }
});

test("start text has no unsupported HTML tags", () => {
  const text = buildStartText();

  expect(text).toContain("<code>/add 46226 TP3 20</code>");
  expect(escapeHtml(text).length).toBeGreaterThan(0);
});

test("start text only uses supported tags", () => {
  const text = buildStartText();
  const unsupportedTags = text.match(/<(\/?)([a-zA-Z0-9]+)[^>]*>/g);
  const tags = (unsupportedTags ?? [])
    .map((tag) => tag.replace(/^<\//, "").replace(/[^a-zA-Z0-9]/g, ""))
    .filter((tag) => !["code", "b", "i", "u", "s", "a"].includes(tag));

  expect(tags).toEqual([]);
});