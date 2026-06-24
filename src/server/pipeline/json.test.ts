import { describe, expect, test } from "bun:test";
import { extractJson, tryExtractJson } from "./json";

describe("extractJson", () => {
  test("parses plain JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  test("strips ```json fences", () => {
    expect(extractJson('```json\n{"a":1,"b":[2]}\n```')).toEqual({
      a: 1,
      b: [2],
    });
  });

  test("recovers an embedded object", () => {
    expect(extractJson('Sure! {"a":1} hope that helps')).toEqual({ a: 1 });
  });

  test("tryExtractJson returns undefined on garbage", () => {
    expect(tryExtractJson("no json here")).toBeUndefined();
  });
});
