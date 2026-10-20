import { describe, it, expect } from "vitest";
import {
  normalizeUrl,
  parseTimestamp,
  timestamp,
  preciseTimestamp,
  validSection,
  outFromLength,
  codecFamily,
  updateQueue,
  clearQueueRows,
  isTrimmed,
  type Job,
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

it("links fractional Length to Out and rejects cuts outside the video", () => {
  expect(outFromLength(10.125, 2.25, 20)).toBe(12.375);
  expect(outFromLength(10, 10, 20)).toBe(20);
  expect(outFromLength(10.125, 12.375 - 10.125, 20)).toBe(12.375);
  for (const length of [0, -1, NaN, Infinity, 11])
    expect(() => outFromLength(10, length, 20)).toThrow();
});

describe("clearing completed queue rows", () => {
  const job = (id: string, state: string): Job => ({
    id,
    state,
    title: id,
    progress: 100,
    speed: "",
    bytes: "",
    eta: "",
    message: "",
    path: "",
  });
  it("removes successful and canceled jobs while preserving new active jobs", () => {
    const cleared = new Set(["done", "canceled"]);
    const rows = [
      job("done", "completed"),
      job("canceled", "canceled"),
      job("new", "downloading"),
    ];
    expect(clearQueueRows(rows, cleared).map((j) => j.id)).toEqual(["new"]);
  });
  it("ignores delayed completion and cleanup events after clearing", () => {
    const cleared = new Set(["done", "canceled"]);
    let rows = [job("active", "downloading")];
    rows = updateQueue(rows, job("done", "completed"), cleared);
    rows = updateQueue(rows, job("canceled", "canceled"), cleared);
    expect(rows.map((j) => j.id)).toEqual(["active"]);
    expect(
      updateQueue(rows, job("next", "completed"), cleared).map((j) => j.id),
    ).toEqual(["next", "active"]);
  });
});

describe("automatic full-video or section download", () => {
  it("downloads the full video for unchanged or reset boundaries", () => {
    expect(isTrimmed(0, 635, 635)).toBe(false);
    expect(isTrimmed(0, 12.345, 12.3454)).toBe(false);
  });
  it("cuts when either boundary or length changes", () => {
    expect(isTrimmed(1, 635, 635)).toBe(true);
    expect(isTrimmed(0, 634, 635)).toBe(true);
    expect(isTrimmed(0, outFromLength(0, 12, 635), 635)).toBe(true);
    expect(isTrimmed(0.001, 635, 635)).toBe(true);
  });
});
