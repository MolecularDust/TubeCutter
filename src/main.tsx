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
  updateQueue,
  clearQueueRows,
  canClearQueue,
  isTrimmed,
  paddedSection,
  stepPaddedLength,
  outFromPaddedLength,
  timelineTime,
  acceptPlayerTime,
  type SeekTarget,
  type Video,
  type Settings,
  type Job,
} from "./domain";
import {
  t,
  errorText,
  chooseLanguage,
  applyDocumentLanguage,
  languageChoices,
  chosen,
} from "./i18n";
import "./style.css";
import appIcon from "./assets/app-icon.png";
// Browser sign-in is hidden on Windows: Chromium browsers lock their cookie
// file while running, so the button can't help there.
const isWindows = navigator.userAgent.includes("Windows");
const defaults: Settings = {
  destination: "",
  browser: "",
  cookiesFile: "",
  appearance: "system",
};
function App() {
  const [settings, setSettings] = useState<Settings>(defaults),
    [showSettings, setShowSettings] = useState(false),
    [downloadSettingsOpen, setDownloadSettingsOpen] = useState(true),
    [url, setUrl] = useState(""),
    [fileName, setFileName] = useState(""),
    [fileNameEditing, setFileNameEditing] = useState(false),
    [fileNameEdited, setFileNameEdited] = useState(false),
    [video, setVideo] = useState<Video | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [playerError, setPlayerError] = useState(""),
    [origin, setOrigin] = useState(""),
    [ready, setReady] = useState(false),
    [previewActive, setPreviewActive] = useState(false),
    [inValid, setInValid] = useState(true),
    [outValid, setOutValid] = useState(true),
    [lengthValid, setLengthValid] = useState(true),
    [resetVersion, setResetVersion] = useState(0),
    [padding, setPadding] = useState(0),
    [paddingEditing, setPaddingEditing] = useState(false),
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
    [jobs, setJobs] = useState<Job[]>([]),
    [, setLanguageVersion] = useState(0);
  const iframe = useRef<HTMLIFrameElement>(null),
    clearedJobIds = useRef(new Set<string>()),
    scrub = useRef<{ id: number; kind: "in" | "out" | "playhead" } | null>(
      null,
    ),
    seekTarget = useRef<SeekTarget | null>(null),
    previewing = useRef<false | "seeking" | "playing">(false),
    token = useRef(crypto.randomUUID()),
    timeline = useRef<HTMLDivElement>(null);
  const duration = video?.duration ?? 0;
  const timelineDuration = duration || 1;
  const [clipStart, clipEnd] = paddedSection(start, end, padding, duration);
  const send = (action: string, value?: number) =>
    iframe.current?.contentWindow?.postMessage(
      { token: token.current, action, value },
      origin,
    );
  const stopPreview = () => {
    send("pause");
    previewing.current = false;
    setPreviewActive(false);
  };
  const act = async (fn: () => Promise<unknown>) => {
    try {
      setError("");
      await fn();
    } catch (e) {
      setError(errorText(e));
    }
  };
  useEffect(() => {
    if (!isTauri()) {
      setError(
        t(
          "Open the desktop application to analyze and download. Browser mode is a UI preview.",
        ),
      );
      return;
    }
    let dispose: (() => void) | undefined;
    let disposed = false;
    invoke<Settings>("get_settings")
      .then(setSettings)
      .catch((e) => setError(errorText(e)));
    invoke<string>("player_origin")
      .then(setOrigin)
      .catch((e) => setError(errorText(e)));
    invoke<Job[]>("jobs")
      .then((loaded) => setJobs(clearQueueRows(loaded, clearedJobIds.current)))
      .catch((e) => setError(errorText(e)));
    listen<Job>("job", (e) =>
      setJobs((old) => updateQueue(old, e.payload, clearedJobIds.current)),
    )
      .then((fn) => {
        if (disposed) fn();
        else dispose = fn;
      })
      .catch((e) => setError(errorText(e)));
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
        if (
          !acceptPlayerTime(
            value,
            seekTarget.current,
            scrub.current?.kind === "playhead",
            performance.now(),
          )
        )
          return;
        seekTarget.current = null;
        setTime(value);
        if (
          previewing.current === "seeking" &&
          value >= clipStart - 0.25 &&
          value < clipEnd
        )
          previewing.current = "playing";
        if (previewing.current === "playing" && value >= clipEnd) {
          send("pause");
          previewing.current = false;
          setPreviewActive(false);
        }
      }
      if (
        type === "state" &&
        (value === 0 || (value === 2 && previewing.current === "playing"))
      ) {
        previewing.current = false;
        setPreviewActive(false);
      }
      if (type === "ready") setReady(true);
      if (type === "error") {
        setReady(false);
        previewing.current = false;
        setPreviewActive(false);
        setPlayerError(
          value === 153
            ? t(
                "YouTube rejected the player identity (error 153). Try reopening the app; this WebView may not send the required Referer.",
              )
            : [101, 150].includes(value)
              ? t(
                  "The owner does not allow this video to be embedded. Downloads may still be available.",
                )
              : t(
                  "YouTube player error {0}. Check video availability and network access.",
                  value,
                ),
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [origin, clipStart, clipEnd]);
  const setIn = () => setStart(Math.max(0, Math.min(time, end - 0.01)));
  const setOut = () =>
    setEnd(Math.min(video?.duration ?? end, Math.max(time, start + 0.01)));
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          "input,textarea,select,[contenteditable]",
        ) ||
        showSettings ||
        !ready
      )
        return;
      if (e.code === "Space" && !(e.target as HTMLElement).closest("button")) {
        e.preventDefault();
        send("toggle");
      }
      if (e.key.toLowerCase() === "i") setIn();
      if (e.key.toLowerCase() === "o") setOut();
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
      stopPreview();
      try {
        const clean = normalizeUrl(url);
        setUrl(clean);
        const v = await invoke<Video>("analyze", { url: clean });
        if (!v.duration || !Number.isFinite(v.duration))
          throw Error("This video has no finite duration.");
        scrub.current = null;
        seekTarget.current = null;
        setVideo(v);
        setFileName(v.title);
        setFileNameEditing(false);
        setFileNameEdited(false);
        setStart(0);
        setEnd(v.duration);
        setPadding(0);
        setPaddingEditing(false);
        setInValid(true);
        setOutValid(true);
        setResetVersion((n) => n + 1);
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
  const section = !!video && isTrimmed(clipStart, clipEnd, video.duration);
  const selectionValid =
    !!video &&
    inValid &&
    outValid &&
    lengthValid &&
    validSection(start, end, video.duration);
  const enqueue = () =>
    act(async () => {
      if (!video || !selectionValid)
        throw Error("Select a valid video section.");
      await invoke("enqueue", {
        request: {
          url: video.url,
          title: video.title,
          fileName: fileNameEdited ? fileName.trim() : null,
          destination: settings.destination,
          container,
          resolution: resolution ? Number(resolution) : null,
          codec,
          audio,
          mode,
          subtitle,
          section: section ? [clipStart, clipEnd] : null,
          precise: section && precise,
          duration: video.duration,
        },
      });
    });
  const seek = (value: number) => {
    if (!video || !ready || busy) return;
    const position = Math.max(0, Math.min(video.duration, value));
    if (previewing.current) stopPreview();
    seekTarget.current = { position, expires: performance.now() + 3000 };
    setTime(position);
    send("seek", position);
  };
  const moveTimelineControl = (
    clientX: number,
    kind: "in" | "out" | "playhead",
  ) => {
    if (!timeline.current || !video || busy) return;
    const bounds = timeline.current.getBoundingClientRect();
    const position = timelineTime(
      clientX,
      bounds.left,
      bounds.width,
      video.duration,
    );
    if (kind === "in") setStart(Math.min(position, end - 0.01));
    else if (kind === "out") setEnd(Math.max(position, start + 0.01));
    else seek(position);
  };
  const languageSelect = (
    <select
      aria-label={t("Language")}
      value={chosen}
      onChange={(e) => {
        chooseLanguage(e.target.value);
        setLanguageVersion((n) => n + 1);
      }}
    >
      <option value="">{t("Same as the system")}</option>
      {languageChoices().map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
  return (
    <div className="app">
      <header>
        <div className="brand">
          <img className="app-icon" src={appIcon} alt="" />
          <div>
            <strong>TubeCutter</strong>
            <small>{t("Your videos. Your way.")}</small>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)}>
            ◎ <span>{t("Account & Settings")}</span>
          </button>
        </div>
      </header>
      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">{t("YOUR NEXT DOWNLOAD")}</p>
            <h1>{t("Save something worth keeping.")}</h1>
          </div>
          <span className="badge">
            ●{" "}
            {settings.browser || settings.cookiesFile
              ? settings.browser === "app"
                ? t("App session")
                : t("Browser session")
              : t("Anonymous")}
          </span>
        </div>
        <section className="url-card">
          <label htmlFor="url">{t("YouTube video link")}</label>
          <div className="url-row">
            <span>↗</span>
            <input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy && url.trim()) analyze();
              }}
              placeholder={t("Paste a YouTube, Shorts, or youtu.be link")}
            />
            <button
              onClick={() =>
                act(async () => setUrl(await invoke<string>("read_clipboard")))
              }
            >
              {t("Paste")}
            </button>
            <button
              className="primary analyze-button"
              aria-busy={busy}
              disabled={busy || !url}
              onClick={analyze}
            >
              {busy && <span className="analyze-spinner" aria-hidden="true" />}
              <span role="status">
                {busy ? t("Analyzing…") : t("Analyze →")}
              </span>
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
              <span className="eyebrow">{t("VIDEO PREVIEW")}</span>
              <h2>
                {video?.title ?? t("A little inspiration. Ready to save.")}
              </h2>
              <p>
                {video
                  ? `${video.channel}  ·  ${timestamp(video.duration)}  ·  ${t("{0}p available", Math.max(...heights, 0))}`
                  : t(
                      "Analyze a video to see its details and available formats.",
                    )}
              </p>
            </div>
            {video && <span className="badge">YouTube</span>}
          </div>
          <div className="player">
            {video && origin ? (
              <iframe
                ref={iframe}
                key={video.id + token.current}
                title={t("YouTube video preview")}
                src={`${origin}/player?id=${video.id}&token=${token.current}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="empty-player">
                <div className="play-symbol">▶</div>
                <h3>{t("Your video starts here")}</h3>
                <p>{t("Paste a link above to preview, trim, and download.")}</p>
                <span>{t("YOUTUBE VIDEO PREVIEW")}</span>
              </div>
            )}
          </div>
          {playerError && <div className="notice error">{playerError}</div>}
          <div className="trim">
            <fieldset className="trim-details" disabled={!video || busy}>
              <div className="timeline-labels">
                <span>{timestamp(0)}</span>
                <span>
                  {timestamp(time)} <small>{t("PLAYHEAD")}</small>
                </span>
                <span>{timestamp(duration)}</span>
              </div>
              <div
                className="timeline"
                ref={timeline}
                onPointerDown={(e) => {
                  if (!video || busy || e.button !== 0 || !e.isPrimary) return;
                  const control = (
                    e.target as HTMLElement
                  ).closest<HTMLElement>("[data-timeline-control]");
                  const kind = (control?.dataset.timelineControl ??
                    "playhead") as "in" | "out" | "playhead";
                  if (kind === "playhead" && !ready) return;
                  e.preventDefault();
                  (
                    control ??
                    e.currentTarget.querySelector<HTMLElement>(
                      ".playhead-handle",
                    )
                  )?.focus({ preventScroll: true });
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scrub.current = { id: e.pointerId, kind };
                  if (!control) moveTimelineControl(e.clientX, kind);
                }}
                onPointerMove={(e) => {
                  if (scrub.current?.id === e.pointerId)
                    moveTimelineControl(e.clientX, scrub.current.kind);
                }}
                onPointerUp={(e) => {
                  if (scrub.current?.id !== e.pointerId) return;
                  const kind = scrub.current.kind;
                  scrub.current = null;
                  moveTimelineControl(e.clientX, kind);
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onPointerCancel={() => {
                  scrub.current = null;
                }}
                onLostPointerCapture={() => {
                  scrub.current = null;
                }}
              >
                <div
                  className="selection"
                  style={{
                    left: `${(clipStart / timelineDuration) * 100}%`,
                    width: `${((clipEnd - clipStart) / timelineDuration) * 100}%`,
                  }}
                />
                <div
                  className="playhead"
                  style={{ left: `${(time / timelineDuration) * 100}%` }}
                >
                  <button
                    className="playhead-handle"
                    data-timeline-control="playhead"
                    aria-label={t("Playhead")}
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={time}
                    aria-valuetext={preciseTimestamp(time)}
                    disabled={!ready}
                    title={t("Drag to seek")}
                    onKeyDown={(e) => {
                      if (
                        ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                          e.key,
                        )
                      ) {
                        e.preventDefault();
                        const delta =
                          (e.key === "ArrowRight" ? 1 : -1) *
                          (e.shiftKey ? 1 : 0.1);
                        seek(
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? duration
                              : time + delta,
                        );
                      }
                    }}
                  />
                </div>
                {(["in", "out"] as const).map((which) => (
                  <button
                    key={which}
                    className={`marker ${which}`}
                    aria-label={
                      which === "in" ? t("In marker") : t("Out marker")
                    }
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={which === "in" ? start : end}
                    style={{
                      left: `${((which === "in" ? start : end) / timelineDuration) * 100}%`,
                    }}
                    data-timeline-control={which}
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
                              duration,
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
                    {t("Set In")} <kbd>I</kbd>
                  </button>
                  <TimeInput
                    key={`in-${resetVersion}`}
                    label={t("In")}
                    onValidity={setInValid}
                    value={start}
                    onChange={(n) => {
                      if (!validSection(n, end, duration))
                        throw Error("In must precede Out.");
                      setStart(n);
                    }}
                  />
                </div>
                <div className="point">
                  <button disabled={!ready} onClick={setOut}>
                    {t("Set Out")} <kbd>O</kbd>
                  </button>
                  <TimeInput
                    key={`out-${resetVersion}`}
                    label={t("Out")}
                    onValidity={setOutValid}
                    value={end}
                    onChange={(n) => {
                      if (!validSection(start, n, duration))
                        throw Error("Out must follow In and fit the video.");
                      setEnd(n);
                    }}
                  />
                </div>
                <div className="time-input length-input padding-input">
                  <label className="length-label" htmlFor="padding">
                    {t("Padding")}
                    <br />
                    {t("(seconds)")}
                  </label>
                  <div className="number-stepper">
                    <input
                      id="padding"
                      aria-label={t("Padding in seconds")}
                      inputMode="numeric"
                      maxLength={2}
                      value={
                        paddingEditing
                          ? String(padding)
                          : String(padding).padStart(2, "0")
                      }
                      onFocus={(e) => {
                        setPaddingEditing(true);
                        e.target.select();
                      }}
                      onBlur={() => setPaddingEditing(false)}
                      onChange={(e) => {
                        if (/^\d{0,2}$/.test(e.target.value))
                          setPadding(Number(e.target.value));
                      }}
                    />
                    <StepperButtons
                      label={t("Padding")}
                      onStep={(delta) =>
                        setPadding(Math.max(0, Math.min(99, padding + delta)))
                      }
                    />
                  </div>
                </div>
                <div className="time-input length-input calculated-length">
                  <span className="length-label">
                    {t("Length")}
                    <br />
                    {t("(seconds)")}
                  </span>
                  <TimeInput
                    key={`length-${resetVersion}-${start}-${end}-${padding}`}
                    label={t("Length")}
                    seconds
                    value={Math.round((clipEnd - clipStart) * 1000) / 1000}
                    onValidity={setLengthValid}
                    onChange={(length) => {
                      setEnd(
                        outFromPaddedLength(
                          start,
                          end,
                          padding,
                          duration,
                          length,
                        ),
                      );
                    }}
                    onStep={(delta) => {
                      setEnd(
                        stepPaddedLength(start, end, padding, duration, delta),
                      );
                      setResetVersion((n) => n + 1);
                      setInValid(true);
                      setOutValid(true);
                    }}
                  />
                </div>
                <button
                  className="preview-button"
                  disabled={!ready || (!previewActive && !selectionValid)}
                  onClick={() => {
                    if (previewing.current) {
                      stopPreview();
                      return;
                    }
                    seekTarget.current = {
                      position: clipStart,
                      expires: performance.now() + 3000,
                    };
                    setTime(clipStart);
                    send("seek", clipStart);
                    previewing.current = "seeking";
                    setPreviewActive(true);
                    send("play");
                  }}
                >
                  {previewActive ? t("■ Stop") : t("▶ Preview selection")}
                </button>
                <button
                  className="reset-button"
                  type="button"
                  onClick={() => {
                    setStart(0);
                    setEnd(duration);
                    setPadding(0);
                    setInValid(true);
                    setOutValid(true);
                    setResetVersion((n) => n + 1);
                    if (!video || busy) return;
                    if (previewing.current) stopPreview();
                    setPreviewActive(false);
                  }}
                >
                  {t("Reset")}
                </button>
              </div>
              {video && padding > 0 && (
                <small className="padding-summary">
                  {t(
                    "With padding: {0} – {1}. Padding stops at the video boundaries.",
                    preciseTimestamp(clipStart),
                    preciseTimestamp(clipEnd),
                  )}
                </small>
              )}
              <label
                className={`download-filename${fileNameEditing || fileNameEdited ? " is-editing" : ""}`}
              >
                <span>{t("File name")}</span>
                <div>
                  <input
                    aria-label={t("File name")}
                    value={fileName}
                    readOnly={!fileNameEditing}
                    onFocus={() => setFileNameEditing(true)}
                    onChange={(e) => {
                      setFileName(e.target.value);
                      setFileNameEdited(true);
                    }}
                    onBlur={() => {
                      if (!fileNameEdited) setFileNameEditing(false);
                    }}
                    placeholder={t("Process a video link to see its file name")}
                  />
                  <span>.{container}</span>
                </div>
                <small>
                  {t(
                    "Click to rename. The selected container supplies the file extension.",
                  )}
                </small>
              </label>
              <div className="check">
                <input
                  type="checkbox"
                  aria-label={t("Precise Cut")}
                  aria-describedby="precise-cut-description"
                  checked={precise}
                  onChange={(e) => setPrecise(e.target.checked)}
                />
                <span>{t("Precise Cut")}</span>
                <small id="precise-cut-description">
                  {precise
                    ? t(
                        "Re-encodes for accurate boundaries. Automatic uses H.264 / AAC.",
                      )
                    : t(
                        "Fast Cut preserves streams; boundaries may align to keyframes.",
                      )}
                </small>
              </div>
            </fieldset>
            {!video && (
              <small className="trim-hint">
                {t("Process a video link to enable trimming.")}
              </small>
            )}
          </div>
        </section>
        <section className="settings-card">
          <details
            open={downloadSettingsOpen}
            onToggle={(e) => setDownloadSettingsOpen(e.currentTarget.open)}
          >
            <summary>
              {t("Download settings")} <small>{t("Make it yours")}</small>
            </summary>
            <div className="options">
              <Field label={t("Container")}>
                <select
                  value={container}
                  onChange={(e) => setContainer(e.target.value)}
                >
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                </select>
              </Field>
              <Field label={t("Resolution")}>
                <select
                  disabled={mode === "audio"}
                  value={resolution}
                  onChange={(e) => {
                    setResolution(e.target.value);
                    setCodec("auto");
                  }}
                >
                  <option value="">{t("Best available")}</option>
                  {heights.map((h) => (
                    <option key={h} value={h}>
                      {h === 2160 ? "4K · " : h === 1440 ? "2K · " : ""}
                      {h}p
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("Video codec")}>
                <select
                  disabled={mode === "audio"}
                  value={codec}
                  onChange={(e) => setCodec(e.target.value)}
                >
                  <option value="auto">{t("Automatic")}</option>
                  {[
                    ["h264", "H.264"],
                    ["hevc", "H.265 / HEVC"],
                    ["av1", "AV1"],
                    ["vp9", "VP9"],
                  ].map(([v, l]) => (
                    <option key={v} value={v} disabled={!codecs.has(v)}>
                      {l}
                      {!codecs.has(v) ? ` · ${t("unavailable")}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("Audio")}>
                <select
                  value={audio}
                  disabled={mode === "audio"}
                  onChange={(e) => setAudio(e.target.value)}
                >
                  <option value="best">{t("Best available")}</option>
                  <option value="original">
                    {t("Original compatible stream")}
                  </option>
                  <option value="none">{t("No audio")}</option>
                </select>
              </Field>
              <Field label={t("Subtitles")}>
                <select
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                >
                  <option value="">{t("None")}</option>
                  {Object.keys(video?.subtitles ?? {}).map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("Download mode")}>
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="video">{t("Video + audio")}</option>
                  <option value="audio">{t("Audio only")}</option>
                </select>
              </Field>
            </div>
            <p className="format-note">
              ⓘ{" "}
              {precise && section
                ? t(
                    "Precise cut re-encodes. Resolution is retained and the output duration is checked.",
                  )
                : compatible
                  ? t(
                      "Original streams are preserved where the selected container supports them; separate tracks require merging.",
                    )
                  : t(
                      "This codec may not be supported in MP4. Choose MKV to preserve the original stream.",
                    )}{" "}
              {t("Unavailable combinations fail explicitly.")}
            </p>
          </details>
          <div className="destination">
            <svg
              className="folder-icon"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
              <path d="M3 9h18" />
            </svg>
            <div>
              <small>{t("SAVE TO")}</small>
              <p>{settings.destination || t("Choose a download folder")}</p>
            </div>
            <button
              onClick={() =>
                act(async () => {
                  const p = await invoke<string | null>("pick_folder");
                  if (p) await save({ ...settings, destination: p });
                })
              }
            >
              {t("Choose folder…")}
            </button>
          </div>
          <button
            className="primary add"
            disabled={
              !video || !settings.destination || !selectionValid || busy
            }
            onClick={enqueue}
          >
            {t("＋ Add to Download Queue")}{" "}
            <span>{section ? t("Selected section") : t("Entire video")}</span>
          </button>
          <p className="legal">
            {t("Download only content you own or have permission to download.")}
          </p>
        </section>
        <section className="queue">
          <div className="section-heading">
            <h2>
              {t("Download queue")} <span className="count">{jobs.length}</span>
            </h2>
            <button
              disabled={!canClearQueue(jobs)}
              onClick={() =>
                act(async () => {
                  const cleared = await invoke<string[]>("clear_completed");
                  for (const id of cleared) clearedJobIds.current.add(id);
                  setJobs((current) =>
                    clearQueueRows(current, clearedJobIds.current),
                  );
                })
              }
            >
              {t("Clear Finished")}
            </button>
          </div>
          {!jobs.length ? (
            <div className="queue-empty">
              <span>⇣</span>
              <div>
                <strong>{t("A home for your downloads")}</strong>
                <p>{t("Add a video and we’ll take it from here.")}</p>
              </div>
            </div>
          ) : (
            jobs.map((j) => (
              <article className="job" key={j.id}>
                <div className="job-icon" aria-hidden="true">
                  {j.state === "completed" ? (
                    <span className="queue-checkmark">✓</span>
                  ) : ["canceled", "failed"].includes(j.state) ? (
                    <span className="queue-canceled">✕</span>
                  ) : (
                    <span
                      className={`queue-spinner${["downloading", "merging", "processing"].includes(j.state) ? " is-spinning" : ""}`}
                    />
                  )}
                </div>
                <div className="job-body">
                  <strong>{j.title}</strong>
                  <div className="job-status">
                    <span>{t(j.state)}</span>
                    <span>
                      {[
                        `${j.progress.toFixed(1)}%`,
                        j.speed,
                        j.bytes,
                        j.eta ? t("{0} remaining", j.eta) : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
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
                      {isWindows ? t("Show in Explorer") : t("Reveal in Finder")}
                    </button>
                  ) : j.state === "failed" ? (
                    <button
                      onClick={() => act(() => invoke("retry", { id: j.id }))}
                    >
                      {t("Retry")}
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
                        {j.state === "paused" ? t("Resume") : t("Pause")}
                      </button>
                      <button
                        onClick={() =>
                          act(() =>
                            invoke("control", { id: j.id, action: "cancel" }),
                          )
                        }
                      >
                        {t("Cancel")}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </section>
        <footer>
          <span>TUBECUTTER</span>
          <span>{t("Made for your personal library.")}</span>
        </footer>
      </main>
      {showSettings && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={t("Account and Settings")}
          >
            <div className="section-heading">
              <h2>{t("Account & Settings")}</h2>
              <button onClick={() => setShowSettings(false)}>
                {t("Done")}
              </button>
            </div>
            <h3>{t("YouTube account")}</h3>
            {isWindows ? (
              <p>
                {t(
                  "Sign in inside the app. Passkeys and security keys may fail there, so use your password and phone confirmation.",
                )}
              </p>
            ) : (
              <>
                <p>
                  {t(
                    "Recommended: sign in to YouTube in your normal browser. Passkeys and security keys work there. Then choose that browser under Download authentication below. The app never sees your password.",
                  )}
                </p>
                <div className="playback-test-actions">
                  <button
                    onClick={() => act(() => invoke("open_browser_sign_in"))}
                  >
                    {t("Sign in in my browser ↗")}
                  </button>
                </div>
                <p>
                  {t(
                    "Alternatively, sign in inside the app. Passkeys and security keys may fail there, so use your password and phone confirmation.",
                  )}
                </p>
              </>
            )}
            <div className="playback-test-actions">
              <button
                onClick={() => act(() => invoke("youtube_sign_in_window"))}
              >
                {t("1. Sign in to Google ↗")}
              </button>
              <button
                onClick={() => act(() => invoke("youtube_connect_window"))}
              >
                {t("2. Connect YouTube ↗")}
              </button>
            </div>
            <h3>{t("Download authentication")}</h3>
            <p>
              {t(
                "Use the app’s YouTube session or an existing browser session for videos you’re authorized to access. Anonymous is the default.",
              )}
            </p>
            <Field label={t("Authentication")}>
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
                <option value="">{t("Anonymous")}</option>
                <option value="app">{t("App’s YouTube session")}</option>
                <option value="opera">Opera</option>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                {!isWindows && (
                  <option value="safari">
                    {t("Safari (may require Full Disk Access)")}
                  </option>
                )}
                <option value="file">{t("Import Netscape cookies…")}</option>
              </select>
            </Field>
            <p className="notice">
              {isWindows
                ? t(
                    "Selecting a browser authorizes yt-dlp to read its cookies when you analyze or download. Close that browser first. Cookies are never printed or copied into app settings.",
                  )
                : t(
                    "Selecting a browser authorizes yt-dlp to read its cookies when you analyze or download. macOS may request Keychain or cookie-store access. Cookies are never printed or copied into app settings.",
                  )}
            </p>
            <Field label={t("Appearance")}>
              <select
                value={settings.appearance}
                onChange={(e) =>
                  act(() => save({ ...settings, appearance: e.target.value }))
                }
              >
                <option value="system">{t("System")}</option>
                <option value="light">{t("Light")}</option>
                <option value="dark">{t("Dark")}</option>
              </select>
            </Field>
            <Field label={t("Language")}>{languageSelect}</Field>
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
function StepperButtons({
  label,
  onStep,
}: {
  label: string;
  onStep: (delta: number) => void;
}) {
  return (
    <span className="stepper-buttons">
      <button
        type="button"
        aria-label={t("Increase {0} by one second", label)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onStep(1)}
      >
        ▴
      </button>
      <button
        type="button"
        aria-label={t("Decrease {0} by one second", label)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onStep(-1)}
      >
        ▾
      </button>
    </span>
  );
}
function TimeInput({
  value,
  onChange,
  onValidity,
  label,
  seconds = false,
  onStep,
}: {
  value: number;
  onChange: (n: number) => void;
  onValidity: (valid: boolean) => void;
  label: string;
  seconds?: boolean;
  onStep?: (delta: number) => void;
}) {
  const format = (n: number) => (seconds ? String(n) : preciseTimestamp(n));
  const [text, setText] = useState(format(value)),
    [invalid, setInvalid] = useState("");
  useEffect(() => {
    setText(seconds ? String(value) : preciseTimestamp(value));
    setInvalid("");
    onValidity(true);
  }, [value, onValidity, seconds]);
  const commit = () => {
    try {
      if (seconds && !/^\d+(\.\d{1,3})?$/.test(text))
        throw Error(
          "Enter seconds, optionally with up to three decimal places.",
        );
      onChange(seconds ? Number(text) : parseTimestamp(text));
      setInvalid("");
      onValidity(true);
    } catch (e) {
      setInvalid(errorText(e));
      onValidity(false);
    }
  };
  const step = (delta: number) => {
    try {
      if (onStep) onStep(delta);
      else onChange(Math.round((value + delta) * 1000) / 1000);
      setInvalid("");
      onValidity(true);
    } catch (e) {
      setInvalid(errorText(e));
      onValidity(false);
    }
  };
  return (
    <div className="time-input">
      <div className="number-stepper">
        <input
          aria-label={
            seconds ? t("{0} in seconds", label) : t("{0} timestamp", label)
          }
          inputMode={seconds ? "decimal" : undefined}
          value={text}
          aria-invalid={!!invalid}
          onChange={(e) => {
            setText(e.target.value);
            onValidity(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <StepperButtons label={label} onStep={step} />
      </div>
      {invalid && <small role="alert">{invalid}</small>}
    </div>
  );
}
applyDocumentLanguage();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
