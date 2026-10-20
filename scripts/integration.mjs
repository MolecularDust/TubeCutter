import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const out = resolve(".tools/integration");
mkdirSync(out, { recursive: true });
const common = [
  "--ignore-config",
  "--no-playlist",
  "--no-cache-dir",
  "--js-runtimes",
  `deno:${resolve(".tools/bin/deno")}`,
  "--ffmpeg-location",
  resolve(".tools/bin"),
  "--socket-timeout",
  "20",
  "--retries",
  "1",
  "--no-overwrites",
  "--no-quiet",
  "--newline",
  "--progress",
  "--progress-template",
  "download:PROGRESS|%(progress._percent_str)s|%(progress._speed_str)s|%(progress._downloaded_bytes_str)s|%(progress._eta_str)s",
  "--print",
  "after_move:FILE|%(filepath)s",
  "-f",
  "bv[height=144][vcodec~='^(avc1)']+ba/b[height=144][vcodec~='^(avc1)']",
  "--paths",
  out,
];
const video = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
async function run(name, args) {
  return await new Promise((resolve) => {
    const c = spawn(".tools/bin/yt-dlp", [...common, ...args, "--", video]);
    let log = "";
    c.stdout.on("data", (d) => {
      log += d;
      process.stdout.write(d);
    });
    c.stderr.on("data", (d) => {
      log += d;
      process.stderr.write(d);
    });
    c.on("close", (code) => {
      writeFileSync(`${out}/${name}.log`, log);
      resolve(code);
    });
  });
}
for (const [name, args] of [
  [
    "whole",
    [
      "--merge-output-format",
      "mp4",
      "--remux-video",
      "mp4",
      "-o",
      "whole.%(ext)s",
    ],
  ],
  [
    "fast",
    [
      "--merge-output-format",
      "mkv",
      "--remux-video",
      "mkv",
      "--download-sections",
      "*10-15",
      "--downloader-args",
      "ffmpeg_o:-progress pipe:1 -nostats",
      "-o",
      "fast.%(ext)s",
    ],
  ],
  [
    "precise",
    [
      "--merge-output-format",
      "mp4",
      "--remux-video",
      "mp4",
      "--download-sections",
      "*10-15",
      "--force-keyframes-at-cuts",
      "--downloader-args",
      "ffmpeg_o:-progress pipe:1 -nostats -c:v libx264 -crf 18 -c:a aac",
      "-o",
      "precise.%(ext)s",
    ],
  ],
]) {
  const code = await run(name, args);
  console.log(`RESULT ${name}: ${code === 0 ? "PASS" : "FAIL"}`);
  if (code) process.exitCode = 1;
}
