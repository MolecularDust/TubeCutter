import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { resolve, join } from "node:path";
const toolDir = resolve(process.env.MEDIA_BIN_DIR ?? ".tools/bin");
const testDir = resolve(process.env.MEDIA_TEST_DIR ?? ".tools/integration");
const results = [];
for (const [name, ext, expected] of [
  ["whole", "mp4", 635],
  ["fast", "mkv", 5],
  ["precise", "mp4", 5],
]) {
  let file = join(testDir, `${name}.${ext}`);
  let normalized = false;
  if (name === "fast") {
    const scan = spawnSync(
      join(toolDir, "ffprobe"),
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-read_intervals",
        "%+#64",
        "-show_entries",
        "packet=pts_time",
        "-of",
        "json",
        file,
      ],
      { encoding: "utf8" },
    );
    const first = Math.min(
      ...JSON.parse(scan.stdout)
        .packets.map((p) => Number(p.pts_time))
        .filter(Number.isFinite),
    );
    if (first > 0.25) {
      const output = mkdtempSync(join(testDir, "verify-")) + "/fast.mkv";
      const remux = spawnSync(
        join(toolDir, "ffmpeg"),
        [
          "-v",
          "error",
          "-n",
          "-ss",
          String(first),
          "-i",
          file,
          "-map",
          "0",
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          output,
        ],
        { encoding: "utf8" },
      );
      if (remux.status !== 0)
        throw Error("Fast timestamp normalization failed");
      file = output;
      normalized = true;
    }
  }
  const p = spawnSync(
    join(toolDir, "ffprobe"),
    ["-v", "error", "-show_format", "-show_streams", "-of", "json", file],
    { encoding: "utf8" },
  );
  if (p.status !== 0) throw Error(`FFprobe failed: ${name}`);
  const v = JSON.parse(p.stdout);
  const video = v.streams.find((s) => s.codec_type === "video"),
    audio = v.streams.find((s) => s.codec_type === "audio");
  if (!video || !audio || video.height !== 144 || video.codec_name !== "h264")
    throw Error(`Wrong streams: ${name}`);
  const duration = Number(v.format.duration);
  const skew = Math.abs(
    Number(video.start_time ?? 0) - Number(audio.start_time ?? 0),
  );
  if (name === "precise" && Math.abs(duration - expected) > 0.25)
    throw Error("Precise duration exceeds tolerance");
  if (skew > 0.15) throw Error(`Stream start skew too large: ${name}`);
  const decode = spawnSync(
    join(toolDir, "ffmpeg"),
    [
      "-v",
      "error",
      "-i",
      file,
      "-fps_mode",
      "vfr",
      "-enc_time_base",
      "demux",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (decode.status !== 0 || decode.stderr.trim())
    throw Error(`Decode errors: ${name}: ${decode.stderr}`);
  results.push({
    name,
    status: "PASS",
    duration,
    expected,
    deviation: duration - expected,
    audioVideoStartSkew: skew,
    height: video.height,
    videoCodec: video.codec_name,
    audioCodec: audio.codec_name,
    fullDecode: "PASS",
    streamCopyTimestampNormalization: normalized,
    ...(name === "fast"
      ? {
          note: "Includes keyframe pre-roll; frame-accurate boundaries require Precise Cut.",
        }
      : {}),
  });
}
writeFileSync(
  process.env.MEDIA_TEST_REPORT ?? "docs/media-test-results.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
