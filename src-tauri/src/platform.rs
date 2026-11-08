use std::{path::PathBuf, process::Command};
pub fn binary(name: &str) -> Result<PathBuf, String> {
    let exe = std::env::current_exe().map_err(|_| "Cannot locate application")?;
    if name == "yt-dlp" {
        // Unpacked build: starts in ~0.2 s instead of unpacking itself on every launch.
        let unpacked = exe.parent().unwrap().join("../Resources/yt-dlp/yt-dlp_macos");
        if unpacked.is_file() {
            return Ok(unpacked);
        }
        if cfg!(debug_assertions) {
            let local = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../.tools/yt-dlp-dir/yt-dlp_macos");
            if local.is_file() {
                return Ok(local);
            }
        }
    }
    let bundled = exe.parent().unwrap().join(name);
    if bundled.is_file() {
        return Ok(bundled);
    }
    if cfg!(debug_assertions) {
        let local = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../.tools/bin")
            .join(name);
        if local.is_file() {
            return Ok(local);
        }
        for dir in std::env::split_paths(&std::env::var_os("PATH").unwrap_or_default()).chain([
            PathBuf::from("/opt/homebrew/bin"),
            PathBuf::from("/usr/local/bin"),
        ]) {
            let p = dir.join(name);
            if p.is_file() {
                return Ok(p);
            }
        }
    }
    Err(format!(
        "{name} is missing. Prepare media tools; see README."
    ))
}
static CACHE_DIR: std::sync::OnceLock<PathBuf> = std::sync::OnceLock::new();
/// Private folder where yt-dlp keeps downloaded player scripts and solved challenges.
pub fn set_cache_dir(path: PathBuf) {
    let _ = std::fs::create_dir_all(&path);
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o700));
    }
    let _ = CACHE_DIR.set(path);
}
/// The yt-dlp cache folder, unless caching is disabled (TUBECUTTER_NO_CACHE=1, for timing comparisons).
pub fn cache_dir() -> Option<&'static PathBuf> {
    if std::env::var_os("TUBECUTTER_NO_CACHE").is_some_and(|v| v == "1") {
        return None;
    }
    CACHE_DIR.get()
}
/// Whether a process id belongs to a running process. Used to recognise leftovers of dead instances.
pub fn process_alive(pid: u32) -> bool {
    let r = unsafe { libc::kill(pid as i32, 0) };
    r == 0 || std::io::Error::last_os_error().raw_os_error() == Some(libc::EPERM)
}
pub fn command(name: &str) -> Result<Command, String> {
    let mut c = Command::new(binary(name)?);
    // Interpreter mode works under hardened signing without JIT entitlements.
    c.env("DENO_V8_FLAGS", "--jitless");
    let exe = std::env::current_exe().map_err(|_| "Cannot locate application")?;
    let bundled_ca = exe
        .parent()
        .unwrap()
        .join("../Resources/resources/cacert.pem");
    let ca = if bundled_ca.is_file() {
        bundled_ca
    } else if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/cacert.pem")
    } else {
        return Err("Bundled certificate store is missing".into());
    };
    if ca.is_file() {
        c.env("SSL_CERT_FILE", ca);
    }
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        c.process_group(0);
    }
    Ok(c)
}
pub fn signal(pid: u32, action: &str) -> Result<(), String> {
    #[cfg(unix)]
    {
        let sig = match action {
            "pause" => libc::SIGSTOP,
            "resume" => libc::SIGCONT,
            _ => libc::SIGKILL,
        };
        if unsafe { libc::kill(-(pid as i32), sig) } != 0 {
            return Err("Process has already exited".into());
        }
        Ok(())
    }
    #[cfg(not(unix))]
    {
        let _ = (pid, action);
        Err("Process control not yet supported on this platform".into())
    }
}
#[cfg(all(test, unix))]
mod tests {
    use super::*;
    #[test]
    fn isolated_process_pause_resume_cancel() {
        use std::os::unix::process::{CommandExt, ExitStatusExt};
        let mut child = Command::new("/bin/sleep")
            .arg("30")
            .process_group(0)
            .spawn()
            .unwrap();
        let pid = child.id();
        assert_eq!(unsafe { libc::getpgid(pid as i32) }, pid as i32);
        signal(pid, "pause").unwrap();
        let mut status = 0;
        assert_eq!(
            unsafe { libc::waitpid(pid as i32, &mut status, libc::WUNTRACED) },
            pid as i32
        );
        assert!(libc::WIFSTOPPED(status));
        signal(pid, "resume").unwrap();
        signal(pid, "cancel").unwrap();
        assert_eq!(child.wait().unwrap().signal(), Some(libc::SIGKILL));
    }
}

#[cfg(test)]
mod process_tests {
    use super::*;
    #[test]
    fn own_process_is_alive_and_an_impossible_pid_is_not() {
        assert!(process_alive(std::process::id()));
        assert!(!process_alive(2_147_483_646));
    }
}
