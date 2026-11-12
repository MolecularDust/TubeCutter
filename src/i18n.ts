// TubeCutter's languages. The English text in the code is the key: t("Cancel")
// looks "Cancel" up in the chosen language and falls back to the English.
// {0}, {1} … in a text are filled from the extra arguments, in any order.
// Translations: src/locales/<code>.json (checked by `npm run i18n:check`).
const files = import.meta.glob<Record<string, string>>("./locales/*.json", {
  eager: true,
  import: "default",
});

export const codes = [
  "en",
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
] as const;
export const rtlCodes: readonly string[] = ["ar", "fa"];

const storageKey = "tubecutter.language";
const tables: Record<string, Record<string, string>> = {};
for (const [path, table] of Object.entries(files))
  tables[path.replace(/^.*\/(.+)\.json$/, "$1")] = table;

/** One of `codes` for a name such as "ru", "pt-PT", "zh-CN" or "tl"; undefined when there is none. */
export function matchLanguage(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (lower.startsWith("zh"))
    return /hant|tw|hk|mo/.test(lower) ? undefined : "zh-Hans";
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("tl")) return "fil";
  return codes.find(
    (c) => lower === c.toLowerCase() || lower.startsWith(`${c.toLowerCase()}-`),
  );
}

function stored(): string {
  try {
    const value = localStorage.getItem(storageKey) ?? "";
    return codes.includes(value as never) ? value : "";
  } catch {
    return "";
  }
}

/** The language picked in the app, or "" when it follows the system. */
export let chosen = stored();

function systemLanguage(): string {
  for (const name of navigator.languages ?? [navigator.language]) {
    const code = matchLanguage(name);
    if (code) return code;
  }
  return "en";
}

export let current = chosen || systemLanguage();

/** Applies the choice ("" = same as the system) and returns the language now in use. */
export function chooseLanguage(code: string): string {
  chosen = codes.includes(code as never) ? code : "";
  try {
    if (chosen) localStorage.setItem(storageKey, chosen);
    else localStorage.removeItem(storageKey);
  } catch {
    // The choice then lasts until the app closes.
  }
  current = chosen || systemLanguage();
  applyDocumentLanguage();
  return current;
}

export function applyDocumentLanguage() {
  document.documentElement.lang = current;
  document.documentElement.dir = rtlCodes.includes(current) ? "rtl" : "ltr";
}

export function t(text: string, ...args: (string | number)[]): string {
  const translated = tables[current]?.[text] ?? text;
  return translated.replace(/\{(\d+)\}/g, (whole, i) =>
    args[Number(i)] === undefined ? whole : String(args[Number(i)]),
  );
}

/** A thrown value as text the person can read, in the chosen language. */
export function errorText(e: unknown): string {
  return t(e instanceof Error ? e.message : String(e));
}

/** Language names, each written in the current language, alphabetically. */
export function languageChoices(): { code: string; name: string }[] {
  const names = new Intl.DisplayNames([current], { type: "language" });
  return codes
    .map((code) => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, current));
}
