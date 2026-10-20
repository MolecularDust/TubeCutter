# Verification — 20 October 2026

**Release signing blocker: RESOLVED.** The user approved a yt-dlp-only library-validation exception. The hardened, ad-hoc signed macOS Apple Silicon application now loads its bundled Python runtime and passes real media-engine integration tests. The exception is absent from all other executables; Deno remains JIT-disabled. This is a local evaluation build, not a notarized public release.

## Automated checks

| Check                                                          | Status | Evidence                                                                                                           |
| -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Frontend type check / production build                         | PASS   | `npm run build`                                                                                                    |
| Frontend lint                                                  | PASS   | `npm run lint`                                                                                                     |
| URL parsing, timestamp rules, selection arithmetic             | PASS   | 8 Vitest tests                                                                                                     |
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

Browser-cookie import/extraction, Keychain/Full Disk Access prompts, subtitle timing in trimmed outputs, every codec/container combination, pointer dragging, Finder reveal, and forced error-153 scenarios were not fully exercised. Actual successful embedded playback without error 153 was verified in WKWebView. No credentials or system-wide settings were accessed or changed.

Fast Cut may include substantial keyframe pre-roll; use Precise Cut for exact boundaries. Partial delivery may transfer more data than the selected interval. Audio-only Fast Cut rejects ambiguous timestamps. There is no automatic whole-source or lower-quality fallback. Queue history is session-local, and long Unix process pauses may lose server connections.

Other OS/CPU builds, Developer ID signing, notarization, and complete corresponding-source/third-party-notice assembly for public GPL binary redistribution remain release work.

## TubeCutter update verification

The release app and DMG are named TubeCutter. The supplied `Glossy Red Play Button Emblem.png` is preserved in `src/assets/app-icon.png`, used in the header, and converted into the bundled macOS icon. The bundle identifier remains unchanged to preserve preferences.

The rebuilt signed release was checked in native WKWebView:

- The entire trim panel is present before analysis, with disabled controls. Analysis enables the trim checkbox; selecting it enables editing.
- A known public video URL was copied using Command-C, cleared from the field, and restored by the app's native Paste button.
- In=10s and Length=5s produced Out=15s. Editing Out to18s changed Length to8s. Length=60s produced Out=70s.
- Preview selection displayed Stop during actual embedded playback. Clicking Stop restored Preview selection and the playhead stayed paused at18s. A separate10–18s preview stopped automatically at Out and restored the button.
- Save shows a proper folder outline in its original blue color.

Eight frontend tests and eight native tests pass, along with production build, frontend lint, Rust formatting, and strict Clippy. Vitest discovery is restricted to source tests so packaging's Applications symlink cannot collect unrelated installed-app tests. Packaging verified the app/staged signatures, all five hardened executables, the approved yt-dlp-only entitlement, signed tool execution, and DMG integrity. Existing download-engine integration results above were not rerun for these UI changes.

Artifacts: `src-tauri/target/release/bundle/macos/TubeCutter.app` and `src-tauri/target/release/bundle/dmg/TubeCutter_0.1.0_aarch64.dmg`. This remains an ad-hoc signed local evaluation build without notarization.

## Analysis spinner and trim layout follow-up

Analyze now shows a rotating spinner throughout the existing busy interval, including failure cleanup. Repeated Enter submissions are ignored while busy. The trim controls use a shared grid: Set In, Set Out, and Length headers occupy the first row; their three inputs, Preview selection/Stop, and Reset occupy the same 34px second row. Validation messages occupy a separate row.

Rendered browser-preview geometry confirmed that all three inputs and both action buttons share an identical Y coordinate and 34px height; headers remain above the inputs. The active native app session was preserved rather than restarted for this visual-only update. Frontend build, lint, eight source tests, hardened signing checks, signed sidecar checks, and rebuilt DMG integrity all pass. The spinner's busy-state animation was inspected in source; a fresh native analysis was not run for this follow-up.

## Download queue spinner follow-up

Queue rows now use a fixed40×40px square status container with a spinner instead of the checkmark/down arrow. Its animation is driven by native job state: downloading, merging, and processing animate; queued, paused, completed, failed, and canceled are stationary. Completion therefore stops the spinner only after final processing/verification completes, rather than at100% transfer progress. The textual job status remains available to screen readers.

Frontend production build, lint, and all eight source tests pass. No additional media download was run for this presentation change.

## Completed queue indicator follow-up

Completed downloads now replace the spinner with the original checkmark inside the same square tile. Downloading, merging, and processing retain the animated spinner. Frontend production build and lint pass; this conditional presentation change does not alter download processing.

## Cancellation cleanup and red X

Canceled jobs replace the spinner with a red X. Each new download stages all media, partial streams, subtitles, and normalization intermediates in a unique hidden folder inside the selected destination. Once the worker's media processes exit, it deletes that folder. Only verified completed output is published into the destination, without overwriting an existing file. Publishing and completion share the cancellation lock, so cancellation cannot race with publishing a completed video. Cleanup failures are shown in the canceled job's message rather than reported as successful deletion.

All eight frontend tests and eleven native tests pass. Three new native filesystem tests cover removing partial/intermediate files, preserving unrelated files and symlink targets, and publishing completed output without overwriting it. Frontend build/lint, Rust formatting, and strict Clippy pass. The existing process-group cancellation test also passes. No new live YouTube cancellation was exercised for this follow-up; filesystem cleanup and process cancellation were checked separately. Already-existing files from older app sessions are not swept by filename.

## Editable download filename

A File name field appears below the In/Out/Length controls, prefilled with the analyzed video's title in grey. Focusing it enables editing; an edited value is carried with the queued request and used when verified output is published. Without edits the original automatic filename stays in use. Analyzing a new video resets the field. The selected container adds the extension, replacing a supplied MP4/MKV extension to prevent duplication.

Native validation rejects empty names, path separators, colons, control characters, and overly long names. Custom names preserve spaces, Unicode, and percent signs because they are never interpreted as downloader templates. Existing destination files are never overwritten. Filesystem tests verify the actual custom published filename, the automatic-name path, preservation after staging cleanup, and collision rejection. Frontend build/lint and eight source tests pass; thirteen native tests and strict Clippy pass. No additional live download or native field interaction was exercised for this follow-up.
