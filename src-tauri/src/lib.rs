mod model;
mod platform;
mod player;
use model::*;
use std::{
    collections::HashMap,
    io::{BufRead, BufReader},
    path::PathBuf,
    process::Stdio,
    sync::{Arc, Mutex},
};
use tauri::{Emitter, Manager, State};
struct Backend {
    settings: Mutex<Settings>,
    jobs: Arc<Mutex<HashMap<String, Job>>>,
    origin: String,
    sender: std::sync::mpsc::Sender<(String, Settings)>,
    analyzer: Arc<Mutex<Option<u32>>>,
}
fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let p = app.path().app_config_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&p).map_err(|e| e.to_string())?;
    Ok(p.join("settings.json"))
}
fn auth(c: &mut std::process::Command, s: &Settings) -> Result<(), String> {
    if !s.browser.is_empty() {
        if !["opera", "chrome", "firefox", "safari"].contains(&s.browser.as_str()) {
            return Err("Unsupported browser".into());
        }
        c.args(["--cookies-from-browser", &s.browser]);
    } else if !s.cookies_file.is_empty() {
        let p = PathBuf::from(&s.cookies_file);
        if !p.is_file() {
            return Err("Imported cookies file is no longer accessible".into());
        }
        c.arg("--cookies").arg(p);
    }
    Ok(())
}
fn base(s: &Settings) -> Result<std::process::Command, String> {
    let mut c = platform::command("yt-dlp")?;
    c.args([
        "--ignore-config",
        "--no-playlist",
        "--no-warnings",
        "--no-cache-dir",
        "--socket-timeout",
        "20",
        "--retries",
        "2",
    ]);
    if let Ok(p) = platform::binary("ffmpeg") {
        c.arg("--ffmpeg-location").arg(p.parent().unwrap());
    }
    if let Ok(p) = platform::binary("deno") {
        c.arg("--js-runtimes").arg(format!("deno:{}", p.display()));
    }
    auth(&mut c, s)?;
    Ok(c)
}
fn safe_error(text: &str) -> String {
    let t = text.to_lowercase();
    if t.contains("python shared library") || t.contains("different team ids") {
        "The bundled downloader cannot load Python under the current macOS signature. This package needs its sidecar signing configuration corrected; use the development build in the meantime.".into()
    } else if t.contains("certificate verify failed") {
        "The media server certificate could not be verified. Check the bundled certificate store and network trust settings. Certificate verification was not bypassed.".into()
    } else if t.contains("cookie") || t.contains("keychain") || t.contains("permission") {
        "Browser cookies are unavailable. Check the browser installation, macOS permissions, and cookie store; alternatively import a Netscape cookies file.".into()
    } else if t.contains("sign in") || t.contains("http error 403") || t.contains("private video") {
        "YouTube denied access. The video may require authentication, or this network may be restricted.".into()
    } else if t.contains("format") {
        "The exact requested format is unavailable. Choose a format listed by Analyze; no lower quality was substituted.".into()
    } else {
        "Media operation failed. Check connectivity, video availability, and media tool versions. No automatic whole-video fallback was attempted.".into()
    }
}
#[tauri::command]
fn get_settings(s: State<Backend>) -> Settings {
    s.settings.lock().unwrap().clone()
}
#[tauri::command]
fn save_settings(
    app: tauri::AppHandle,
    s: State<Backend>,
    settings: Settings,
) -> Result<(), String> {
    if !settings.destination.is_empty() && !PathBuf::from(&settings.destination).is_dir() {
        return Err("Choose an existing destination folder".into());
    }
    let path = settings_path(&app)?;
    std::fs::write(path, serde_json::to_vec_pretty(&settings).unwrap())
        .map_err(|e| e.to_string())?;
    *s.settings.lock().unwrap() = settings;
    Ok(())
}
#[tauri::command]
async fn pick_folder() -> Option<String> {
    rfd::AsyncFileDialog::new()
        .set_title("Choose download destination")
        .pick_folder()
        .await
        .map(|f| f.path().to_string_lossy().into_owned())
}
#[tauri::command]
async fn pick_cookies() -> Option<String> {
    rfd::AsyncFileDialog::new()
        .set_title("Import Netscape cookies file")
        .add_filter("Cookies text file", &["txt"])
        .pick_file()
        .await
        .map(|f| f.path().to_string_lossy().into_owned())
}
#[tauri::command]
fn player_origin(s: State<Backend>) -> String {
    s.origin.clone()
}
#[tauri::command]
async fn analyze(url: String, s: State<'_, Backend>) -> Result<serde_json::Value, String> {
    let normalized = normalize(&url)?;
    let settings = s.settings.lock().unwrap().clone();
    let analyzer = s.analyzer.clone();
    {
        let mut active = analyzer.lock().unwrap();
        if active.is_some() {
            return Err("Video analysis is already running".into());
        }
        *active = Some(0);
    }
    let process = analyzer.clone();
    let result=tauri::async_runtime::spawn_blocking(move || ->Result<serde_json::Value,String> {
        let mut command=base(&settings)?;
        command.args(["--dump-single-json","--skip-download","--",&normalized]).stdout(Stdio::piped()).stderr(Stdio::piped());
        let child=command.spawn().map_err(|_|"Cannot start yt-dlp")?;
        *process.lock().unwrap()=Some(child.id());
        let o=child.wait_with_output().map_err(|_|"Metadata worker stopped")?;
        if !o.status.success(){return Err(safe_error(&String::from_utf8_lossy(&o.stderr)))}
        let v:serde_json::Value=serde_json::from_slice(&o.stdout).map_err(|_|"Invalid metadata response")?;
        if v["is_live"].as_bool()==Some(true){return Err("Live videos are not supported; choose a finished video".into())}
        let formats=v["formats"].as_array().map(|a|a.iter().map(|f|serde_json::json!({"format_id":f["format_id"],"height":f["height"],"vcodec":f["vcodec"],"acodec":f["acodec"],"ext":f["ext"]})).collect::<Vec<_>>());
        Ok(serde_json::json!({"id":v["id"],"url":normalized,"title":v["title"],"channel":v["channel"],"duration":v["duration"],"thumbnail":v["thumbnail"],"formats":formats,"subtitles":v["subtitles"]}))
    }).await.map_err(|_|"Metadata worker stopped".to_string());
    *analyzer.lock().unwrap() = None;
    result?
}
fn update(
    app: &tauri::AppHandle,
    jobs: &Arc<Mutex<HashMap<String, Job>>>,
    id: &str,
    f: impl FnOnce(&mut Job),
) {
    if let Some(j) = jobs.lock().unwrap().get_mut(id) {
        let canceled = j.state == "canceled";
        f(j);
        if canceled {
            j.state = "canceled".into();
        }
        let _ = app.emit("job", j.clone());
    }
}
fn download(
    app: tauri::AppHandle,
    jobs: Arc<Mutex<HashMap<String, Job>>>,
    id: String,
    s: Settings,
) {
    let r = jobs.lock().unwrap()[&id].request.clone();
    let result = (|| -> Result<(), String> {
        let mut c = base(&s)?;
        let destination = PathBuf::from(&r.destination)
            .canonicalize()
            .map_err(|_| "Destination is unavailable")?;
        // A unique job prefix prevents overwrites and keeps all output inside the selected directory.
        let template = format!("%(title).100B [%(id)s] - {}.%(ext)s", &id[..8]);
        c.arg("--paths").arg(&destination);
        c.args(["--no-quiet","--newline","--progress","--no-overwrites","--restrict-filenames","--continue","--progress-template","download:PROGRESS|%(progress._percent_str)s|%(progress._speed_str)s|%(progress._downloaded_bytes_str)s|%(progress._eta_str)s","--print","after_move:FILE|%(filepath)s","-o"]).arg(template);
        let mut video = String::from("bv");
        if let Some(h) = r.resolution {
            video.push_str(&format!("[height={h}]"));
        }
        let codec = match r.codec.as_str() {
            "h264" => "avc1",
            "hevc" => "hev1|hvc1|hevc",
            "av1" => "av01",
            "vp9" => "vp09|vp9",
            _ => "",
        };
        if !codec.is_empty() {
            video.push_str(&format!("[vcodec~='^({codec})']"));
        }
        let format = if r.mode == "audio" {
            "ba".to_string()
        } else if r.audio == "none" {
            video.clone()
        } else {
            {
                let a = if r.audio == "original" && r.container == "mp4" {
                    "ba[acodec^=mp4a]"
                } else {
                    "ba"
                };
                let combined = video.replacen("bv", "b", 1);
                let combined = if r.audio == "original" && r.container == "mp4" {
                    format!("{combined}[acodec^=mp4a]")
                } else {
                    combined
                };
                format!("{video}+{a}/{combined}")
            }
        };
        c.args([
            "-f",
            &format,
            "--merge-output-format",
            &r.container,
            "--remux-video",
            &r.container,
        ]);
        if !r.subtitle.is_empty() {
            c.args(["--write-subs", "--sub-langs", &r.subtitle, "--embed-subs"]);
        }
        if let Some([a, b]) = r.section {
            c.args(["--download-sections", &format!("*{a}-{b}")]);
            if r.precise {
                c.arg("--force-keyframes-at-cuts");
                let encoder = match r.codec.as_str() {
                    "hevc" => "libx265",
                    "av1" => "libaom-av1",
                    "vp9" => "libvpx-vp9",
                    _ => "libx264",
                };
                c.args([
                    "--downloader-args",
                    &format!(
                        "ffmpeg_o:-progress pipe:1 -nostats -c:v {encoder} -crf 18 -c:a aac -f {}",
                        if r.container == "mkv" {
                            "matroska"
                        } else {
                            "mp4"
                        }
                    ),
                ]);
            } else {
                c.args(["--downloader-args", "ffmpeg_o:-progress pipe:1 -nostats"]);
            }
        }
        c.arg("--")
            .arg(normalize(&r.url)?)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        let mut child = c.spawn().map_err(|_| "Unable to start downloader")?;
        {
            let mut map = jobs.lock().unwrap();
            let j = map.get_mut(&id).unwrap();
            if j.state == "canceled" {
                let _ = platform::signal(child.id(), "cancel");
                let _ = child.wait();
                return Ok(());
            }
            j.pid = child.id();
            j.state = "downloading".into();
            let _ = app.emit("job", j.clone());
        }
        let stderr = child.stderr.take().unwrap();
        let errors = std::thread::spawn(move || {
            let mut tail = String::new();
            for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                if tail.len() < 16384 {
                    tail.push_str(&line)
                }
            }
            tail
        });
        for line in BufReader::new(child.stdout.take().unwrap())
            .lines()
            .map_while(Result::ok)
        {
            if let Some(micros) = line.strip_prefix("out_time_us=") {
                if let (Ok(us), Some([a, b])) = (micros.parse::<f64>(), r.section) {
                    update(&app, &jobs, &id, |j| {
                        j.progress = (us / 1_000_000.0 / (b - a) * 100.).clamp(0., 99.9);
                        if r.precise {
                            j.state = "processing".into();
                        }
                    });
                }
            } else if let Some(bytes) = line.strip_prefix("total_size=") {
                update(&app, &jobs, &id, |j| j.bytes = format!("{bytes} B"));
            } else if let Some(rest) = line.strip_prefix("PROGRESS|") {
                let p: Vec<_> = rest.split('|').collect();
                if p.len() == 4 {
                    update(&app, &jobs, &id, |j| {
                        j.progress = p[0]
                            .trim()
                            .trim_end_matches('%')
                            .parse()
                            .unwrap_or(j.progress);
                        if p[1].trim() != "NA" {
                            j.speed = p[1].trim().into();
                        }
                        if p[2].trim() != "NA" {
                            j.bytes = p[2].trim().into();
                        }
                        j.eta = if p[3].trim() == "NA" {
                            String::new()
                        } else {
                            p[3].trim().into()
                        };
                    });
                }
            } else if let Some(path) = line.strip_prefix("FILE|") {
                update(&app, &jobs, &id, |j| j.path = path.into());
            } else if line.contains("[Merger]") {
                update(&app, &jobs, &id, |j| j.state = "merging".into());
            } else if line.contains("[Video") || line.contains("[ExtractAudio]") {
                update(&app, &jobs, &id, |j| j.state = "processing".into());
            }
        }
        let status = child
            .wait()
            .map_err(|_| "Downloader did not exit cleanly")?;
        let errors = errors.join().unwrap_or_default();
        update(&app, &jobs, &id, |j| j.pid = 0);
        if jobs.lock().unwrap()[&id].state == "canceled" {
            return Ok(());
        }
        if !status.success() {
            return Err(safe_error(&errors));
        }
        let path = jobs.lock().unwrap()[&id].path.clone();
        if path.is_empty() || !PathBuf::from(&path).is_file() {
            return Err("Downloader returned no output file".into());
        }
        if r.section.is_some() && !r.precise {
            normalize_fast(&app, &jobs, &id, &path, &r)?;
            if jobs.lock().unwrap()[&id].state == "canceled" {
                return Ok(());
            }
        }
        let probe = platform::command("ffprobe")?
            .args([
                "-v",
                "error",
                "-show_entries",
                "format=duration:stream=codec_type,codec_name,width,height,start_time,duration",
                "-of",
                "json",
                &path,
            ])
            .output()
            .map_err(|_| "Cannot inspect output")?;
        if !probe.status.success() {
            return Err("Output failed FFprobe inspection".into());
        }
        let data: serde_json::Value =
            serde_json::from_slice(&probe.stdout).map_err(|_| "Invalid inspection result")?;
        let streams = data["streams"].as_array().ok_or("Output has no streams")?;
        let has_audio = streams.iter().any(|s| s["codec_type"] == "audio");
        if r.mode == "audio" && streams.iter().any(|s| s["codec_type"] == "video") {
            return Err("Audio-only output unexpectedly contains video".into());
        }
        if r.mode == "video" && r.audio == "none" && has_audio {
            return Err("Output unexpectedly contains audio".into());
        }
        if (r.mode == "audio" || r.audio != "none") && !has_audio {
            return Err("Output audio stream is missing".into());
        }
        if r.mode == "video"
            && r.codec != "auto"
            && !streams
                .iter()
                .any(|s| s["codec_name"].as_str() == Some(r.codec.as_str()))
        {
            return Err("Output codec differs from the requested codec".into());
        }
        let duration = data["format"]["duration"]
            .as_str()
            .and_then(|v| v.parse::<f64>().ok())
            .ok_or("Output duration is missing")?;
        let expected = r.section.map(|[a, b]| b - a).unwrap_or(r.duration);
        let deviation = duration - expected;
        let message = format!(
            "Verified duration: {duration:.3}s (difference {deviation:+.3}s). {}",
            if r.section.is_some() && deviation.abs() > 0.25 {
                if r.precise {
                    "Warning: precise cut exceeds 250ms tolerance."
                } else {
                    "Fast Cut includes keyframe pre-roll. Use Precise Cut for exact boundaries."
                }
            } else {
                ""
            }
        );
        if let Some(h) = r.resolution {
            if r.mode == "video"
                && !data["streams"]
                    .as_array()
                    .unwrap_or(&vec![])
                    .iter()
                    .any(|v| v["height"].as_u64() == Some(h as u64))
            {
                return Err("Output dimensions differ from the requested resolution".into());
            }
        }
        update(&app, &jobs, &id, |j| {
            j.state = "completed".into();
            j.progress = 100.;
            j.speed.clear();
            j.eta.clear();
            j.message = message;
            j.pid = 0;
        });
        Ok(())
    })();
    if let Err(e) = result {
        update(&app, &jobs, &id, |j| {
            if j.state != "canceled" {
                j.state = "failed".into();
                j.message = e;
            }
            j.pid = 0;
        });
    }
}
// Some HTTP delivery formats retain a positive PTS origin when stream-copied.
// Normalize that origin locally without downloading or encoding any additional media.
fn normalize_fast(
    app: &tauri::AppHandle,
    jobs: &Arc<Mutex<HashMap<String, Job>>>,
    id: &str,
    path: &str,
    request: &Request,
) -> Result<(), String> {
    let scan = platform::command("ffprobe")?
        .args([
            "-v",
            "error",
            "-select_streams",
            if request.mode == "audio" {
                "a:0"
            } else {
                "v:0"
            },
            "-read_intervals",
            "%+#64",
            "-show_entries",
            "packet=pts_time:format=duration",
            "-of",
            "json",
            path,
        ])
        .output()
        .map_err(|_| "Cannot inspect clip timestamps")?;
    let v: serde_json::Value =
        serde_json::from_slice(&scan.stdout).map_err(|_| "Cannot read clip timestamps")?;
    let first = v["packets"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|p| p["pts_time"].as_str()?.parse::<f64>().ok())
        .filter(|n| n.is_finite())
        .reduce(f64::min)
        .ok_or("Clip has no media packets")?;
    let mut first = first;
    if request.mode == "audio" {
        if let Some([a, b]) = request.section {
            let duration = v["format"]["duration"]
                .as_str()
                .and_then(|s| s.parse::<f64>().ok())
                .ok_or("Audio clip duration is unavailable")?;
            if (duration - (b - a)).abs() > 0.25 {
                if (duration - b).abs() < 0.25 && first.abs() < 0.25 {
                    first = a;
                } else {
                    return Err(
                        "Fast Cut audio timestamps could not be aligned. Use Precise Cut.".into(),
                    );
                }
            }
        }
    }
    if first <= 0.25 {
        return Ok(());
    }
    let p = PathBuf::from(path);
    let ext = p
        .extension()
        .and_then(|e| e.to_str())
        .ok_or("Invalid clip extension")?;
    let temp = p.with_extension(format!("normalized.{ext}"));
    let child = platform::command("ffmpeg")?
        .args([
            "-v",
            "error",
            "-n",
            "-ss",
            &first.to_string(),
            "-i",
            path,
            "-map",
            "0",
            "-c",
            "copy",
            "-avoid_negative_ts",
            "make_zero",
        ])
        .arg(&temp)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| "Cannot normalize clip timestamps")?;
    let canceled = {
        let mut map = jobs.lock().unwrap();
        let j = map.get_mut(id).unwrap();
        if j.state == "canceled" {
            true
        } else {
            j.pid = child.id();
            j.state = "processing".into();
            let _ = app.emit("job", j.clone());
            false
        }
    };
    if canceled {
        let _ = platform::signal(child.id(), "cancel");
    }
    let output = child
        .wait_with_output()
        .map_err(|_| "Clip normalization worker stopped")?;
    update(app, jobs, id, |j| j.pid = 0);
    if jobs.lock().unwrap()[id].state == "canceled" {
        return Ok(());
    }
    if !output.status.success() {
        return Err(
            "Cannot normalize clip timestamps; the original partial output was retained".into(),
        );
    }
    std::fs::rename(temp, p).map_err(|_| "Cannot finalize normalized clip")?;
    Ok(())
}

#[tauri::command]
fn enqueue(app: tauri::AppHandle, s: State<Backend>, request: Request) -> Result<String, String> {
    validate(&request)?;
    if !PathBuf::from(&request.destination).is_dir() {
        return Err("Choose an existing destination folder".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let job = Job {
        id: id.clone(),
        title: request.title.clone(),
        state: "queued".into(),
        progress: 0.,
        speed: String::new(),
        bytes: String::new(),
        eta: String::new(),
        message: String::new(),
        path: String::new(),
        pid: 0,
        request,
    };
    s.jobs.lock().unwrap().insert(id.clone(), job.clone());
    let _ = app.emit("job", job);
    let settings = s.settings.lock().unwrap().clone();
    s.sender
        .send((id.clone(), settings))
        .map_err(|_| "Download worker is unavailable")?;
    Ok(id)
}
#[tauri::command]
fn jobs(s: State<Backend>) -> Vec<Job> {
    s.jobs.lock().unwrap().values().cloned().collect()
}
#[tauri::command]
fn control(
    app: tauri::AppHandle,
    s: State<Backend>,
    id: String,
    action: String,
) -> Result<(), String> {
    if !["pause", "resume", "cancel"].contains(&action.as_str()) {
        return Err("Invalid queue action".into());
    }
    let mut map = s.jobs.lock().unwrap();
    let j = map.get_mut(&id).ok_or("Unknown download")?;
    if ["completed", "failed", "canceled"].contains(&j.state.as_str()) {
        return Err("Download is no longer active".into());
    }
    if j.pid == 0 && action != "cancel" {
        return Err("Wait until the download starts before pausing".into());
    }
    if j.pid != 0 {
        platform::signal(j.pid, &action)?;
    }
    j.state = match action.as_str() {
        "pause" => "paused",
        "resume" => "downloading",
        _ => "canceled",
    }
    .into();
    let _ = app.emit("job", j.clone());
    Ok(())
}
#[tauri::command]
fn clear_completed(s: State<Backend>) {
    s.jobs.lock().unwrap().retain(|_, j| j.state != "completed");
}
#[tauri::command]
fn retry(app: tauri::AppHandle, s: State<Backend>, id: String) -> Result<String, String> {
    let request = {
        let map = s.jobs.lock().unwrap();
        let j = map.get(&id).ok_or("Unknown download")?;
        if j.state != "failed" {
            return Err("Only failed downloads can be retried".into());
        }
        j.request.clone()
    };
    enqueue(app, s, request)
}
#[tauri::command]
fn reveal(s: State<Backend>, id: String) -> Result<(), String> {
    let map = s.jobs.lock().unwrap();
    let j = map.get(&id).ok_or("Unknown download")?;
    if j.state != "completed" || !PathBuf::from(&j.path).is_file() {
        return Err("Completed file is unavailable".into());
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("/usr/bin/open")
            .args(["-R", &j.path])
            .spawn()
            .map_err(|_| "Could not reveal file")?;
    }
    #[cfg(not(target_os = "macos"))]
    return Err("Reveal is not implemented for this platform".into());
    Ok(())
}
pub fn run() {
    let app = tauri::Builder::default()
        .setup(|app| {
            let settings = settings_path(app.handle())
                .ok()
                .and_then(|p| std::fs::read(p).ok())
                .and_then(|b| serde_json::from_slice(&b).ok())
                .unwrap_or_default();
            let jobs: Arc<Mutex<HashMap<String, Job>>> = Arc::new(Mutex::new(HashMap::new()));
            let (sender, receiver) = std::sync::mpsc::channel::<(String, Settings)>();
            let worker_jobs = jobs.clone();
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                for (id, settings) in receiver {
                    if worker_jobs
                        .lock()
                        .unwrap()
                        .get(&id)
                        .is_some_and(|j| j.state != "canceled")
                    {
                        download(handle.clone(), worker_jobs.clone(), id, settings);
                    }
                }
            });
            app.manage(Backend {
                settings: Mutex::new(settings),
                jobs,
                sender,
                analyzer: Arc::new(Mutex::new(None)),
                origin: player::start().map_err(std::io::Error::other)?,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            pick_folder,
            pick_cookies,
            player_origin,
            analyze,
            enqueue,
            jobs,
            control,
            clear_completed,
            retry,
            reveal
        ])
        .build(tauri::generate_context!())
        .expect("Unable to start Video Downloader");
    app.run(|app, event| {
        if let tauri::RunEvent::Exit = event {
            let s = app.state::<Backend>();
            if let Some(pid) = *s.analyzer.lock().unwrap() {
                if pid != 0 {
                    let _ = platform::signal(pid, "cancel");
                }
            }
            for j in s.jobs.lock().unwrap().values() {
                if j.pid != 0 {
                    let _ = platform::signal(j.pid, "cancel");
                }
            }
        }
    });
}

#[cfg(test)]
mod error_tests {
    use super::*;
    #[test]
    fn sensitive_diagnostics_are_not_reflected() {
        let e = safe_error("Cookie decryption failed: SECRET_VALUE /private/auth-file.txt");
        assert!(!e.contains("SECRET_VALUE"));
        assert!(!e.contains("auth-file"));
        assert!(e.contains("Browser cookies"));
    }
    #[test]
    fn native_packaging_is_not_misreported_as_authentication() {
        let e = safe_error(
            "Failed to load Python shared library /private/temp/Python: different Team IDs",
        );
        assert!(e.contains("signature"));
        assert!(!e.contains("YouTube denied"));
    }
    #[test]
    fn macos_private_paths_do_not_imply_private_videos() {
        assert!(!safe_error("/private/var/tmp: unexpected failure").contains("YouTube denied"));
    }
}
