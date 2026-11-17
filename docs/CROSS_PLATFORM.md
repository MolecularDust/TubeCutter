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

## Windows build (x64 and ARM64)

Install Rust with the MSVC toolchain, Microsoft C++ Build Tools with Desktop development with C++, and WebView2. Follow the official prerequisites: https://tauri.app/start/prerequisites/.

```powershell
npm ci
npm run install:tools:windows
npm run desktop
```

`install:tools:windows` downloads the pinned yt-dlp, Deno, FFmpeg, and FFprobe builds listed in `docs/tool-downloads-windows.json` (x64) or `docs/tool-downloads-windows-arm64.json` (ARM64), verifies each against its SHA256, and stages them in `.tools/bin` and `src-tauri/binaries`. Its results are recorded in `docs/tool-manifest-windows.json` or `docs/tool-manifest-windows-arm64.json`.

`npm run package:windows` produces the target-architecture NSIS setup executable. `npm run package:windows-installer` builds the setup choice installer (`TubeCutter-Setup_0.1.1_Windows_<arch>.exe`). Installers are not code-signed. Windows SmartScreen may warn on first run until signing is decided.

Windows pause, resume, and cancel act on the whole process tree, because the yt-dlp executable starts a child process. Process control has a unit test on Windows. The complete download, cut, and cancel flow in the installed app still needs manual testing, including preview, clipboard, folder selection, cancellation cleanup, and queue clearing.

## Windows version: remaining work

- Safari cookies are macOS-only; the Account & Settings browser list should not offer Safari on Windows.
- Windows signing, the Windows release checklist, and licensing notes for the Windows media-tool builds are not yet done.

The macOS build remains the release target with the complete signing and license record.
