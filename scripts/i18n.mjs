// TubeCutter's translations.
//   node scripts/i18n.mjs keys    print every text the app can show, as JSON
//   node scripts/i18n.mjs check   report texts missing from src/locales/<code>.json, translations nobody
//                                 uses any more, and translations whose {0} placeholders don't match
// The English text in the code is the key: t("…") in src/*.tsx, the messages thrown in src/domain.ts
// (shown through errorText) and the job states.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const CODES = [
  "ar",
  "bn",
  "de",
  "es",
  "fa",
  "fil",
  "fr",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "pt-BR",
  "ru",
  "te",
  "th",
  "tr",
  "vi",
  "zh-Hans",
];
const STATES = [
  "queued",
  "downloading",
  "merging",
  "processing",
  "paused",
  "completed",
  "failed",
  "canceled",
];
const TEXT = String.raw`"((?:[^"\\]|\\.)*)"`;

export function keys() {
  const found = new Set(STATES);
  for (const file of ["main.tsx", "domain.ts"]) {
    const code = readFileSync(join(src, file), "utf8");
    const pattern =
      file === "main.tsx"
        ? new RegExp(String.raw`\bt\(\s*${TEXT}`, "g")
        : new RegExp(String.raw`Error\(\s*${TEXT}`, "g");
    for (const m of code.matchAll(pattern)) found.add(JSON.parse(`"${m[1]}"`));
    if (file === "main.tsx")
      for (const m of code.matchAll(
        new RegExp(String.raw`throw Error\(\s*${TEXT}`, "g"),
      ))
        found.add(JSON.parse(`"${m[1]}"`));
  }
  return [...found];
}

const holes = (s) =>
  [...s.matchAll(/\{(\d+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(",");

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = keys();
  if (process.argv[2] === "keys") console.log(JSON.stringify(all, null, 1));
  else if (process.argv[2] === "check") {
    let bad = 0;
    for (const code of CODES) {
      let table;
      try {
        table = JSON.parse(
          readFileSync(join(src, "locales", `${code}.json`), "utf8"),
        );
      } catch {
        console.log(`${code}: no file`);
        bad++;
        continue;
      }
      const missing = all.filter((k) => !(k in table));
      const unused = Object.keys(table).filter((k) => !all.includes(k));
      const wrong = all.filter(
        (k) => k in table && holes(k) !== holes(table[k]),
      );
      for (const [label, list] of [
        ["missing", missing],
        ["unused", unused],
        ["placeholders differ", wrong],
      ])
        if (list.length) {
          bad += list.length;
          console.log(`${code}: ${label}:\n  ${list.join("\n  ")}`);
        }
    }
    const extra = readdirSync(join(src, "locales")).filter(
      (f) => !CODES.includes(f.replace(/\.json$/, "")),
    );
    if (extra.length) console.log("unknown language files:", extra.join(", "));
    console.log(
      bad
        ? `${bad} problem(s)`
        : `all ${CODES.length} languages complete (${all.length} texts each)`,
    );
    process.exit(bad ? 1 : 0);
  } else console.log("usage: node scripts/i18n.mjs keys|check");
}
