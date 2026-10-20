# Verification — 20 October 2026

**Final release functional status: BLOCKED.** The hardened package builds, its signatures and DMG checksums validate, but its yt-dlp process cannot load embedded Python because library validation rejects the bundled signing identities. A narrowly scoped yt-dlp-only exception is awaiting user approval. No exception has been applied. The separate development app remains functional.

Target: macOS Apple Silicon. Status is evidence-based; other platforms are not verified.

| Check                                            | Status                 | Evidence                                                                                                                          |
| ------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Frontend type check and production build         | PASS                   | `npm run build`                                                                                                                   |
| Frontend lint                                    | PASS                   | `npm run lint`                                                                                                                    |
| URL parsing, timestamp rules and clip arithmetic | PASS                   | Vitest unit tests                                                                                                                 |
| Native URL/enum/section validation               | PASS                   | Rust unit tests                                                                                                                   |
| Unix process-group pause/resume/cancellation     | PASS                   | Rust test uses a real isolated child and verifies STOP/KILL status                                                                |
| Rust compile                                     | PASS                   | `cargo check`                                                                                                                     |
| Rust strict lint                                 | PASS                   | `cargo clippy -- -D warnings` (rerun after final changes)                                                                         |
| Native bundled application opens                 | PASS                   | Manual UI automation in macOS WKWebView                                                                                           |
| Anonymous metadata extraction                    | PASS                   | Big Buck Bunny, `aqz-KE-bpKQ`: 53 formats, 635s, up to 2160p                                                                      |
| Real embedded playback                           | PASS                   | YouTube player started inside bundled WKWebView; playhead advanced to 23s; no error 153 on this video                             |
| Seeking and preview stop                         | PASS                   | In=10s, Out=15s; player sought to 10s and stopped at 15s                                                                          |
| Timestamp/marker synchronization                 | PASS                   | Editing both fields changed the native accessibility slider values to 10/15 and selection to 5.00s                                |
| Native folder picker and saved preference        | PASS                   | Native macOS dialog selected `.tools/integration`; destination survived app restart                                               |
| Whole MP4 download                               | PASS                   | Real 144p H.264 + Opus download; 634.594s; full FFmpeg decode without errors                                                      |
| Fast section MKV transport                       | PASS WITH LIMITATION   | Real 10–15s interval fetched; keyframe pre-roll. Initial test also exposed a positive timestamp origin; local normalization added |
| Precise MP4 section                              | PASS                   | Real 10–15s interval; H.264/AAC; exactly 5.000s; full decode without errors                                                       |
| Structural A/V timing                            | PASS for precise/whole | FFprobe reported equal A/V start times; this does not assert perceptual lip-sync across all videos                                |
| Production dependency audit                      | PASS                   | `npm audit --omit=dev`: zero vulnerabilities                                                                                      |
| Browser-cookie authentication                    | NOT RUN                | No user credentials accessed or OS permission changes made                                                                        |
| macOS x64 / Windows / Linux builds               | NOT RUN                | Target-specific binary setup and process control need verification                                                                |
| Developer ID signing and notarization            | NOT RUN                | Local evaluation builds use ad-hoc signing                                                                                        |

The old yt-dlp test video `BaW_jenozKc` returned “unavailable”; testing switched to the publicly accessible Blender Foundation film. FFmpeg initially failed TLS verification because the static build lacked a certificate path. The fix bundles Mozilla's CA certificate store and sets `SSL_CERT_FILE`; certificate verification is not disabled.

Detailed numeric media results are in `media-test-results.json`. Integration logs/media remain in ignored `.tools/integration` because yt-dlp/FFmpeg diagnostics can include ephemeral source URLs. No authenticated command lines or cookie contents are committed.

Final runtime results and the hardened release blocker are recorded below.

## Final runtime checks

- **PASS:** 7 frontend tests and 8 Rust tests; frontend build/lint; Rust formatting and strict Clippy.
- **PASS:** Native queue whole-video MP4, precise five-second MP4, pause/resume, queued cancellation, Retry after a real transient access denial, and Clear Completed.
- **PASS:** Active process-group cancellation. Two yt-dlp processes shared one paused group; after cancellation, a process inventory showed no yt-dlp, FFmpeg, or Deno processes remaining.
- **PASS:** Audio-only precise output contains AAC, no video, and has duration 5.000s.
- **PASS WITH KEYFRAME LIMITATION:** Corrected Fast Cut processing preserves H.264/Opus, normalizes leading timestamps, fully decodes using VFR output handling, and reports 6.692s for a requested 5s interval (1.692s keyframe pre-roll). A/V start skew is 26ms. Full/precise outputs have zero reported A/V start skew. These checks do not replace perceptual sync review.
- **PASS:** Outer app and sidecars are ad-hoc signed. `codesign --verify --deep --strict` is the required final artifact check.
- **PASS:** Signed Deno executes JavaScript with `DENO_V8_FLAGS=--jitless`; no JIT entitlement is used. Automatic approval review rejected a proposed JIT entitlement, so the implementation uses interpreter mode instead. The JIT-enabled intermediate build was not retained as the final implementation.

## Remaining limitations / unverified behavior

Browser-cookie import/extraction, Keychain/Full Disk Access prompts, subtitle timing in trimmed outputs, every codec/container combination, clipboard Paste, pointer dragging, Finder reveal, and forced player-error-153 scenarios were not fully exercised. Actual successful embedded playback without error 153 was verified in WKWebView, including seek/selection synchronization. Some streams can receive transient YouTube access denials; Retry worked in the native queue, and no automatic lower-quality or whole-source fallback occurs.

Fast Cut can include substantial keyframe pre-roll; use Precise Cut for exact boundaries. Partial delivery may transfer more than the selected interval depending on the source. Audio-only Fast Cut fails explicitly if its timestamps cannot be aligned safely. Queue history is session-local. Pause preserves a running Unix process and does not survive restarting the app; long pauses may lose server connections.

The .app and .dmg are local evaluation artifacts. Developer ID signing, notarization, complete corresponding-source/third-party-notice assembly for public GPL binary redistribution, and builds/testing on other OS/CPU targets remain release work. No user credentials or system-wide settings were accessed or changed.

The final signed runtime smoke test identified an additional **FAIL / BLOCKED**: yt-dlp's PyInstaller bootloader cannot load its embedded Python under the hardened ad-hoc signature (different signing identities). Interpreter-mode Deno passed, but does not fix this separate library-validation issue. See `SIGNING_APPROVAL.md`. Release signature/DMG integrity PASS must not be confused with media-engine functionality.

**Refreshed development artifact: PASS.** After the final source updates, the separate development `.app` was rebuilt and launched. It successfully analyzed the public Blender video and initialized the real YouTube embed. No signing exception was added. The current source passes 15 unit tests (7 frontend, 8 native), frontend build/lint, Rust formatting, and Clippy with warnings denied.
