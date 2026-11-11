# TubeCutter

**Stop downloading whole videos. Grab only the moment you want.**

TubeCutter is the fastest way to save exactly the part of a YouTube video you need. Paste a link, preview it, drag to mark your In and Out points, and TubeCutter cuts just that section into a clean file. Queue as many clips as you like, pause or cancel anytime, and keep the ones you love.

Made for Windows and Mac. See [test results](docs/TEST_RESULTS.md) for what has actually been verified.

<p align="center">
  <img src="docs/images/tubecutter-main.webp" alt="TubeCutter main window: paste a YouTube link, preview the video, choose a section, and add it to the download queue" width="420">
</p>

**Current release status:** the Windows x64 setup is published on the [v0.1.1 release](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). It is not code-signed, so Windows SmartScreen may warn on first run. The macOS Apple Silicon `.app` and `.dmg` are functional local evaluation builds. Signed-tool metadata/download tests and signature/image integrity checks pass. The user-approved library-validation exception applies only to yt-dlp; the main app retains validation and Deno runs with JIT disabled. See [signing details](docs/SIGNING_APPROVAL.md). The build is ad-hoc signed, not Developer ID signed or notarized.

## Download

- **Windows:** download `TubeCutter-Setup_0.1.1_x64.exe` from the [latest release](https://github.com/MolecularDust/TubeCutter/releases/latest). Choose a regular install or a portable copy.
- **Mac (Apple Silicon):** build from source using the macOS sections below.

## Build for Windows (x64)

Install Rust with the MSVC toolchain, Microsoft C++ Build Tools with Desktop development with C++, and WebView2. See the [Tauri prerequisites](https://tauri.app/start/prerequisites/).

```powershell
npm ci
npm run install:tools:windows
npm run package:windows
npm run package:windows-installer
```

The setup file is written to `src-tauri/target/release/bundle/setup-choice`. See [working across computers](docs/CROSS_PLATFORM.md) for the Windows release notes.

## Run

For cloning on Windows or Mac, moving changes between computers, and the remaining Windows release work, see [working across computers](docs/CROSS_PLATFORM.md).

Requires Node.js 22.12+ and Xcode Command Line Tools for development. This workspace has project-local Rust under `.tools`; no shell profile was changed.

```sh
npm ci
npm run desktop
```

`npm run dev` opens only the frontend preview. Use the desktop command for native features.

On a fresh checkout, install Rust using https://rustup.rs or install it locally with `CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup"` and `--no-modify-path`. The desktop script uses project-local Rust when present. Place trusted standalone yt-dlp, FFmpeg, FFprobe and Deno binaries in `.tools/bin`. Development also searches PATH and conventional Homebrew locations; packaged builds use only adjacent bundled executables.

## macOS development app bundle

```sh
npm run package:dev
```

This produces a local development `.app` at `src-tauri/target/debug/bundle/macos/TubeCutter.app`. It uses the development signing posture, not the hardened distribution configuration. It is suitable for local evaluation, not public distribution.

## macOS release build

```sh
npm run package
```

This prepares target-suffixed sidecars, rejects Homebrew-linked executables, builds the frontend/native app, applies the approved exception only to yt-dlp, re-seals the outer app without broadening other executables' entitlements, verifies the signed runtimes, and creates/checks the DMG. Artifacts are under `src-tauri/target/release/bundle`; final executable/image hashes are in `docs/release-artifacts.json`. End users do not need Node, Python, Rust, Deno, yt-dlp or FFmpeg installed separately. Production signing and notarization require your own Apple Developer identity; the local build is not notarized.

Binaries are excluded from Git. The installed versions/hashes are recorded in `docs/tool-manifest.json`. See `scripts/install-tools.mjs` for reproducible downloads for this target and `docs/DEPENDENCIES.md` for source provenance and licensing obligations. Future x64 macOS, Windows and Linux builds need target-specific tool distributions, process control verification, and native CI; they are not verified here.

## Use

1. Choose a destination folder with the native picker.
2. Paste a YouTube watch, youtu.be or Shorts link and Analyze.
3. Use the full-width YouTube player. Its native controls handle playback and volume.
4. The timeline enables automatically after analysis. Leave In/Out unchanged to download the entire video; changing either point selects a cut. Reset restores the full video. Drag In/Out, edit HH:MM:SS(.mmm), or use Set In/Set Out. I/O work outside fields; Space toggles playback. Drag the red triangle above the track to scrub the playhead independently of In/Out. Arrow keys move a focused marker or playhead by 0.1s, Shift+Arrow by 1s; Home/End move the playhead to the video boundaries.
5. Padding defaults to 00 seconds and extends each end, stopping at the video boundaries. Length shows the resulting padded duration. In, Out, Padding, and Length have one-second up/down buttons; Length buttons adjust Out. Preview selection plays the padded range and becomes Stop during playback. Choose Fast Cut or Precise Cut.
6. Download settings starts expanded; click its heading to collapse or reopen it. Select a container, actual source resolution, codec, audio, subtitles and mode; add to the queue.
7. Pause/resume or cancel active downloads. Retry failures and reveal completed files in Finder. Clear Finished removes completed, canceled, and failed rows while preserving active jobs and saved files.

Account & Settings defaults to anonymous. **Sign in to Google** / **Connect YouTube** open Google's own pages in an app window whose login persists in the app's webview storage; choosing *App's YouTube session* then gives yt-dlp a private, per-job cookie snapshot (mode 0600, deleted afterward and swept at startup) with no browser or Keychain access.

Speed: yt-dlp ships unpacked (starts in ~0.2 s instead of re-extracting itself each run), Analyze's metadata is reused by the matching download for up to 20 minutes (with a fresh-extraction retry if it fails), and yt-dlp uses a private cache folder. Set `TUBECUTTER_NO_CACHE=1` to compare without the cache. Selecting a browser explicitly authorizes subsequent access to that browser's cookies and may trigger OS permissions. Do not import or share anyone else's cookies. Only paths/preferences are stored in the app config directory. Authentication is optional.

## Checks

```sh
npm run build
npm run lint
npm test
CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup" .tools/cargo/bin/cargo test --manifest-path src-tauri/Cargo.toml
CARGO_HOME="$PWD/.tools/cargo" RUSTUP_HOME="$PWD/.tools/rustup" .tools/cargo/bin/cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

Read [architecture and dependency notes](docs/DEPENDENCIES.md) and [verification status](docs/TEST_RESULTS.md) before relying on a feature. Downloads only support content you own or have permission to download.
