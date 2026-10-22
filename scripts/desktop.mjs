import { spawnSync } from "node:child_process";
import { delimiter, resolve } from "node:path";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
const env = {
  ...process.env,
  ...(existsSync(
    `.tools/cargo/bin/cargo${process.platform === "win32" ? ".exe" : ""}`,
  )
    ? {
        CARGO_HOME: resolve(".tools/cargo"),
        RUSTUP_HOME: resolve(".tools/rustup"),
      }
    : {}),
  PATH: `${resolve(".tools/cargo/bin")}${delimiter}${process.env.PATH ?? ""}`,
};
const require = createRequire(import.meta.url);
const r = spawnSync(
  process.execPath,
  [require.resolve("@tauri-apps/cli/tauri.js"), ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env,
  },
);
process.exit(r.status ?? 1);
