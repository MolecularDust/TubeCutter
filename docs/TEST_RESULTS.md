# Verification — 20 October 2026

**Release signing blocker: RESOLVED.** The user approved a yt-dlp-only library-validation exception. The hardened, ad-hoc signed macOS Apple Silicon application now loads its bundled Python runtime and passes real media-engine integration tests. The exception is absent from all other executables; Deno remains JIT-disabled. This is a local evaluation build, not a notarized public release.

## Automated checks

| Check                                                          | Status | Evidence                                                                                                           |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Frontend type check / production build                         | PASS   | `npm run build`                                                                                                    |
| Frontend lint                                                  | PASS   | `npm run lint`                                                                                                     |
| URL parsing, timestamp rules, selection arithmetic             | PASS   | 7 Vitest tests                                                                                                     |
| Native validation, diagnostic redaction, process-group control | PASS   | 8 Rust tests                                                                                                       |
| Rust formatting / strict lint                                  | PASS   | `cargo fmt --check`, `cargo clippy -- -D warnings`                                                                 |
| Production dependency audit                                    | PASS   | Zero vulnerabilities at the initial completed build                                                                |
| Hardened runtime and approved entitlement scope                | PASS   | Packaging script inspects all five executable signatures; only yt-dlp has the exception; none has JIT entitlements |
| App / staged copy signature validation                         | PASS   | `codesign --verify --deep --strict`                                                                                |
| Signed yt-dlp and Deno runtime checks                          | PASS   | yt-dlp version succeeds; Deno evaluates JavaScript with JIT disabled                                               |
| DMG integrity                                                  | PASS   | `hdiutil verify`                                                                                                   |

## Real signed-tool integration

Test video: Blender Foundation's public Big Buck Bunny, `aqz-KE-bpKQ`. Metadata reports 635s and formats up to 2160p. Downloads used 144p H.264 and actual source audio. The integration runs used the exact signed executables from the release `.app`, its bundled CA store, and the JIT-disabled environment.

| Output                            | Status                        | Measured result                                                                                                |
| --------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Whole-video MP4                   | PASS                          | 634.594s, H.264/Opus; A/V start skew 0s; full decode passes                                                    |
| Fast Cut MKV, requested 10–15s    | PASS WITH KEYFRAME LIMITATION | 6.692s after stream-copy timestamp normalization; 1.692s pre-roll; A/V start skew 26ms; full VFR decode passes |
| Precise Cut MP4, requested 10–15s | PASS                          | Exactly 5.000s, H.264/AAC; A/V start skew 0s; full decode passes                                               |
| Audio-only precise MP4            | PASS in earlier integration   | AAC only, no video, exactly 5.000s                                                                             |

Numeric signed-release results are in `release-media-test-results.json`. Final executable and DMG hashes are in `release-artifacts.json`. Structural A/V checks do not replace perceptual lip-sync review across all content.

The old yt-dlp test video `BaW_jenozKc` was unavailable, so testing switched to Blender's film. Early FFmpeg TLS failures were fixed with a bundled CA store, preserving certificate verification. The first signed-tool harness attempt also exposed a test-harness promise/path-name collision; after correction, all three signed release download cases passed. Raw test logs remain in ignored `.tools` and are not committed.

## Native UI checks

| Check                                                          | Status                         | Evidence                                                                                            |
| -------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| Development and release windows open                           | PASS                           | Native macOS WKWebView                                                                              |
| Signed release metadata extraction                             | PASS                           | Public test video analyzed and real YouTube embed initialized after the approved signing fix        |
| Real playback                                                  | PASS                           | Actual YouTube player started in WKWebView; app playhead followed real player time                  |
| Seeking / selection preview                                    | PASS                           | In=10, Out=15; player seeks to In and pauses at Out                                                 |
| Timestamp / marker synchronization                             | PASS                           | Native accessibility sliders reflect timestamp edits; calculated selection is 5.00s                 |
| Native folder picker / preference persistence                  | PASS                           | macOS dialog selected a test destination; it survived restart                                       |
| Native queue whole-video / precise clip                        | PASS in earlier runtime checks | Completed with FFprobe duration reports                                                             |
| Pause / resume / queued cancellation / Retry / Clear Completed | PASS                           | Native queue transitions verified; Retry recovered from a real transient access denial              |
| Active process cancellation                                    | PASS                           | Both yt-dlp processes shared a paused group; no yt-dlp, FFmpeg, or Deno remained after cancellation |

## Remaining limitations / unverified behavior

Browser-cookie import/extraction, Keychain/Full Disk Access prompts, subtitle timing in trimmed outputs, every codec/container combination, clipboard Paste, pointer dragging, Finder reveal, and forced error-153 scenarios were not fully exercised. Actual successful embedded playback without error 153 was verified in WKWebView. No credentials or system-wide settings were accessed or changed.

Fast Cut may include substantial keyframe pre-roll; use Precise Cut for exact boundaries. Partial delivery may transfer more data than the selected interval. Audio-only Fast Cut rejects ambiguous timestamps. There is no automatic whole-source or lower-quality fallback. Queue history is session-local, and long Unix process pauses may lose server connections.

Other OS/CPU builds, Developer ID signing, notarization, and complete corresponding-source/third-party-notice assembly for public GPL binary redistribution remain release work.
