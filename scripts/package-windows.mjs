import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
if (process.platform !== "win32" || !["x64", "arm64"].includes(process.arch))
  throw Error("This packaging workflow targets Windows x64 and ARM64.");
function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) throw Error(`${cmd} failed (${r.status})`);
}
run(process.execPath, ["scripts/install-tools-windows.mjs"]);
run(process.execPath, [
  "scripts/desktop.mjs",
  "build",
  "--bundles",
  "nsis",
  "--config",
  "src-tauri/tauri.bundle.conf.json",
]);
const installer = resolve(
  `src-tauri/target/release/bundle/nsis/TubeCutter_0.1.1_${process.arch}-setup.exe`,
);
if (!existsSync(installer))
  throw Error(`Installer was not created: ${installer}`);
const hash = createHash("sha256").update(readFileSync(installer)).digest("hex");
console.log(`Built installer: ${installer}\nSHA256: ${hash}`);
