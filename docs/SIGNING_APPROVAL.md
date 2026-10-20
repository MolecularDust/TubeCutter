# Release signing blocker and proposed approval

The development application is functional. The hardened, ad-hoc signed release artifact currently fails to load yt-dlp's embedded Python library: its PyInstaller bootloader and bundled Python components have incompatible signing identities under macOS library validation.

The proposed change requires user approval: add the following entitlement **only to the separate yt-dlp executable**:

```xml
<key>com.apple.security.cs.disable-library-validation</key>
<true/>
```

This permits that process to map its bundled Python libraries without matching Team IDs. It also removes same-Team library enforcement for that process, which reduces protection against library injection. The main Tauri app, FFmpeg, FFprobe, and Deno would retain their current validation settings. Deno continues to run with JIT disabled; no JIT entitlement is proposed.

Concrete implementation after approval: build the app, sign only yt-dlp with a dedicated entitlement file, re-seal the outer app without re-signing its children, verify signatures and actual metadata/download behavior, and regenerate the DMG from that verified app. No system-wide macOS setting, Keychain permission, or Gatekeeper exception would be changed.

Automatic approval review rejected an earlier JIT entitlement proposal. That proposal is abandoned; interpreter-mode Deno passed its signed runtime check. This request concerns the separate embedded-Python library-loading problem discovered afterward.
