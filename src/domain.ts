export type Format = {
  format_id: string;
  height: number | null;
  vcodec: string;
  acodec: string;
  ext: string;
};
export type Video = {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail: string;
  formats: Format[];
  subtitles: Record<string, unknown>;
};
export type Settings = {
  destination: string;
  browser: string;
  cookiesFile: string;
  appearance: string;
};
export type Job = {
  id: string;
  title: string;
  state: string;
  progress: number;
  speed: string;
  bytes: string;
  eta: string;
  message: string;
  path: string;
};
export function normalizeUrl(input: string): string {
  const u = new URL(input.trim());
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.port
  )
    throw Error("Enter a valid YouTube video URL.");
  let id = "";
  if (u.hostname === "youtu.be") id = u.pathname.slice(1);
  else if (
    ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(u.hostname)
  )
    id =
      u.pathname === "/watch"
        ? (u.searchParams.get("v") ?? "")
        : u.pathname.startsWith("/shorts/")
          ? u.pathname.slice(8).replace(/\/$/, "")
          : "";
  if (!/^[\w-]{11}$/.test(id))
    throw Error("Use a YouTube, youtu.be, or Shorts video link.");
  return `https://www.youtube.com/watch?v=${id}`;
}
export function timestamp(seconds: number): string {
  const n = Math.max(0, Math.floor(seconds));
  return [Math.floor(n / 3600), Math.floor(n / 60) % 60, n % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function parseTimestamp(text: string): number {
  if (!/^\d{2,}:\d{2}:\d{2}(\.\d{1,3})?$/.test(text))
    throw Error("Use HH:MM:SS, optionally with milliseconds.");
  const [h, m, s] = text.split(":").map(Number);
  if (m >= 60 || s >= 60) throw Error("Minutes and seconds must be below 60.");
  return h * 3600 + m * 60 + s;
}
export function validSection(a: number, b: number, d: number): boolean {
  return [a, b, d].every(Number.isFinite) && a >= 0 && a < b && b <= d;
}
export function codecFamily(v: string): string {
  if (/^(avc|h264)/.test(v)) return "h264";
  if (/^(hev|hvc|hevc)/.test(v)) return "hevc";
  if (/^av01/.test(v)) return "av1";
  if (/^vp0?9/.test(v)) return "vp9";
  return v;
}

export function preciseTimestamp(value: number): string {
  const ms = Math.max(0, Math.round(value * 1000));
  return (
    timestamp(Math.floor(ms / 1000)) +
    (ms % 1000 ? `.${String(ms % 1000).padStart(3, "0")}` : "")
  );
}
