# Verification — 20 October 2026

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

Remaining checks and any final runtime results are recorded below as testing completes.
