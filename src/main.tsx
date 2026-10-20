import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  normalizeUrl,
  timestamp,
  preciseTimestamp,
  parseTimestamp,
  validSection,
  codecFamily,
  type Video,
  type Settings,
  type Job,
} from "./domain";
import "./style.css";
const defaults: Settings = {
  destination: "",
  browser: "",
  cookiesFile: "",
  appearance: "system",
};
function App() {
  const [settings, setSettings] = useState<Settings>(defaults),
    [showSettings, setShowSettings] = useState(false),
    [url, setUrl] = useState(""),
    [video, setVideo] = useState<Video | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [playerError, setPlayerError] = useState(""),
    [origin, setOrigin] = useState(""),
    [ready, setReady] = useState(false),
    [section, setSection] = useState(false),
    [start, setStart] = useState(0),
    [end, setEnd] = useState(0),
    [time, setTime] = useState(0),
    [precise, setPrecise] = useState(false),
    [container, setContainer] = useState("mp4"),
    [resolution, setResolution] = useState(""),
    [codec, setCodec] = useState("auto"),
    [audio, setAudio] = useState("best"),
    [mode, setMode] = useState("video"),
    [subtitle, setSubtitle] = useState(""),
    [jobs, setJobs] = useState<Job[]>([]);
  const iframe = useRef<HTMLIFrameElement>(null),
    previewing = useRef<false | "seeking" | "playing">(false),
    token = useRef(crypto.randomUUID()),
    timeline = useRef<HTMLDivElement>(null);
  const send = (action: string, value?: number) =>
    iframe.current?.contentWindow?.postMessage(
      { token: token.current, action, value },
      origin,
    );
  const act = async (fn: () => Promise<unknown>) => {
    try {
      setError("");
      await fn();
    } catch (e) {
      setError(String(e));
    }
  };
  useEffect(() => {
    if (!isTauri()) {
      setError(
        "Open the desktop application to analyze and download. Browser mode is a UI preview.",
      );
      return;
    }
    let dispose: (() => void) | undefined;
    let disposed = false;
    invoke<Settings>("get_settings")
      .then(setSettings)
      .catch((e) => setError(String(e)));
    invoke<string>("player_origin")
      .then(setOrigin)
      .catch((e) => setError(String(e)));
    invoke<Job[]>("jobs")
      .then(setJobs)
      .catch((e) => setError(String(e)));
    listen<Job>("job", (e) =>
      setJobs((old) =>
        old.some((j) => j.id === e.payload.id)
          ? old.map((j) => (j.id === e.payload.id ? e.payload : j))
          : [e.payload, ...old],
      ),
    )
      .then((fn) => {
        if (disposed) fn();
        else dispose = fn;
      })
      .catch((e) => setError(String(e)));
    return () => {
      disposed = true;
      dispose?.();
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.appearance;
  }, [settings.appearance]);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (
        e.source !== iframe.current?.contentWindow ||
        e.origin !== origin ||
        e.data?.token !== token.current
      )
        return;
      const { type, value } = e.data;
      if (type === "time") {
        setTime(value);
        if (
          previewing.current === "seeking" &&
          value >= start - 0.25 &&
          value < end
        )
          previewing.current = "playing";
        if (previewing.current === "playing" && value >= end) {
          send("pause");
          previewing.current = false;
        }
      }
      if (type === "ready") setReady(true);
      if (type === "error") {
        setReady(false);
        setPlayerError(
          value === 153
            ? "YouTube rejected the player identity (error 153). Try reopening the app; this WebView may not send the required Referer."
            : [101, 150].includes(value)
              ? "The owner does not allow this video to be embedded. Downloads may still be available."
              : `YouTube player error ${value}. Check video availability and network access.`,
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [origin, start, end]);
  const setIn = () => setStart(Math.max(0, Math.min(time, end - 0.01)));
  const setOut = () =>
    setEnd(Math.min(video?.duration ?? end, Math.max(time, start + 0.01)));
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,button,[contenteditable]",
        ) ||
        showSettings ||
        !ready
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        send("toggle");
      }
      if (section && e.key.toLowerCase() === "i") setIn();
      if (section && e.key.toLowerCase() === "o") setOut();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const save = async (next: Settings) => {
    await invoke("save_settings", { settings: next });
    setSettings(next);
  };
  const analyze = () =>
    act(async () => {
      setBusy(true);
      setPlayerError("");
      setReady(false);
      previewing.current = false;
      try {
        const clean = normalizeUrl(url);
        setUrl(clean);
        const v = await invoke<Video>("analyze", { url: clean });
        if (!v.duration || !Number.isFinite(v.duration))
          throw Error("This video has no finite duration.");
        setVideo(v);
        setStart(0);
        setEnd(v.duration);
        setTime(0);
        setResolution("");
        setCodec("auto");
        setSubtitle("");
        token.current = crypto.randomUUID();
      } finally {
        setBusy(false);
      }
    });
  const formats =
    video?.formats.filter((f) => f.height && f.vcodec !== "none") ?? [];
  const heights = [...new Set(formats.map((f) => f.height!))].sort(
    (a, b) => b - a,
  );
  const available = formats.filter(
    (f) => !resolution || f.height === Number(resolution),
  );
  const codecs = new Set(available.map((f) => codecFamily(f.vcodec)));
  const compatible =
    container === "mkv" ||
    codec === "h264" ||
    codec === "hevc" ||
    codec === "av1" ||
    codec === "auto";
  const selectionValid =
    !section || (!!video && validSection(start, end, video.duration));
  const enqueue = () =>
    act(async () => {
      if (!video || !selectionValid)
        throw Error("Select a valid video section.");
      await invoke("enqueue", {
        request: {
          url: video.url,
          title: video.title,
          destination: settings.destination,
          container,
          resolution: resolution ? Number(resolution) : null,
          codec,
          audio,
          mode,
          subtitle,
          section: section ? [start, end] : null,
          precise: section && precise,
          duration: video.duration,
        },
      });
    });
  function drag(e: React.PointerEvent, which: "in" | "out") {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (event: PointerEvent) => {
      const r = timeline.current!.getBoundingClientRect();
      const n = Math.max(
        0,
        Math.min(
          video!.duration,
          ((event.clientX - r.left) / r.width) * video!.duration,
        ),
      );
      if (which === "in") setStart(Math.min(n, end - 0.01));
      else setEnd(Math.max(n, start + 0.01));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }
  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="app-icon">↓</span>
          <div>
            <strong>Video Downloader</strong>
            <small>Your videos. Your way.</small>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)}>
          ◎ <span>Account & Settings</span>
        </button>
      </header>
      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">YOUR NEXT DOWNLOAD</p>
            <h1>Save something worth keeping.</h1>
          </div>
          <span className="badge">
            ●{" "}
            {settings.browser || settings.cookiesFile
              ? "Browser session"
              : "Anonymous"}
          </span>
        </div>
        <section className="url-card">
          <label htmlFor="url">YouTube video link</label>
          <div className="url-row">
            <span>↗</span>
            <input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") analyze();
              }}
              placeholder="Paste a YouTube, Shorts, or youtu.be link"
            />
            <button
              onClick={() =>
                act(async () => setUrl(await navigator.clipboard.readText()))
              }
            >
              Paste
            </button>
            <button
              className="primary"
              disabled={busy || !url}
              onClick={analyze}
            >
              {busy ? "Analyzing…" : "Analyze →"}
            </button>
          </div>
        </section>
        {error && (
          <div className="notice error" role="alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}
        <section className="video-card">
          <div className="video-info">
            <div>
              <span className="eyebrow">VIDEO PREVIEW</span>
              <h2>{video?.title ?? "A little inspiration. Ready to save."}</h2>
              <p>
                {video
                  ? `${video.channel}  ·  ${timestamp(video.duration)}  ·  ${Math.max(...heights, 0)}p available`
                  : "Analyze a video to see its details and available formats."}
              </p>
            </div>
            {video && <span className="badge">YouTube</span>}
          </div>
          <div className="player">
            {video && origin ? (
              <iframe
                ref={iframe}
                key={video.id + token.current}
                title="YouTube video preview"
                src={`${origin}/player?id=${video.id}&token=${token.current}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="empty-player">
                <div className="play-symbol">▶</div>
                <h3>Your video starts here</h3>
                <p>Paste a link above to preview, trim, and download.</p>
                <span>YOUTUBE VIDEO PREVIEW</span>
              </div>
            )}
          </div>
          {playerError && <div className="notice error">{playerError}</div>}
          <div className="trim">
            <label className="check">
              <input
                type="checkbox"
                checked={section}
                disabled={!video}
                onChange={(e) => setSection(e.target.checked)}
              />
              <span>Download only a section of the video</span>
              <span className="key-hint">TRIM</span>
            </label>
            {section && video && (
              <div className="trim-details">
                <div className="timeline-labels">
                  <span>{timestamp(0)}</span>
                  <span>
                    {timestamp(time)} <small>PLAYHEAD</small>
                  </span>
                  <span>{timestamp(video.duration)}</span>
                </div>
                <div
                  className="timeline"
                  ref={timeline}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      const r = e.currentTarget.getBoundingClientRect();
                      previewing.current = false;
                      send(
                        "seek",
                        ((e.clientX - r.left) / r.width) * video.duration,
                      );
                    }
                  }}
                >
                  <div
                    className="selection"
                    style={{
                      left: `${(start / video.duration) * 100}%`,
                      width: `${((end - start) / video.duration) * 100}%`,
                    }}
                  />
                  <div
                    className="playhead"
                    style={{ left: `${(time / video.duration) * 100}%` }}
                  />
                  {(["in", "out"] as const).map((which) => (
                    <button
                      key={which}
                      className={`marker ${which}`}
                      aria-label={`${which} marker`}
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={video.duration}
                      aria-valuenow={which === "in" ? start : end}
                      style={{
                        left: `${((which === "in" ? start : end) / video.duration) * 100}%`,
                      }}
                      onPointerDown={(e) => drag(e, which)}
                      onKeyDown={(e) => {
                        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                          e.preventDefault();
                          const delta =
                            (e.key === "ArrowRight" ? 1 : -1) *
                            (e.shiftKey ? 1 : 0.1);
                          if (which === "in")
                            setStart(
                              Math.max(0, Math.min(end - 0.01, start + delta)),
                            );
                          else
                            setEnd(
                              Math.min(
                                video.duration,
                                Math.max(start + 0.01, end + delta),
                              ),
                            );
                        }
                      }}
                    >
                      Ⅱ
                    </button>
                  ))}
                </div>
                <div className="trim-controls">
                  <div className="point">
                    <button disabled={!ready} onClick={setIn}>
                      Set In <kbd>I</kbd>
                    </button>
                    <TimeInput
                      value={start}
                      onChange={(n) => {
                        if (!validSection(n, end, video.duration))
                          throw Error("In must precede Out.");
                        setStart(n);
                      }}
                    />
                  </div>
                  <div className="point">
                    <button disabled={!ready} onClick={setOut}>
                      Set Out <kbd>O</kbd>
                    </button>
                    <TimeInput
                      value={end}
                      onChange={(n) => {
                        if (!validSection(start, n, video.duration))
                          throw Error("Out must follow In and fit the video.");
                        setEnd(n);
                      }}
                    />
                  </div>
                  <div className="selection-duration">
                    <small>SELECTION</small>
                    <strong>{(end - start).toFixed(2)}s</strong>
                  </div>
                  <button
                    disabled={!ready}
                    onClick={() => {
                      send("seek", start);
                      previewing.current = "seeking";
                      send("play");
                    }}
                  >
                    ▶ Preview Selection
                  </button>
                  <button
                    onClick={() => {
                      setStart(0);
                      setEnd(video.duration);
                      previewing.current = false;
                    }}
                  >
                    Reset
                  </button>
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={precise}
                    onChange={(e) => setPrecise(e.target.checked)}
                  />
                  Precise Cut{" "}
                  <small>
                    {precise
                      ? "Re-encodes for accurate boundaries. Automatic uses H.264 / AAC."
                      : "Fast Cut preserves streams; boundaries may align to keyframes."}
                  </small>
                </label>
              </div>
            )}
          </div>
        </section>
        <section className="settings-card">
          <div className="section-heading">
            <h2>Download settings</h2>
            <span>Make it yours</span>
          </div>
          <div className="options">
            <Field label="Container">
              <select
                value={container}
                onChange={(e) => setContainer(e.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
              </select>
            </Field>
            <Field label="Resolution">
              <select
                disabled={mode === "audio"}
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                  setCodec("auto");
                }}
              >
                <option value="">Best available</option>
                {heights.map((h) => (
                  <option key={h} value={h}>
                    {h === 2160 ? "4K · " : h === 1440 ? "2K · " : ""}
                    {h}p
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Video codec">
              <select
                disabled={mode === "audio"}
                value={codec}
                onChange={(e) => setCodec(e.target.value)}
              >
                <option value="auto">Automatic</option>
                {[
                  ["h264", "H.264"],
                  ["hevc", "H.265 / HEVC"],
                  ["av1", "AV1"],
                  ["vp9", "VP9"],
                ].map(([v, l]) => (
                  <option key={v} value={v} disabled={!codecs.has(v)}>
                    {l}
                    {!codecs.has(v) ? " · unavailable" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Audio">
              <select
                value={audio}
                disabled={mode === "audio"}
                onChange={(e) => setAudio(e.target.value)}
              >
                <option value="best">Best available</option>
                <option value="original">Original compatible stream</option>
                <option value="none">No audio</option>
              </select>
            </Field>
            <Field label="Subtitles">
              <select
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              >
                <option value="">None</option>
                {Object.keys(video?.subtitles ?? {}).map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Download mode">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="video">Video + audio</option>
                <option value="audio">Audio only</option>
              </select>
            </Field>
          </div>
          <p className="format-note">
            ⓘ{" "}
            {precise && section
              ? "Precise cut re-encodes. Resolution is retained and the output duration is checked."
              : compatible
                ? "Original streams are preserved where the selected container supports them; separate tracks require merging."
                : "This codec may not be supported in MP4. Choose MKV to preserve the original stream."}{" "}
            Unavailable combinations fail explicitly.
          </p>
          <div className="destination">
            <span className="folder-icon">▱</span>
            <div>
              <small>SAVE TO</small>
              <p>{settings.destination || "Choose a download folder"}</p>
            </div>
            <button
              onClick={() =>
                act(async () => {
                  const p = await invoke<string | null>("pick_folder");
                  if (p) await save({ ...settings, destination: p });
                })
              }
            >
              Choose folder…
            </button>
          </div>
          <button
            className="primary add"
            disabled={
              !video || !settings.destination || !selectionValid || busy
            }
            onClick={enqueue}
          >
            ＋ Add to Download Queue{" "}
            <span>{section ? "Selected section" : "Entire video"}</span>
          </button>
          <p className="legal">
            Download only content you own or have permission to download.
          </p>
        </section>
        <section className="queue">
          <div className="section-heading">
            <h2>
              Download queue <span className="count">{jobs.length}</span>
            </h2>
            <button
              disabled={!jobs.some((j) => j.state === "completed")}
              onClick={() =>
                act(async () => {
                  await invoke("clear_completed");
                  setJobs(await invoke("jobs"));
                })
              }
            >
              Clear Completed
            </button>
          </div>
          {!jobs.length ? (
            <div className="queue-empty">
              <span>⇣</span>
              <div>
                <strong>A home for your downloads</strong>
                <p>Add a video and we’ll take it from here.</p>
              </div>
            </div>
          ) : (
            jobs.map((j) => (
              <article className="job" key={j.id}>
                <div className="job-icon">
                  {j.state === "completed" ? "✓" : "↓"}
                </div>
                <div className="job-body">
                  <strong>{j.title}</strong>
                  <div className="job-status">
                    <span>{j.state}</span>
                    <span>
                      {j.progress.toFixed(1)}% · {j.bytes} · {j.speed}{" "}
                      {j.eta && `· ${j.eta} remaining`}
                    </span>
                  </div>
                  <progress value={j.progress} max="100" />
                  {j.message && <p>{j.message}</p>}
                </div>
                <div className="job-actions">
                  {j.state === "completed" ? (
                    <button
                      onClick={() => act(() => invoke("reveal", { id: j.id }))}
                    >
                      Reveal in Finder
                    </button>
                  ) : j.state === "failed" ? (
                    <button
                      onClick={() => act(() => invoke("retry", { id: j.id }))}
                    >
                      Retry
                    </button>
                  ) : j.state === "canceled" ? null : (
                    <>
                      <button
                        onClick={() =>
                          act(() =>
                            invoke("control", {
                              id: j.id,
                              action: j.state === "paused" ? "resume" : "pause",
                            }),
                          )
                        }
                      >
                        {j.state === "paused" ? "Resume" : "Pause"}
                      </button>
                      <button
                        onClick={() =>
                          act(() =>
                            invoke("control", { id: j.id, action: "cancel" }),
                          )
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
        <footer>
          <span>VIDEO DOWNLOADER</span>
          <span>Made for your personal library.</span>
        </footer>
      </main>
      {showSettings && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Account and Settings"
          >
            <div className="section-heading">
              <h2>Account & Settings</h2>
              <button onClick={() => setShowSettings(false)}>Done</button>
            </div>
            <p>
              Use an existing browser session for videos you’re authorized to
              access. Anonymous is the default.
            </p>
            <Field label="Authentication">
              <select
                value={settings.browser || (settings.cookiesFile ? "file" : "")}
                onChange={(e) =>
                  act(async () => {
                    if (e.target.value === "file") {
                      const p = await invoke<string | null>("pick_cookies");
                      if (p)
                        await save({
                          ...settings,
                          browser: "",
                          cookiesFile: p,
                        });
                    } else
                      await save({
                        ...settings,
                        browser: e.target.value,
                        cookiesFile: "",
                      });
                  })
                }
              >
                <option value="">Anonymous</option>
                <option value="opera">Opera</option>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">
                  Safari (may require Full Disk Access)
                </option>
                <option value="file">Import Netscape cookies…</option>
              </select>
            </Field>
            <p className="notice">
              Selecting a browser authorizes yt-dlp to read its cookies when you
              analyze or download. macOS may request Keychain or cookie-store
              access. Cookies are never printed or copied into app settings.
            </p>
            <Field label="Appearance">
              <select
                value={settings.appearance}
                onChange={(e) =>
                  act(() => save({ ...settings, appearance: e.target.value }))
                }
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
          </section>
        </div>
      )}
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function TimeInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(timestamp(value)),
    [invalid, setInvalid] = useState("");
  useEffect(() => {
    setText(preciseTimestamp(value));
    setInvalid("");
  }, [value]);
  return (
    <label className="time-input">
      <input
        aria-label="Timestamp"
        value={text}
        aria-invalid={!!invalid}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          try {
            onChange(parseTimestamp(text));
            setInvalid("");
          } catch (e) {
            setInvalid(String(e));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {invalid && <small role="alert">{invalid}</small>}
    </label>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
