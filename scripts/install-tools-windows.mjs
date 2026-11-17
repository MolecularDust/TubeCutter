import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
const arches = {
  x64: { target: "x86_64-pc-windows-msvc", suffix: "" },
  arm64: { target: "aarch64-pc-windows-msvc", suffix: "-arm64" },
};
const arch = arches[process.arch];
if (process.platform !== "win32" || !arch)
  throw Error("Windows tool installer targets Windows x64 and ARM64 only.");
const { target } = arch;
// Windows 10+ ships bsdtar, which reads zip archives. Git's GNU tar does not.
const tar = join(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "tar.exe",
);
const tools = JSON.parse(
  readFileSync(
    new URL(
      `../docs/tool-downloads-windows${arch.suffix}.json`,
      import.meta.url,
    ),
    "utf8",
  ),
);
const sha256 = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
for (const dir of [
  ".tools/downloads",
  ".tools/extract",
  ".tools/bin",
  "src-tauri/binaries",
])
  mkdirSync(dir, { recursive: true });
const manifest = [];
for (const tool of tools) {
  const archive = join(".tools/downloads", basename(tool.url));
  if (!existsSync(archive) || sha256(archive) !== tool.sha256) {
    console.log(`Downloading ${tool.name}`);
    const response = await fetch(tool.url);
    if (!response.ok) throw Error(`HTTP ${response.status}: ${tool.name}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (createHash("sha256").update(bytes).digest("hex") !== tool.sha256)
      throw Error(
        `Checksum mismatch for ${tool.name}. Refusing to use changed upstream content.`,
      );
    writeFileSync(archive, bytes);
  }
  let source = archive;
  if (tool.zip) {
    const extract = join(".tools/extract", tool.name);
    rmSync(extract, { recursive: true, force: true });
    mkdirSync(extract, { recursive: true });
    const r = spawnSync(tar, ["-xf", archive, "-C", extract], {
      stdio: "inherit",
    });
    if (r.status) throw Error(`Extraction failed: ${tool.name}`);
    source = join(extract, tool.member);
  }
  const exe = `${tool.name}.exe`;
  const staged = [
    join(".tools/bin", exe),
    join("src-tauri/binaries", `${tool.name}-${target}.exe`),
  ];
  for (const dst of staged) {
    copyFileSync(source, dst);
    chmodSync(dst, 0o755);
  }
  const versionArgs =
    tool.name === "ffmpeg" || tool.name === "ffprobe"
      ? ["-version"]
      : ["--version"];
  const version = spawnSync(staged[0], versionArgs, { encoding: "utf8" });
  if (version.status !== 0) throw Error(`Cannot execute ${tool.name}`);
  manifest.push({
    name: tool.name,
    target,
    sha256: sha256(staged[1]),
    version: version.stdout.split(/\r?\n/)[0],
  });
}
writeFileSync(
  `docs/tool-manifest-windows${arch.suffix}.json`,
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(`Prepared Windows ${process.arch} sidecars in src-tauri/binaries.`);
