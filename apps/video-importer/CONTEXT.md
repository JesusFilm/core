# Video Importer

The operator-run batch ingest tool for the media catalog: a standalone CLI binary that a human points at a local folder of files, which it classifies by filename convention and pushes into the media context (variants via Mux, subtitles, audio previews). Owns no entities — Video, Edition, Variant, Subtitle, and Language are media/languages vocabulary; the importer's own domain is the filename contract, the run, and its outcome reporting.

## Language

### The run

**Import Run**:
One human-invoked execution over one local folder. Each file is processed independently (videos, then subtitles, then audio previews); one bad file never aborts the run.
_Avoid_: Pipeline, job (nothing is scheduled or queued — a person runs a binary)

**Dry Run**:
A discovery-only run: files are classified and validated but nothing is uploaded, mutated, or announced to Slack.

**Processing Summary**:
The run's outcome report — per-file success/failure with stage-prefixed failure reasons — printed to the console and posted to Slack. There is no manifest input; the folder plus filename conventions are the entire input contract, and the summary is the only output artifact.
_Avoid_: Manifest, report file

**Status Marker**:
The suffix appended to a file on disk after processing — `.completed` (skipped on re-run) or `.failed` (auto-retried on re-run). The filesystem is the run's durable state; there is no database of import history.
_Avoid_: Checkpoint, lock file

### The filename contract

**Classic Filename**:
The 4-segment video name `<videoId>---<edition>---<languageId>---<version>.mp4`. The language pair names the audio language of the variant being created.

**Burned-In Filename**:
The 6-segment video name that adds a burned-subtitle language/version pair. When the burned pair is non-zero, the created Variant is keyed by the **burned-in (on-screen subtitle) language**, not the audio language — the audio pair is diagnostic only. The single biggest trap in this context: `languageId` does not always mean audio.

**Edition**:
The media context's named grouping on a Video (e.g. `base`, `jl`, `ot`) that subtitles attach to; must already exist on the Video. Trap: the Slack reporting code calls this same field "production".
_Avoid_: Production, cut

**Audio Preview**:
A short per-language `.aac` sample attached to the Language (not to any Video); imported from a bare `<languageId>.aac` filename.

### Semantics

**Pre-Existence Rule**:
The importer never creates a Video, Edition, or Language — all three must already exist in the catalog or the file is rejected at validation. It only adds renditions and attachments to them.

**Upsert**:
The idempotency behavior for subtitles and audio previews: re-importing finds the existing record by language and updates it (bumping the subtitle's per-format version counter) instead of duplicating.

**Version (overloaded)**:
Two distinct counters share the word: the Variant version parsed from the filename, and the subtitle's per-format `srtVersion`/`vttVersion` that the Upsert auto-increments. Say which one you mean.

**Deferred Encoding**:
The importer uploads bytes to R2 and asks the media API to enqueue Mux ingest; "imported" therefore means _accepted_, not _ready to stream_ — encoding completes asynchronously after the run ends.
_Avoid_: Uploaded = playable
