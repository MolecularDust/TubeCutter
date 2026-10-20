# Approved yt-dlp signing exception

On 20 October 2026, the user explicitly approved adding the following entitlement **only to the separate yt-dlp executable**:

```xml
<key>com.apple.security.cs.disable-library-validation</key>
<true/>
```

It permits yt-dlp's PyInstaller process to map its bundled Python libraries without matching Team IDs. It also removes same-Team library enforcement for that process, reducing protection against library injection. This scope was presented to and approved by the user.

The main Tauri app, FFmpeg, FFprobe, and Deno retain library validation. All executables retain hardened runtime. Deno runs with JIT disabled; no JIT entitlement is used. No system-wide macOS setting, Keychain permission, or Gatekeeper exception is changed.

`src-tauri/yt-dlp.entitlements.plist` contains the dedicated entitlement. `scripts/package-macos.mjs` builds the app, signs only yt-dlp with it, re-seals the outer app without recursively re-signing other executables, and verifies the exact entitlement scope and hardened-runtime flags. It checks the signed runtimes, creates a DMG from the verified app, verifies image integrity, and records final executable/image hashes.

The previous embedded-Python signing blocker is resolved. Anonymous metadata extraction and whole/section downloads have passed using the signed release executables; the signed release window also analyzed the public test video successfully. Developer ID signing/notarization and full licensing/source assembly for public redistribution remain separate release work.
