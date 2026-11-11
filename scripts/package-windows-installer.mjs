import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
if (process.platform !== "win32" || process.arch !== "x64")
  throw Error("This installer workflow targets Windows x64.");
const target = "x86_64-pc-windows-msvc";
const version = "0.1.1";
const makensis = join(
  process.env.LOCALAPPDATA ?? "",
  "tauri",
  "NSIS",
  "makensis.exe",
);
if (!existsSync(makensis))
  throw Error(
    `makensis not found at ${makensis}. Run npm run package:windows once so Tauri downloads NSIS.`,
  );
const exe = resolve("src-tauri/target/release/tubecutter.exe");
if (!existsSync(exe))
  throw Error(`Release build missing: ${exe}. Run npm run package:windows first.`);
// Stage the same files the Tauri installer ships, in the layout the app expects.
const payload = resolve(".tools/installer/payload");
rmSync(payload, { recursive: true, force: true });
mkdirSync(join(payload, "resources"), { recursive: true });
copyFileSync(exe, join(payload, "tubecutter.exe"));
for (const name of ["yt-dlp", "ffmpeg", "ffprobe", "deno"])
  copyFileSync(
    resolve(`src-tauri/binaries/${name}-${target}.exe`),
    join(payload, `${name}.exe`),
  );
copyFileSync(
  resolve("src-tauri/resources/cacert.pem"),
  join(payload, "resources", "cacert.pem"),
);
cpSync(resolve("LICENSES"), join(payload, "LICENSES"), { recursive: true });
copyFileSync(resolve("docs/DEPENDENCIES.md"), join(payload, "DEPENDENCIES.md"));
const outDir = resolve("src-tauri/target/release/bundle/setup-choice");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `TubeCutter-Setup_${version}_x64.exe`);
const r = spawnSync(
  makensis,
  [
    `/DPAYLOAD=${payload}`,
    `/DOUTFILE=${outFile}`,
    `/DICON=${resolve("src-tauri/icons/icon.ico")}`,
    `/DVERSION=${version}`,
    resolve("scripts/installer/TubeCutterSetup.nsi"),
  ],
  { stdio: "inherit" },
);
if (r.status !== 0) throw Error(`makensis failed (${r.status})`);
console.log(`Built setup with install and portable options: ${outFile}`);
