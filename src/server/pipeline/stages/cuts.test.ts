import { describe, expect, test } from "bun:test";
import { buildConcatList, buildFfmpegArgs, perImageDuration } from "./cuts";

describe("cuts builders", () => {
  test("perImageDuration splits audio across images, with floor + fallback", () => {
    expect(perImageDuration(30, 6)).toBe(5);
    expect(perImageDuration(0, 4)).toBe(3); // no audio → fallback
    expect(perImageDuration(30, 0)).toBe(0);
    expect(perImageDuration(1, 10)).toBe(0.5); // min floor
  });

  test("buildConcatList writes durations and repeats the last file", () => {
    const list = buildConcatList([
      { path: "/a.png", durationSec: 2 },
      { path: "/b.png", durationSec: 2 },
    ]);
    expect(list.trim().split("\n")).toEqual([
      "file '/a.png'",
      "duration 2.000",
      "file '/b.png'",
      "duration 2.000",
      "file '/b.png'",
    ]);
  });

  test("buildFfmpegArgs muxes audio + uses -shortest only when audio is present", () => {
    const silent = buildFfmpegArgs({ listPath: "f.txt", outPath: "o.mp4" });
    expect(silent).toContain("concat");
    expect(silent).toContain("libx264");
    expect(silent.join(" ")).toContain("crop=1080:1920");
    expect(silent).not.toContain("-shortest");

    const withAudio = buildFfmpegArgs({
      listPath: "f.txt",
      audioPath: "a.mp3",
      outPath: "o.mp4",
    });
    expect(withAudio).toContain("a.mp3");
    expect(withAudio).toContain("aac");
    expect(withAudio).toContain("-shortest");
  });
});
