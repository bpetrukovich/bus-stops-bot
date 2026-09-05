import { expect, test } from "bun:test";
import { escapeHtml } from "./escapeHtml";

test("escapes special characters", () => {
  expect(escapeHtml(`<b>&"'`)).toBe("&lt;b&gt;&amp;&quot;&#39;");
});

test("leaves plain text unchanged", () => {
  expect(escapeHtml("TP3 46226")).toBe("TP3 46226");
});

test("escapes user transport names with formatting chars", () => {
  expect(escapeHtml("A_2 (full)")).toBe("A_2 (full)");
});