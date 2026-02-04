# PRD: AI Subtitle Post-Processor (Whisper → Broadcast-Grade WebVTT → Mux)

**Product name:** AI Subtitle Post-Processor
**Status:** Implementation-ready
**Owner:** Media Platform / Video AI
**Primary audience:** AI coding agent (Node.js / TypeScript)
**Secondary audience:** Platform engineers

---

## 1) Problem Statement

Raw Whisper transcription segments are not broadcast-grade subtitles. Common failures:
- Reading speed exceeds human limits (CPS too high)
- Cues overflow into 3+ lines
- Poor line breaks (orphans, awkward splits)
- Language/script directionality issues (RTL mixed with numbers/acronyms)
- "Technically correct" timestamps still feel unsynced due to cue shaping

Mux renders what it is given. Whisper produces transcription segments, not subtitle cues. A deterministic post-processing layer is required.

---

## 2) Goal

Introduce a deterministic, language/script-aware post-processing step that converts Whisper segments into **validated** broadcast-grade **WebVTT** subtitles before attaching to Mux assets.

**Success means:**
- No cue exceeds allowed line count
- CPS/CPL always within profile limits
- No overlaps, no invalid timestamps, valid WebVTT syntax
- Language/script-aware formatting across LTR, RTL, CJK
- One-pass AI refinement with hard constraints, followed by strict machine validation
- Deterministic behavior via explicit rules, versioning, and golden tests

---

## 3) Non-Goals

- Subtitle translation
- Word-level karaoke timing
- Shot detection / scene-aware segmentation
- UI work
- Real-time processing (async only)
- Speaker diarization / labels (future)

---

## 4) Architecture Overview

### Pipeline position
Mux transcript primitives (via `fetchTranscriptForAsset`)
→ **AI Subtitle Post-Processor (this PRD)**
→ Validator (non-AI, mandatory)
→ Attach WebVTT text track to Mux

### Execution model
- Background workflow using Workflow DevKit
- Prefer **one GPT call** per track; allow **one retry** only if validation fails (see Failure Handling)
- Deterministic validator as the gatekeeper
- Deterministic fallback formatter if AI fails twice (coverage > vibes)

### MuxDataAdapter (required component)
All Mux media data access MUST be centralized in a single `MuxDataAdapter` module. This module is the only place allowed to import from `@mux/ai/primitives` and provides:
- `getTranscript(assetId, bcp47): Segment[]` (implemented via `fetchTranscriptForAsset`)
- `getStoryboard(playbackId, opts)` (optional debug helper via `getStoryboardUrl`)

---

## 5) Inputs

### 5.1 Source input: Transcript segments (via primitives)
Segments MUST be derived from `fetchTranscriptForAsset` output (Mux primitives). Each segment contains:
- `id: string`
- `start: number` (seconds, float)
- `end: number` (seconds, float)
- `text: string`

### 5.2 Metadata
- `bcp47: string` (BCP-47 language tag, e.g. `en`, `ar`, `zh-Hans`, `zh-Hant`, `sr-Latn`)
- `targetFormat: "webvtt"`
- `assetId: string` (Mux asset id or internal id)
- optional: `trackLabel`, `sourceProvider`, etc.

---

## 6) Definitions (Hard Requirements)

This section defines how metrics are computed. The validator MUST use these same rules.

### 6.1 Normalization rules
Define `normalizeCueText(text)`:
- Trim leading/trailing whitespace
- Collapse internal whitespace runs to a single space, except preserve explicit line breaks `\n`
- Remove WebVTT styling tags for metric calculation (if styling tags are disabled, there should be none)
- Preserve punctuation and characters as-is (no paraphrase, no "cleaning" beyond whitespace)
- Do not change casing

### 6.2 Character counting
Define `countChars(text)`:
- Count **Unicode grapheme clusters** (recommended; via a library or Intl.Segmenter where available)
- Count spaces and punctuation as characters (after normalization)
- For CPS calculation, exclude line break characters `\n`

If grapheme cluster counting is not feasible, fallback to Unicode code points is acceptable but MUST be explicitly documented and consistent.

### 6.3 Duration, CPS, CPL
- `durationSeconds = end - start` (end and start in seconds)
- `CPS = countChars(normalizeCueText(cueTextWithoutNewlines)) / durationSeconds`
- `CPL = max over lines of countChars(normalizeCueText(line))`
- `maxLines = number of lines = cueText.split("\n").length`

### 6.4 Rounding
- Validator calculates CPS/CPL using raw floating values.
- Logs may round CPS to 2 decimals for readability, but validation uses raw.

### 6.5 Timestamp format
- Output timestamps MUST be `HH:MM:SS.mmm` (WebVTT compatible)
- Times MUST be non-negative and monotonically increasing across cues

---

## 7) Language & Script Classification (Hard Requirement)

### 7.1 Classification types
- `LanguageClass = "LTR" | "RTL" | "CJK"`

Classification MUST primarily be based on **script**, not just language:
- RTL scripts: Arabic, Hebrew
- CJK scripts: Han, Kana, Hangul (or language tags mapping to them)

### 7.2 BCP-47 parsing
Parse BCP-47 tag to extract:
- language subtag
- script subtag (if present)
- region subtag (optional)

If script is absent, infer via known mappings for common languages.

### 7.3 Class mapping (examples)
- LTR: `en`, `fr`, `de`, `es`, `ru`, `sr-Latn`
- RTL: `ar`, `he`, `fa`, `ur`
- CJK: `zh-Hans`, `zh-Hant`, `ja`, `ko`

Classification result MUST be stored with the generated output metadata.

---

## 8) Language Profiles (Hard Requirements)

Profiles are strict numeric constraints. All cues MUST satisfy them after processing.

### 8.1 LTR Profile
- `targetCPS: 13.5`
- `maxCPS: 17`
- `targetCPL: 32`
- `maxCPL: 38`
- `maxLines: 2`
- `minDuration: 1.3`
- `maxDuration: 6.0`
- `startOffsetMs: 150`
- `endOffsetMs: 50`
- `minGapMs: 50`

### 8.2 RTL Profile
- `targetCPS: 12`
- `maxCPS: 16`
- `targetCPL: 28`
- `maxCPL: 34`
- `maxLines: 2`
- `minDuration: 1.5`
- `maxDuration: 5.5`
- `startOffsetMs: 150`
- `endOffsetMs: 50`
- `minGapMs: 50`

### 8.3 CJK Profile
- `targetCPS: 8`
- `maxCPS: 11`
- `targetCPL: 14`
- `maxCPL: 18`
- `maxLines: 1`
- `minDuration: 1.2`
- `maxDuration: 4.5`
- `startOffsetMs: 150`
- `endOffsetMs: 50`
- `minGapMs: 50`

### 8.4 Versioning
Profiles MUST have a version:
- `languageProfileVersion: "v1"`

Any future change requires bumping the version and keeping backwards traceability.

---

## 9) Core Functional Requirements

### R0. Primitives-Only Mux reads (hard requirement)
- All transcript/caption reads MUST use `@mux/ai/primitives` (no direct Mux REST calls).
- Use `fetchTranscriptForAsset(assetId, bcp47)` as the canonical input source.
- Exceptions are only allowed if a primitive is missing; document the exception explicitly.

### R1. Sentence reconstruction (do not treat transcript segments as cues)
- Rebuild higher-level text units from segments
- Merge adjacent segments if:
  - gap ≤ 300ms AND
  - merged cue can be shaped within profile constraints (or will be split later deterministically)
- Do not invent punctuation or paraphrase meaning
- Preserve all content (no dropping)

### R2. Cue segmentation with explicit decision hierarchy
Cue shaping MUST follow this priority order when constraints conflict:

1. Prevent overlaps (absolute)
2. Enforce `maxLines` (absolute)
3. Enforce `maxCPL` (absolute)
4. Enforce `maxCPS` (split first, then extend time if possible)
5. Enforce `maxDuration` (absolute)
6. Enforce `minDuration` (borrow time or merge only if allowed and does not violate other absolutes)
7. Prefer punctuation/semantic boundaries
8. Visual balancing (secondary preference)

A cue MUST:
- represent one thought/idea where possible
- respect duration bounds
- respect CPS/CPL bounds
- respect max lines (CJK maxLines=1)

Split cues when:
- CPS > max
- Duration > max
- Line overflow detected
- Clause boundary exists (preferred)
- Otherwise split by length targets without breaking prohibited patterns (see R3/R6)

### R3. Line breaking rules (LTR/RTL)
Line breaks MUST:
- Prefer splitting on spaces and punctuation boundaries
- Avoid:
  - preposition + noun splits
  - verb + object splits when obvious
  - fixed expressions (best-effort)
  - starting a line with a dangling conjunction when avoidable
- Avoid bracket/quote edge cases:
  - do not break immediately after an opening bracket/quote
  - do not break immediately before closing punctuation when avoidable
- Visual balance:
  - avoid a 1-word first line followed by a long second line unless unavoidable

### R4. Timing normalization rules
Apply offsets:
- `start' = max(0, start - startOffsetMs/1000)`
- `end' = end + endOffsetMs/1000`

Overlap avoidance:
- Ensure `end_i <= start_{i+1} - minGap`
- If overlap would occur, clamp `end_i` to `start_{i+1} - minGap`
- Never produce negative duration after clamping; if it happens, resplit/retime deterministically

CPS reduction strategy:
1. Prefer splitting into more cues
2. If splitting is not sufficient, extend cue duration by borrowing into adjacent gaps:
   - Extend `end` into available gap up to `maxDuration`
   - Never violate minGap to next cue
3. If still impossible, split again (even if semantic boundary is weaker)

Minimum duration:
- No cue < minDuration
- If a cue is below minDuration after shaping, adjust by:
  - borrowing from adjacent available gaps, OR
  - merging with neighbor if it does not violate absolutes, OR
  - re-segmenting

### R5. Directionality safety (RTL)
- Do NOT reverse strings manually
- Preserve logical order
- Renderer handles shaping
- Mixed RTL + numbers/acronyms:
  - Default: do not inject bidi control characters
  - Optional: allow configurable insertion of bidi isolates (FSI/PDI) behind a feature flag and versioned (see "Bidi handling" in Implementation Notes)

### R6. CJK constraints
- Prefer 1 line always (maxLines=1)
- Never split inside a grapheme cluster
- Prefer splits at punctuation or semantic beats
- If punctuation is absent, split by length target using best-effort segmentation
- Avoid overly long frozen cues:
  - keep durations within maxDuration, split if needed

### R7. Non-speech tokens handling (policy)
Define explicit treatment for:
- `[Music]`, `[Applause]`, `♪ ... ♪`, etc.
Rules:
- Preserve them as cues if present in input
- Apply same CPS/CPL rules
- Prefer short cues; do not paraphrase them

---

## 10) AI Usage (Structured, constrained)

### 10.1 Input payload (Required)
AI MUST receive structured JSON.

    type LanguageClass = "LTR" | "RTL" | "CJK";

    interface LanguageProfile {
      targetCPS: number;
      maxCPS: number;
      targetCPL: number;
      maxCPL: number;
      maxLines: number;
      minDuration: number;
      maxDuration: number;
      startOffsetMs: number;
      endOffsetMs: number;
      minGapMs: number;
      languageProfileVersion: "v1";
    }

    interface SubtitleAIInput {
      assetId: string;
      bcp47: string;
      languageClass: LanguageClass;
      profile: LanguageProfile;
      segments: {
        id: string;
        start: number;
        end: number;
        text: string;
      }[];
      promptVersion: "v1";
    }

### 10.2 Output (Required)
AI MUST return ONLY final WebVTT text.

Constraints:
- Must include `WEBVTT` header
- Must include blank line between cues
- Must output timestamps as `HH:MM:SS.mmm --> HH:MM:SS.mmm`
- Must not include styling tags unless explicitly enabled
- Must not invent text, must not drop text, must not paraphrase

### 10.3 System prompt (Mandatory, versioned)
Store as `promptVersion: "v1"` and persist it.

System prompt content (v1):
- You are a subtitle post-processing engine.
- Convert Whisper segments into broadcast-grade WebVTT.
- Strictly obey numeric/structural constraints from the profile.
- If a constraint would be violated, split into multiple cues.
- Never exceed max lines, max CPL, max CPS.
- Do not paraphrase, invent, or drop information.
- Output must be valid WebVTT only.

### 10.4 User prompt (Mandatory, versioned)
User prompt content (v1):
- Reformat provided segments into WebVTT cues.
- Apply the profile exactly.
- Compute CPS and enforce limits.
- Split cues or extend timing only within duration bounds and non-overlap rules.
- One thought per cue when possible.
- Preserve meaning exactly.
- Return ONLY WebVTT.

### 10.5 Retry rule (strict)
- Allow **at most 1 retry** after validation failure.
- Retry prompt MUST include structured validator errors (cue indexes and violated constraints).
- If retry fails validation, use deterministic fallback formatter (see Failure Handling).

---

## 11) Validation Layer (Non-AI, Mandatory)

After AI output, run validator that FAILS on:
- Invalid WebVTT syntax (header missing, bad timestamps, missing blank lines between cues)
- Any cue exceeds `maxLines`
- CPL > maxCPL
- CPS > maxCPS
- Duration < minDuration or > maxDuration
- Overlapping cues or missing minGap
- Empty cues
- Non-monotonic timestamps (start/end regression)
- Text contains disallowed markup (if styling disabled)

Validation output MUST include machine-readable error details:
- cue index
- rule violated (e.g. `MAX_CPS`, `MAX_LINES`)
- measured value and limit

If validation fails, do not attach to Mux unless fallback succeeds.

---

## 12) Failure Handling & Fallbacks (Deterministic)

### 12.1 Failure ladder
1. AI pass #1 → validate
2. If fail: AI pass #2 (retry) with validator error feedback → validate
3. If fail: deterministic fallback formatter → validate
4. If fail: hard failure (do not attach)

### 12.2 Deterministic fallback formatter (minimum viable)
Goal: produce valid, constraint-respecting WebVTT without AI.
- Build cues by merging segments until approaching targetCPS/targetCPL, then split
- Line wrap using deterministic rules:
  - LTR/RTL: wrap on spaces, then punctuation, then hard wrap at maxCPL
  - CJK: wrap at maxCPL boundary without splitting grapheme clusters
- Timing rules:
  - Use original segment times + offsets
  - Clamp overlaps with minGap
  - Enforce minDuration by borrowing into available gaps or merging where safe
- Metadata tag the output as fallback-produced (see Versioning section)

### 12.3 Debug outputs (mandatory on validation failure)
On any validation failure, persist:
- Original transcript VTT (from `fetchTranscriptForAsset`)
- AI output VTT
- Validator report (cue index, rule, measured vs limit)
- Optional storyboard URL via `getStoryboardUrl(playbackId, opts)`

---

## 13) Integration with Workflow DevKit

### 13.1 Workflow steps
1. Acquire transcript via primitives: `fetchTranscriptForAsset(assetId, bcp47)`
2. Normalize transcript into `Segment[]` (MuxDataAdapter)
3. Parse BCP-47 and detect `LanguageClass`
4. Select profile by `LanguageClass`
5. Build AI input payload (include versions)
6. Call GPT post-processor (pass #1)
7. Validate output
8. If invalid: retry once with errors (pass #2), validate
9. If still invalid: fallback formatter, validate
10. If valid: attach WebVTT to Mux asset
11. Emit success/failure events + metrics

### 13.2 Required properties
Each step MUST be:
- idempotent
- retry-safe
- observable
- bounded in time (avoid infinite retries)

Idempotency key MUST include:
- `assetId`
- `trackType` (e.g. `captions`)
- `bcp47`
- `whisperSegmentsSha256`
- `profileVersion`
- `promptVersion`
- `validatorVersion`

---

## 14) Mux Integration Requirements

- Use `@mux/ai` for transcription metadata where applicable
- Attach final WebVTT as a Mux text track
- Track metadata MUST include:
  - `source = "ai_post_processed"`
  - `ai_post_processed = true|false` (false if fallback)
  - `languageProfileVersion = "v1"`
  - `promptVersion = "v1"`
  - `validatorVersion = "v1"`
  - `whisperSegmentsSha256`
  - `postProcessInputSha256`
- Preserve raw Whisper segments for audit/debug (store or reference)
- Never attach invalid tracks

---

## 15) Observability & Metrics

### 15.1 Emit metrics
- CPS distribution (p50/p95/max) by languageClass and bcp47
- CPL distribution (p50/p95/max)
- Cue count before vs after
- Average cue duration
- Validation failure rate by failure type
- AI retry rate
- Fallback usage rate
- Attach success rate
- Processing latency p50/p95
- Token usage / cost estimates (if available)

### 15.2 Regression detection
If average CPS drifts above target or validation failures spike:
- emit an alert event
- include sample asset IDs + error summaries

---

## 16) Performance, Cost, Reliability Targets (SLOs)

- Processing time: p95 < 60s per track (excluding upstream transcription time)
- Attach success rate: ≥ 98% of attempted tracks attach successfully (AI + fallback)
- AI retry rate: ≤ 10% (higher suggests prompt/profile mismatch)
- Fallback rate: ≤ 5% (higher suggests AI instability or validator too strict)

If SLOs fail, treat as pipeline regression.

---

## 17) Versioning & Reproducibility (Hard Requirements)

Everything is versioned:
- `languageProfileVersion: "v1"`
- `promptVersion: "v1"`
- `validatorVersion: "v1"`
- `fallbackVersion: "v1"`

Store hashes:
- `whisperSegmentsSha256`
- `postProcessInputSha256` (input payload after serialization and normalization)

Deterministic outputs should be reproducible given:
- same segments
- same versions
- same model parameters (temperature=0 or equivalent)

---

## 18) Test Plan (Mandatory)

### 18.1 Golden fixtures
Create fixtures that must produce exact known outputs:
- English (LTR) with punctuation + long sentences
- Arabic (RTL) mixed with numbers and Latin acronym ("USB-C", "2026")
- Japanese (CJK) long lines, no spaces
- Mixed-script edge case (Arabic sentence with embedded English term)
- Non-speech tokens: `[Music]`, `♪ ... ♪`

For each fixture:
- input segments JSON
- expected WebVTT output (golden)
- validator must pass

### 18.2 Property tests
Generate randomized segment sequences and assert:
- validator never passes outputs that violate constraints
- fallback always produces valid WebVTT when possible
- no overlaps, monotonic timestamps

### 18.3 Integration tests
- Workflow idempotency: rerun same job yields same track id/reference
- Retry behavior: forced validation failure triggers one retry then fallback
- Mux attach call mocked and verified

---

## 19) Acceptance Criteria

A build is acceptable when:
- 0 cues exceed `maxLines`
- CPS never exceeds `maxCPS` (per class profile)
- CPL never exceeds `maxCPL`
- No overlaps and `minGap` enforced
- WebVTT is syntactically valid and renders in a reference player
- Works for LTR, RTL, CJK fixtures
- Failures are deterministic, logged, and never silently attached

Operationally:
- Meets SLO targets for attach success and latency in staging load tests

---

## 20) Implementation Notes (Constraints and Defaults)

- Model call parameters:
  - temperature: 0 (or equivalent)
  - max tokens: bounded and logged
- Styling tags:
  - default disabled; enable only behind versioned flag
- Bidi isolates:
  - default off; enable only behind a versioned flag if needed for renderer compatibility
- All configuration MUST be centralized (profiles, versions, limits) and not scattered in code
- Optional: use `chunkVTTCues` (primitives) for downstream metrics, inspection, or QA chunking (not for CPS/CPL enforcement)

---

## 21) Out of Scope (Future Extensions)
- Shot-aware segmentation
- Speaker labeling
- Word-level highlighting
- Translation
- Real-time subtitle streaming

Future extensions MUST continue to use primitives-backed data access (transcripts/storyboards/thumbnails) rather than custom fetchers.

---

## Final note

This spec treats "AI subtitles" as an engineering system:
- AI is optional content shaping
- The validator is the law
- Fallback guarantees coverage
- Versioning guarantees reproducibility

Implement it exactly, and the subtitles stop being a demo feature and start being a platform capability.
---

## 22) Implementation Tasks Status

- [completed] Build language/script classification (BCP-47 parsing + LTR/RTL/CJK mapping).
- [completed] Define and version language profiles (v1) with CPS/CPL/line/duration constraints.
- [completed] Implement normalization + grapheme-aware character counting utilities.
- [completed] Implement WebVTT parsing/serialization helpers and timestamp formatting.
- [completed] Implement deterministic validator with machine-readable errors (v1).
- [completed] Implement deterministic fallback formatter (v1).
- [completed] Implement AI post-processor integration with one retry and structured validator errors.
- [completed] Implement primitives-first MuxDataAdapter for transcript/storyboard access.
- [completed] Implement Workflow DevKit pipeline for post-processing and Mux track attachment.
- [completed] Implement upload path for WebVTT storage and Mux text track creation.
- [completed] Add golden fixtures + property tests + integration-style retry tests.
- [completed] Add versioned metadata, hashing, and audit fields for reproducibility.
- [completed] Add logging hooks + debug artifact persistence for validation failures.
