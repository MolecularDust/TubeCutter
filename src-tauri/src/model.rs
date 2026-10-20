use serde::{Deserialize, Serialize};
#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub destination: String,
    pub browser: String,
    pub cookies_file: String,
    pub appearance: String,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub url: String,
    pub title: String,
    pub destination: String,
    pub container: String,
    pub resolution: Option<u32>,
    pub codec: String,
    pub audio: String,
    pub mode: String,
    pub subtitle: String,
    pub section: Option<[f64; 2]>,
    pub precise: bool,
    pub duration: f64,
}
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Job {
    pub id: String,
    pub title: String,
    pub state: String,
    pub progress: f64,
    pub speed: String,
    pub bytes: String,
    pub eta: String,
    pub message: String,
    pub path: String,
    #[serde(skip)]
    pub pid: u32,
    #[serde(skip)]
    pub request: Request,
}
pub fn normalize(input: &str) -> Result<String, String> {
    let u = url::Url::parse(input.trim()).map_err(|_| "Enter a valid YouTube URL")?;
    if !["https", "http"].contains(&u.scheme())
        || !u.username().is_empty()
        || u.password().is_some()
        || u.port().is_some()
    {
        return Err("Unsupported URL".into());
    }
    let id = match u.host_str().unwrap_or("") {
        "youtu.be" => u.path().trim_start_matches('/').to_string(),
        "youtube.com" | "www.youtube.com" | "m.youtube.com" => {
            if u.path() == "/watch" {
                u.query_pairs()
                    .find(|(k, _)| k == "v")
                    .map(|(_, v)| v.into_owned())
                    .unwrap_or_default()
            } else {
                u.path()
                    .strip_prefix("/shorts/")
                    .unwrap_or("")
                    .trim_end_matches('/')
                    .to_string()
            }
        }
        _ => return Err("Only YouTube video links are supported".into()),
    };
    if id.len() != 11
        || !id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
    {
        return Err("Invalid YouTube video ID".into());
    }
    Ok(format!("https://www.youtube.com/watch?v={id}"))
}
pub fn validate(r: &Request) -> Result<(), String> {
    normalize(&r.url)?;
    if !["mp4", "mkv"].contains(&r.container.as_str())
        || !["auto", "h264", "hevc", "av1", "vp9"].contains(&r.codec.as_str())
        || !["best", "original", "none"].contains(&r.audio.as_str())
        || !["video", "audio"].contains(&r.mode.as_str())
    {
        return Err("Invalid output settings".into());
    }
    if !r.duration.is_finite() || r.duration <= 0. {
        return Err("A finite video duration is required".into());
    }
    if let Some([a, b]) = r.section {
        if !a.is_finite() || !b.is_finite() || a < 0. || a >= b || b > r.duration {
            return Err("Selection must satisfy 0 ≤ In < Out ≤ duration".into());
        }
    }
    if !r.subtitle.is_empty()
        && !r
            .subtitle
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return Err("Invalid subtitle language".into());
    }
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn urls() {
        for s in [
            "https://youtu.be/BaW_jenozKc",
            "https://youtube.com/shorts/BaW_jenozKc",
            "https://www.youtube.com/watch?v=BaW_jenozKc&list=bad",
        ] {
            assert_eq!(
                normalize(s).unwrap(),
                "https://www.youtube.com/watch?v=BaW_jenozKc"
            )
        }
        for s in [
            "https://youtube.com.evil.com/watch?v=BaW_jenozKc",
            "file:///tmp/a",
            "https://user@youtube.com/watch?v=BaW_jenozKc",
            "https://youtu.be/--exec",
        ] {
            assert!(normalize(s).is_err())
        }
    }
}
#[cfg(test)]
mod selection_tests {
    use super::*;
    fn request() -> Request {
        Request {
            url: "https://youtu.be/aqz-KE-bpKQ".into(),
            title: "Test".into(),
            destination: "/tmp".into(),
            container: "mp4".into(),
            resolution: Some(1080),
            codec: "h264".into(),
            audio: "best".into(),
            mode: "video".into(),
            subtitle: String::new(),
            section: Some([1., 3.]),
            precise: true,
            duration: 10.,
        }
    }
    #[test]
    fn section_boundaries() {
        let mut r = request();
        assert!(validate(&r).is_ok());
        for bounds in [[-1., 3.], [3., 3.], [4., 3.], [1., 11.], [f64::NAN, 3.]] {
            r.section = Some(bounds);
            assert!(validate(&r).is_err());
        }
    }
    #[test]
    fn reject_command_injection_in_enums() {
        let mut r = request();
        r.codec = "h264; touch /tmp/injected".into();
        assert!(validate(&r).is_err());
        r = request();
        r.subtitle = "en --exec bad".into();
        assert!(validate(&r).is_err());
    }
    #[test]
    fn reject_nonfinite_duration() {
        let mut r = request();
        r.duration = f64::INFINITY;
        assert!(validate(&r).is_err());
    }
}
