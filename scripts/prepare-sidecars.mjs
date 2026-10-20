import {
  copyFileSync,
  mkdirSync,
  chmodSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
if (process.platform !== "darwin" || process.arch !== "arm64")
  throw Error(
    "This preparation script currently supports macOS Apple Silicon only.",
  );
mkdirSync("src-tauri/binaries", { recursive: true });
const manifest = [];
for (const name of ["yt-dlp", "ffmpeg", "ffprobe", "deno"]) {
  const src = `.tools/bin/${name}`,
    dst = `src-tauri/binaries/${name}-aarch64-apple-darwin`;
  const deps = spawnSync("otool", ["-L", src], { encoding: "utf8" });
  if (deps.status !== 0) throw Error(`Cannot inspect ${name}`);
  if (/\/opt\/homebrew|\/usr\/local/.test(deps.stdout))
    throw Error(`${name} has non-system dynamic dependencies`);
  copyFileSync(src, dst);
  chmodSync(dst, 0o755);
  const result = spawnSync("codesign", ["--force", "--sign", "-", dst], {
    encoding: "utf8",
  });
  if (result.status !== 0) throw Error(result.stderr);
  const version = spawnSync(
    src,
    [name === "ffmpeg" || name === "ffprobe" ? "-version" : "--version"],
    { encoding: "utf8" },
  );
  if (version.status !== 0) throw Error(`Cannot execute ${name}`);
  manifest.push({
    name,
    target: "aarch64-apple-darwin",
    sha256: createHash("sha256").update(readFileSync(dst)).digest("hex"),
    version: version.stdout.split("\n")[0],
  });
}
writeFileSync(
  "docs/tool-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log("Prepared four standalone, ad-hoc signed macOS sidecars.");
