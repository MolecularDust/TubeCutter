use std::{path::PathBuf, process::Command};
#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;
pub fn binary(name: &str) -> Result<PathBuf, String> {
    let file = format!("{name}{}", std::env::consts::EXE_SUFFIX);
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
    let bundled = exe.parent().unwrap().join(&file);
    if bundled.is_file() {
        return Ok(bundled);
    }
    if cfg!(debug_assertions) {
        let local = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../.tools/bin")
            .join(&file);
        if local.is_file() {
            return Ok(local);
        }
        for dir in std::env::split_paths(&std::env::var_os("PATH").unwrap_or_default()).chain([
            PathBuf::from("/opt/homebrew/bin"),
            PathBuf::from("/usr/local/bin"),
        ]) {
            let p = dir.join(&file);
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
#[cfg(unix)]
pub fn process_alive(pid: u32) -> bool {
    let r = unsafe { libc::kill(pid as i32, 0) };
    r == 0 || std::io::Error::last_os_error().raw_os_error() == Some(libc::EPERM)
}
/// Whether a process id belongs to a running process. Used to recognise leftovers of dead instances.
#[cfg(windows)]
pub fn process_alive(pid: u32) -> bool {
    use windows_sys::Win32::{
        Foundation::{CloseHandle, GetLastError, ERROR_ACCESS_DENIED, STILL_ACTIVE},
        System::Threading::{
            GetExitCodeProcess, OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION,
        },
    };
    unsafe {
        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
        if handle.is_null() {
            // A process we may not open still exists.
            return GetLastError() == ERROR_ACCESS_DENIED;
        }
        let mut code = 0;
        let running = GetExitCodeProcess(handle, &mut code) != 0 && code == STILL_ACTIVE as u32;
        CloseHandle(handle);
        running
    }
}
pub fn command(name: &str) -> Result<Command, String> {
    let mut c = Command::new(binary(name)?);
    // Interpreter mode works under hardened signing without JIT entitlements.
    c.env("DENO_V8_FLAGS", "--jitless");
    #[cfg(windows)]
    if std::env::var_os("http_proxy").is_none() && std::env::var_os("HTTP_PROXY").is_none() {
        if let Some(proxy) = system_proxy() {
            c.env("http_proxy", proxy).env("https_proxy", proxy);
        }
    }
    let exe = std::env::current_exe().map_err(|_| "Cannot locate application")?;
    // macOS bundles resources under Contents/Resources; Windows installs them beside the executable.
    let bundled_ca = [
        exe.parent().unwrap().join("../Resources/resources/cacert.pem"),
        exe.parent().unwrap().join("resources/cacert.pem"),
    ]
    .into_iter()
    .find(|p| p.is_file());
    let ca = if let Some(bundled_ca) = bundled_ca {
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
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // Helper processes spawned by the GUI app must not open console windows.
        c.creation_flags(CREATE_NO_WINDOW);
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
    #[cfg(windows)]
    {
        match action {
            "pause" => set_tree_suspended(pid, true),
            "resume" => set_tree_suspended(pid, false),
            _ => kill_tree(pid),
        }
    }
    #[cfg(not(any(unix, windows)))]
    {
        let _ = (pid, action);
        Err("Process control not yet supported on this platform".into())
    }
}
// yt-dlp.exe is a bootloader that starts a child Python process, and FFmpeg runs as a further child.
// Windows has no process groups for this, so the tree is collected from a process snapshot.
#[cfg(windows)]
fn process_tree(root: u32) -> Result<Vec<u32>, String> {
    use windows_sys::Win32::{
        Foundation::{CloseHandle, INVALID_HANDLE_VALUE},
        System::Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
            TH32CS_SNAPPROCESS,
        },
    };
    let mut parents = Vec::new();
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if snapshot == INVALID_HANDLE_VALUE {
            return Err("Cannot inspect download process".into());
        }
        let mut entry: PROCESSENTRY32W = std::mem::zeroed();
        entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;
        let mut more = Process32FirstW(snapshot, &mut entry) != 0;
        while more {
            parents.push((entry.th32ProcessID, entry.th32ParentProcessID));
            more = Process32NextW(snapshot, &mut entry) != 0;
        }
        CloseHandle(snapshot);
    }
    if !parents.iter().any(|(pid, _)| *pid == root) {
        return Err("Process has already exited".into());
    }
    let mut tree = vec![root];
    let mut next = 0;
    while next < tree.len() {
        let parent = tree[next];
        for &(pid, ppid) in &parents {
            if ppid == parent && pid != 0 && !tree.contains(&pid) {
                tree.push(pid);
            }
        }
        next += 1;
    }
    Ok(tree)
}
#[cfg(windows)]
fn set_tree_suspended(pid: u32, suspend: bool) -> Result<(), String> {
    use windows_sys::Win32::{
        Foundation::{CloseHandle, FALSE, INVALID_HANDLE_VALUE},
        System::{
            Diagnostics::ToolHelp::{
                CreateToolhelp32Snapshot, Thread32First, Thread32Next, TH32CS_SNAPTHREAD,
                THREADENTRY32,
            },
            Threading::{OpenThread, ResumeThread, SuspendThread, THREAD_SUSPEND_RESUME},
        },
    };
    let tree = process_tree(pid)?;
    let mut changed = 0;
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
        if snapshot == INVALID_HANDLE_VALUE {
            return Err("Cannot inspect download threads".into());
        }
        let mut entry: THREADENTRY32 = std::mem::zeroed();
        entry.dwSize = std::mem::size_of::<THREADENTRY32>() as u32;
        let mut more = Thread32First(snapshot, &mut entry) != 0;
        while more {
            if tree.contains(&entry.th32OwnerProcessID) {
                let thread = OpenThread(THREAD_SUSPEND_RESUME, FALSE, entry.th32ThreadID);
                if !thread.is_null() {
                    // Both calls return u32::MAX on failure.
                    let result = if suspend {
                        SuspendThread(thread)
                    } else {
                        ResumeThread(thread)
                    };
                    if result != u32::MAX {
                        changed += 1;
                    }
                    CloseHandle(thread);
                }
            }
            more = Thread32Next(snapshot, &mut entry) != 0;
        }
        CloseHandle(snapshot);
    }
    if changed == 0 {
        return Err("Process has already exited".into());
    }
    Ok(())
}
#[cfg(windows)]
fn kill_tree(pid: u32) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    let status = Command::new("taskkill")
        .args(["/T", "/F", "/PID", &pid.to_string()])
        .creation_flags(CREATE_NO_WINDOW)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .map_err(|_| "Could not stop download process")?;
    if status.success() {
        Ok(())
    } else {
        Err("Process has already exited".into())
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
#[cfg(all(test, windows))]
mod tests {
    use super::*;
    #[test]
    fn isolated_process_pause_resume_cancel() {
        let mut child = Command::new("ping")
            .args(["-n", "60", "127.0.0.1"])
            .stdout(std::process::Stdio::null())
            .spawn()
            .unwrap();
        let pid = child.id();
        signal(pid, "pause").unwrap();
        assert!(child.try_wait().unwrap().is_none());
        signal(pid, "resume").unwrap();
        signal(pid, "cancel").unwrap();
        assert!(!child.wait().unwrap().success());
        assert!(signal(pid, "cancel").is_err());
    }
}

/// The Windows system proxy ("Internet Options"), as `http://host:port`.
/// yt-dlp reads it by itself, but FFmpeg (used for section downloads) only follows
/// `http_proxy`, so without it FFmpeg connects directly and fails where a proxy is required.
#[cfg(windows)]
fn system_proxy() -> Option<&'static str> {
    use std::{os::windows::process::CommandExt, sync::OnceLock};
    static PROXY: OnceLock<Option<String>> = OnceLock::new();
    PROXY
        .get_or_init(|| {
            let query = |name: &str| -> Option<String> {
                let out = Command::new("reg")
                    .args([
                        "query",
                        r"HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings",
                        "/v",
                        name,
                    ])
                    .creation_flags(CREATE_NO_WINDOW)
                    .output()
                    .ok()?;
                let text = String::from_utf8_lossy(&out.stdout).into_owned();
                text.lines()
                    .find(|l| l.trim_start().starts_with(name))
                    .and_then(|l| l.split_whitespace().last().map(str::to_string))
            };
            if query("ProxyEnable")?.trim_start_matches("0x").trim_start_matches('0') != "1" {
                return None;
            }
            let list = query("ProxyServer")?;
            let pick = |scheme: &str| {
                list.split(';')
                    .find_map(|p| p.strip_prefix(&format!("{scheme}=")))
                    .map(str::to_string)
            };
            let server = if list.contains('=') {
                pick("https").or_else(|| pick("http"))?
            } else {
                list
            };
            let server = server.trim().to_string();
            if server.is_empty() || server.starts_with("socks") {
                return None;
            }
            Some(if server.contains("://") {
                server
            } else {
                format!("http://{server}")
            })
        })
        .as_deref()
}
