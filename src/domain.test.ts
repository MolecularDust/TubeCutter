import { describe, it, expect } from "vitest";
import {
  normalizeUrl,
  parseTimestamp,
  timestamp,
  preciseTimestamp,
  validSection,
  codecFamily,
} from "./domain";
describe("YouTube URL validation", () => {
  it("normalizes supported links and strips tracking", () => {
    for (const url of [
      "https://youtu.be/BaW_jenozKc?t=2",
      "https://www.youtube.com/watch?v=BaW_jenozKc&list=ignored",
      "https://youtube.com/shorts/BaW_jenozKc",
    ])
      expect(normalizeUrl(url)).toBe(
        "https://www.youtube.com/watch?v=BaW_jenozKc",
      );
  });
  it("rejects lookalikes, credentials, invalid IDs and protocols", () => {
    for (const url of [
      "https://youtube.com.evil.com/watch?v=BaW_jenozKc",
      "https://user@youtube.com/watch?v=BaW_jenozKc",
      "file:///tmp/a",
      "https://youtu.be/--exec",
      "https://youtube.com:444/watch?v=BaW_jenozKc",
    ])
      expect(() => normalizeUrl(url)).toThrow();
  });
});
describe("selection arithmetic", () => {
  it("parses precise timestamps", () => {
    expect(parseTimestamp("01:02:03.125")).toBe(3723.125);
    expect(timestamp(3723)).toBe("01:02:03");
  });
  it("rejects malformed times", () => {
    for (const text of ["00:60:00", "00:00:60", "-1:00:00", "12", "00:00:NaN"])
      expect(() => parseTimestamp(text)).toThrow();
  });
  it("validates interval and duration", () => {
    expect(validSection(1, 3, 10)).toBe(true);
    for (const v of [
      [-1, 3, 10],
      [3, 3, 10],
      [4, 3, 10],
      [1, 11, 10],
      [NaN, 3, 10],
      [0, Infinity, Infinity],
    ])
      expect(validSection(...(v as [number, number, number]))).toBe(false);
    expect(3.25 - 1.1).toBeCloseTo(2.15);
  });
});
it("maps actual codec metadata", () => {
  expect(codecFamily("avc1.640028")).toBe("h264");
  expect(codecFamily("av01.0.08M.08")).toBe("av1");
  expect(codecFamily("vp9")).toBe("vp9");
});

it("rounds milliseconds across second boundaries", () => {
  expect(preciseTimestamp(0.9996)).toBe("00:00:01");
  expect(preciseTimestamp(59.9996)).toBe("00:01:00");
  expect(preciseTimestamp(1.125)).toBe("00:00:01.125");
});
