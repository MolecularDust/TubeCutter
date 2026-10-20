import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const results = [];
for (const [name, ext, expected] of [
  ["whole", "mp4", 635],
  ["fast", "mkv", 5],
  ["precise", "mp4", 5],
]) {
  const file = `.tools/integration/${name}.${ext}`;
  const p = spawnSync(
    ".tools/bin/ffprobe",
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
  if (skew > (name === "fast" ? 3 : 0.15))
    throw Error(`Stream start skew too large: ${name}`);
  const decode = spawnSync(
    ".tools/bin/ffmpeg",
    ["-v", "error", "-i", file, "-f", "null", "-"],
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
  });
}
writeFileSync(
  "docs/media-test-results.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
