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

## Precise Cut click target

The Precise Cut row is now a plain container rather than a wrapping label. Only the checkbox toggles the setting; clicking its text, description, or trailing blank space does not. The checkbox retains its accessible name, description, and keyboard behavior. Only the checkbox shows a pointer cursor. Frontend build and lint pass; this semantic HTML change was inspected in source without restarting the user's active session.

## Default section mode and queue transfer rate

Section download mode is checked by default; its controls still wait for a processed video link. The queue no longer displays accumulated bytes. Normal yt-dlp downloads show the downloader's reported speed. FFmpeg section downloads sample output-byte changes over elapsed wall time and show effective output throughput in B/s, KiB/s, or MiB/s, rather than FFmpeg's media-playback speed multiplier. Completed jobs clear the speed as before.

Frontend build/lint, eight frontend tests, fourteen native tests, formatting, and strict Clippy pass. The new native test covers rate units and invalid values. No live transfer was run for this follow-up.

## Clearing canceled rows and revised progress details

Clear Completed is enabled when either completed or canceled rows exist and clears both from the visible queue. Internal finished records remain session-local and hidden so clearing a canceled row cannot remove state that its worker still needs for process/file cleanup. Hidden rows are excluded from queue reads and subsequent job events. Active, queued, paused, and failed rows remain visible.

Progress details now show percentage, speed in decimal Kbit/s, Mbit/s, or Gbit/s, and downloaded size in B/KB/MB/GB. yt-dlp reports raw bytes per second for conversion (multiplied by8); FFmpeg section downloads use measured output throughput. Completion records the actual final file size. For example,16252972bytes displays as16.3MB rather than a long raw byte count.

Eight frontend tests and fifteen native tests pass, with production build, lint, formatting, and strict Clippy. Native coverage includes clearing canceled/completed rows while retaining worker state, preserving other job states, bit-rate units through Gbit/s, and readable size conversion. No fresh native queue interaction or live transfer was run for this follow-up.

## Edited filename in queue

Queue titles now use the edited output filename, including the selected container extension, from the moment a job is enqueued. Unedited downloads keep the original video title. The queue uses the same filename normalization as final output, including retries. Native compilation passes; this display fix reuses the existing filename validation and normalization coverage.

## Clear Completed acknowledgment and late-event regression

Clearing now returns the exact cleared job IDs from the native command. The frontend removes those IDs from its current queue and remembers them for the session, ignoring any delayed completion or cancellation-cleanup event for those jobs. It no longer replaces the queue with a separate asynchronous snapshot after clearing, so newly arriving active jobs are preserved.

Ten frontend tests and fifteen native tests pass. New regressions cover removing successful and canceled jobs, preserving a concurrently added active job, and ignoring delayed completion/cleanup events. The native clearing test now checks the acknowledged IDs as well as hidden worker records. Production build, frontend lint, Rust formatting, and strict Clippy pass. The inspected native session had an empty queue; this follow-up was verified with deterministic state-transition tests rather than a live completed download.

## Automatic trimming without a mode checkbox

Removed the entire “Download only a section of the video / TRIM” checkbox row. Timeline, In/Out/Length, filename, and Precise Cut controls enable automatically after successful analysis. Untouched endpoints send no section to the downloader and use normal whole-video downloading. Changing In, Out, or Length sends the selected section; Reset returns to whole-video mode. Boundary comparison uses the timestamp fields' millisecond precision to avoid accidental cuts from display rounding. Selection validation remains active for both modes, and I/O shortcuts work even before the first boundary edit.

Frontend production build, lint, and twelve tests pass. New tests cover unchanged/reset endpoints, timestamp rounding, either endpoint changing, and Length updating Out. Native download code is unchanged in this follow-up. No new live download was run.

## Timeline seeking and red playhead handle — 21 October 2026

Timeline interaction now uses pointer capture on the stable track element instead of click-target equality checks and temporary window listeners. Clicks update the playhead immediately. Dragging, releasing outside the track, pointer cancellation, and capture loss clear drag state. Brief stale player polls are ignored while a seek is pending or the playhead is being dragged, then normal player time updates resume. In/Out controls remain independent.

The playhead is a red vertical line with a red triangle handle above the track, on a separate hit area from the In/Out marker bodies. It supports Arrow keys (0.1s), Shift+Arrow (1s), Home, and End when focused.

Fourteen frontend tests, frontend build, and lint pass. New regressions cover repeated seek positions, clamping outside the track, and stale player updates during consecutive seeks/drags. Packaging verifies signatures, approved entitlement scope, signed sidecars, and DMG integrity.

Native WKWebView verification used a separate locally signed test copy and the public Blender video, preserving the user's main app session. Repeated clicks moved the new playhead from153.800s to365.938s before initial manual playback. With Out and playhead both at378.510s, dragging the red triangle to224.513s preserved Out. Dragging Out's body afterward changed only Out to507.364s. A subsequent track click sought to100.766s and Right advanced it to100.866s. The original freeze was not consistently reproduced in the old isolated app, so the change addresses event handling, stale updates, and handle separation together rather than attributing it to one confirmed player failure.

A three-second Preview selection from100.866s to103.866s displayed Stop during playback, paused at103.961s, and restored Preview selection. The temporary test instances were closed after verification.

## YouGlish timing layout and padding — 22 October 2026

Reviewed the “YouGlish Downloader Mac” chat's timing-layout instructions and the implementation in `/Users/mike/Documents/ChatGPT/Phonetic Reasearch/phonetic-cutter`. Copied its timing controls into TubeCutter:18px timestamp text, Set In/Out above their fields, external one-second up/down buttons, two-line Padding/Length labels,52px input/action height, and compact side-by-side columns. Narrow windows wrap Preview/Reset below the fields as in the reference.

Padding defaults to02, accepts00–99seconds, and expands raw In/Out without changing the values entered. It clips independently at the video boundaries. Calculated Length includes the effective padding and its one-second buttons adjust Out. Preview, selection shading, and the download request use the padded range. The summary reports that range. Reset and new analysis restore default padding; unchanged full-video boundaries still use a whole-video download. Timestamp validation now prevents preview/download while an input is invalid.

Frontend production build, lint, and eighteen tests pass, including the supplied250.440–253.440s example with padding2 producing248.440–255.440s, independent boundary clamping, full-video selection, and padded-length stepping. Native download implementation is unchanged; release packaging verifies app/staged signatures, approved entitlement scope, signed runtimes, and DMG integrity.

Native QA used a separate build identifier/settings directory and anonymous metadata extraction for the public Blender video. The screenshot's exact timestamps produced Length7 and the expected padded summary in WKWebView. Length+ changed Out253.440→254.440 and Length7→8; Padding02→03 changed Length7→9 without moving raw In/Out. The In down button preserved milliseconds while changing250.440→249.440. Reset restored0–635s, Padding02, Length635, and Entire video. With raw In0/Out1 and Padding02, Length correctly showed3 and the summary clipped to0–3s. The native screenshot confirmed the fields and Preview/Reset share the same52px-high input row.

The padded0–3s native preview stopped at3.066s and restored Preview selection, confirming it uses the padded endpoint rather than raw Out1s. The isolated QA build was closed afterward; the main app preferences were not changed.
