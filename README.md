# TubeCutter

A native Tauri 2 + React + Rust desktop application for authorized YouTube downloads, embedded preview, section selection, and a managed download queue. macOS Apple Silicon is the current build target. See [test results](docs/TEST_RESULTS.md) for what has actually been verified.

**Current release status:** the macOS Apple Silicon `.app` and `.dmg` are functional local evaluation builds. Signed-tool metadata/download tests and signature/image integrity checks pass. The user-approved library-validation exception applies only to yt-dlp; the main app retains validation and Deno runs with JIT disabled. See [signing details](docs/SIGNING_APPROVAL.md). The build is ad-hoc signed, not Developer ID signed or notarized.

## Run

Requires Node.js 22.12+ and Xcode Command Line Tools for development. This workspace has project-local Rust under `.tools`; no shell profile was changed.

```sh
npm ci
npm run desktop
```

`npm run dev` opens only the frontend preview. Use the desktop command for native features.

On a fresh checkout, install Rust using https://rustup.rs or install it locally with `CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup"` and `--no-modify-path`. The desktop script uses project-local Rust when present. Place trusted standalone yt-dlp, FFmpeg, FFprobe and Deno binaries in `.tools/bin`. Development also searches PATH and conventional Homebrew locations; packaged builds use only adjacent bundled executables.

## Local development app bundle

```sh
npm run package:dev
```

This produces a local development `.app` at `src-tauri/target/debug/bundle/macos/TubeCutter.app`. It uses the development signing posture, not the hardened distribution configuration. It is suitable for local evaluation, not public distribution.

## Release build

```sh
npm run package
```

This prepares target-suffixed sidecars, rejects Homebrew-linked executables, builds the frontend/native app, applies the approved exception only to yt-dlp, re-seals the outer app without broadening other executables' entitlements, verifies the signed runtimes, and creates/checks the DMG. Artifacts are under `src-tauri/target/release/bundle`; final executable/image hashes are in `docs/release-artifacts.json`. End users do not need Node, Python, Rust, Deno, yt-dlp or FFmpeg installed separately. Production signing and notarization require your own Apple Developer identity; the local build is not notarized.

Binaries are excluded from Git. The installed versions/hashes are recorded in `docs/tool-manifest.json`. See `scripts/install-tools.mjs` for reproducible downloads for this target and `docs/DEPENDENCIES.md` for source provenance and licensing obligations. Future x64 macOS, Windows and Linux builds need target-specific tool distributions, process control verification, and native CI; they are not verified here.

## Use

1. Choose a destination folder with the native picker.
2. Paste a YouTube watch, youtu.be or Shorts link and Analyze.
3. Use the full-width YouTube player. Its native controls handle playback and volume.
4. Enable “Download only a section of the video” to enable the always-visible timeline. Drag In/Out, edit HH:MM:SS(.mmm), or use Set In/Set Out. I/O work outside fields; Space toggles playback. Arrow keys move a focused marker by 0.1s, Shift+Arrow by 1s.
5. Edit Length (seconds) to adjust Out; changing In or Out updates Length. Preview selection plays from In and pauses at Out; the button becomes Stop during preview. Choose Fast Cut or Precise Cut.
6. Select a container, actual source resolution, codec, audio, subtitles and mode; add to the queue.
7. Pause/resume or cancel active downloads. Retry failures and reveal completed files in Finder.

Account & Settings defaults to anonymous. Selecting a browser explicitly authorizes subsequent access to that browser's cookies and may trigger OS permissions. Do not import or share anyone else's cookies. Only paths/preferences are stored in the app config directory. Authentication is optional.

## Checks

```sh
npm run build
npm run lint
npm test
CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup" .tools/cargo/bin/cargo test --manifest-path src-tauri/Cargo.toml
CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup" .tools/cargo/bin/cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

Read [architecture and dependency notes](docs/DEPENDENCIES.md) and [verification status](docs/TEST_RESULTS.md) before relying on a feature. Downloads only support content you own or have permission to download.
