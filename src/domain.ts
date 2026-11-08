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

export function outFromLength(
  start: number,
  length: number,
  duration: number,
): number {
  const out = Math.round((start + length) * 1000) / 1000;
  if (
    !Number.isFinite(length) ||
    length <= 0 ||
    !validSection(start, out, duration)
  )
    throw Error("Length must be positive and fit within the video.");
  return out;
}

export function updateQueue(
  jobs: Job[],
  incoming: Job,
  clearedIds: ReadonlySet<string>,
): Job[] {
  if (clearedIds.has(incoming.id)) return jobs;
  return jobs.some((j) => j.id === incoming.id)
    ? jobs.map((j) => (j.id === incoming.id ? incoming : j))
    : [incoming, ...jobs];
}
export function clearQueueRows(
  jobs: Job[],
  clearedIds: ReadonlySet<string>,
): Job[] {
  return jobs.filter((j) => !clearedIds.has(j.id));
}

/** Match the millisecond precision shown by the In/Out fields. */
export function isTrimmed(
  start: number,
  end: number,
  duration: number,
): boolean {
  return (
    Math.round(start * 1000) !== 0 ||
    Math.round(end * 1000) !== Math.round(duration * 1000)
  );
}

export type SeekTarget = { position: number; expires: number };
export function timelineTime(
  clientX: number,
  left: number,
  width: number,
  duration: number,
): number {
  if (
    ![clientX, left, width, duration].every(Number.isFinite) ||
    width <= 0 ||
    duration <= 0
  )
    return 0;
  return Math.max(0, Math.min(duration, ((clientX - left) / width) * duration));
}
export function acceptPlayerTime(
  value: number,
  pending: SeekTarget | null,
  dragging: boolean,
  now: number,
): boolean {
  if (!Number.isFinite(value) || value < 0 || dragging) return false;
  return (
    !pending ||
    Math.abs(value - pending.position) <= 1 ||
    now >= pending.expires
  );
}

export function paddedSection(
  start: number,
  end: number,
  padding: number,
  duration: number,
): [number, number] {
  const extra = Math.max(0, Math.min(99, Math.trunc(padding)));
  return [Math.max(0, start - extra), Math.min(duration, end + extra)];
}

export function stepPaddedLength(
  start: number,
  end: number,
  padding: number,
  duration: number,
  delta: number,
): number {
  const [, paddedEnd] = paddedSection(start, end, padding, duration);
  if (delta > 0 && paddedEnd >= duration) return end;
  const target = Math.min(duration, paddedEnd + delta);
  return Math.min(duration, Math.max(start + 0.01, target - padding));
}

export function outFromPaddedLength(
  start: number,
  end: number,
  padding: number,
  duration: number,
  length: number,
): number {
  const [clipStart, clipEnd] = paddedSection(start, end, padding, duration);
  const target = Math.round((clipStart + length) * 1000) / 1000;
  const extra = Math.max(0, Math.min(99, Math.trunc(padding)));
  const out = target === clipEnd ? end : target - extra;
  if (
    !Number.isFinite(length) ||
    length <= 0 ||
    target > duration ||
    !validSection(start, out, duration)
  )
    throw Error(
      "Length must be positive and fit within the video and padding.",
    );
  return Math.round(out * 1000) / 1000;
}

export function canClearQueue(jobs: readonly Job[]): boolean {
  return jobs.some((job) =>
    ["completed", "canceled", "failed"].includes(job.state),
  );
}
