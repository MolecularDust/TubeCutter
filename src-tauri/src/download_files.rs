use std::path::{Path, PathBuf};

/// Owns one download's staging directory. Only verified output is published.
pub struct DownloadFiles {
    pub directory: PathBuf,
    destination: PathBuf,
}
impl DownloadFiles {
    pub fn new(destination: &Path) -> Result<Self, String> {
        let destination = destination
            .canonicalize()
            .map_err(|_| "Destination is unavailable")?;
        let directory = destination.join(format!(".tubecutter-{}.partial", uuid::Uuid::new_v4()));
        std::fs::create_dir(&directory).map_err(|_| "Cannot create download staging folder")?;
        Ok(Self {
            directory,
            destination,
        })
    }
    pub fn publish(&self, path: &Path) -> Result<PathBuf, String> {
        let path = path
            .canonicalize()
            .map_err(|_| "Verified output is unavailable")?;
        if path.parent() != Some(self.directory.as_path()) {
            return Err("Output is outside this download's staging folder".into());
        }
        let destination = self
            .destination
            .join(path.file_name().ok_or("Output has no filename")?);
        // Staging is on the same volume. A hard link publishes atomically without overwriting.
        std::fs::hard_link(path, &destination).map_err(|_| {
            "Cannot save output; check for an existing filename or destination permissions"
        })?;
        Ok(destination)
    }
    pub fn cleanup(&self) -> Result<(), String> {
        match std::fs::remove_dir_all(&self.directory) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(_) => Err(
                "Could not remove temporary download files. Check destination permissions.".into(),
            ),
        }
    }
}
impl Drop for DownloadFiles {
    fn drop(&mut self) {
        let _ = self.cleanup();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn destination() -> PathBuf {
        let path = std::env::temp_dir().join(format!("tubecutter-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&path).unwrap();
        path
    }
    #[test]
    fn cancellation_removes_all_job_artifacts_and_preserves_other_files() {
        let dest = destination();
        std::fs::write(dest.join("existing.mp4"), b"keep").unwrap();
        let files = DownloadFiles::new(&dest).unwrap();
        for name in [
            "video.mp4.part",
            "video.f137.mp4",
            "video.normalized.mp4",
            "video.en.vtt",
            "video.mp4.ytdl",
        ] {
            std::fs::write(files.directory.join(name), b"partial").unwrap();
        }
        files.cleanup().unwrap();
        assert!(!files.directory.exists());
        assert_eq!(std::fs::read(dest.join("existing.mp4")).unwrap(), b"keep");
        assert_eq!(std::fs::read_dir(&dest).unwrap().count(), 1);
        std::fs::remove_dir_all(dest).unwrap();
    }
    #[cfg(unix)]
    #[test]
    fn cleanup_does_not_follow_links_to_unrelated_files() {
        let dest = destination();
        let outside = dest.join("unrelated");
        std::fs::create_dir(&outside).unwrap();
        std::fs::write(outside.join("keep.mp4"), b"keep").unwrap();
        let files = DownloadFiles::new(&dest).unwrap();
        std::os::unix::fs::symlink(&outside, files.directory.join("link")).unwrap();
        files.cleanup().unwrap();
        assert_eq!(std::fs::read(outside.join("keep.mp4")).unwrap(), b"keep");
        std::fs::remove_dir_all(dest).unwrap();
    }
    #[test]
    fn completed_output_survives_cleanup_and_existing_files_are_never_overwritten() {
        let dest = destination();
        let files = DownloadFiles::new(&dest).unwrap();
        let source = files.directory.join("video.mp4");
        std::fs::write(&source, b"complete").unwrap();
        let final_path = files.publish(&source).unwrap();
        assert!(files.publish(&source).is_err());
        assert!(files.publish(&dest.join("video.mp4")).is_err());
        files.cleanup().unwrap();
        assert_eq!(std::fs::read(final_path).unwrap(), b"complete");
        std::fs::remove_dir_all(dest).unwrap();
    }
}
