# Working across Mac and Windows

The private source repository is https://github.com/MolecularDust/TubeCutter. Sign into GitHub as an account with access before cloning. GitHub Desktop is a convenient option on both computers.

## First checkout

```sh
git clone https://github.com/MolecularDust/TubeCutter.git
cd TubeCutter
npm ci
```

Install Git and Node.js 22.12 or newer first. To preview the interface on either computer:

```sh
npm run dev
```

This preview does not provide native downloads or folder access. For the native Mac app, follow the Run and Release build sections in the README. A fresh Mac checkout can obtain the recorded media-tool versions with `node scripts/install-tools.mjs`; this installer currently supports Apple Silicon Macs only. Rust and Xcode Command Line Tools must also be installed.

## Moving work between computers

Before starting work, pull the latest changes. Before switching computers, commit and push your changes. In GitHub Desktop these are Pull origin, Commit to main, and Push origin.

```sh
git pull --ff-only
npm ci
# Make your changes, then:
git add <files-you-changed>
git commit -m "Describe your change"
git push
```

Commit or stash local edits before pulling. If Git reports that branches have diverged, resolve the differences before continuing; avoid force pushing. Dependencies, media tools, build outputs, app preferences, and downloaded videos are local to each computer and are not synchronized by Git. Install dependencies separately with `npm ci`; never copy node_modules between operating systems. The repository includes source, icons, lockfiles, documentation, and project history. App installers should be distributed separately from source.

## Windows version: remaining work

The source is now accessible on Windows, but the Windows desktop release has not been implemented or verified. The desktop launcher supports Windows path separators and invokes the Tauri CLI through Node. The current `npm run package`, `package:dev`, and sidecar preparation scripts still target macOS.

For future native development, install Rust with the MSVC toolchain, Microsoft C++ Build Tools with Desktop development with C++, and WebView2. Follow the official prerequisites: https://tauri.app/start/prerequisites/.

Before producing a Windows installer:

- Provide trusted Windows yt-dlp, FFmpeg, FFprobe, and Deno executables with recorded checksums and licensing information; support `.exe` discovery and Windows target-suffixed sidecars.
- Implement and verify Windows process-tree cancellation and pause/resume; the current process-control implementation explicitly rejects non-Unix platforms.
- Resolve bundled certificates and resources using Windows-compatible paths and implement opening saved files in Explorer.
- Add a Windows bundle configuration and installer command, then build and test on Windows, including preview, clipboard, folder selection, full downloads, cuts, cancellation cleanup, and queue clearing.
- Decide on Windows signing before distributing publicly.

The existing macOS build remains the verified release target. Sharing the source does not imply that a functional Windows installer already exists.
