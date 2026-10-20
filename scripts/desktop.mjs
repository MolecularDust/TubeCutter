import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
const env = {
  ...process.env,
  ...(existsSync(".tools/cargo/bin/cargo")
    ? {
        CARGO_HOME: resolve(".tools/cargo"),
        RUSTUP_HOME: resolve(".tools/rustup"),
      }
    : {}),
  PATH: `${resolve(".tools/cargo/bin")}:${process.env.PATH}`,
};
const r = spawnSync("node_modules/.bin/tauri", process.argv.slice(2), {
  stdio: "inherit",
  env,
});
process.exit(r.status ?? 1);
