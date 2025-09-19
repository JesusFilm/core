# Feature Specification: Vertical Video Crop Tool

**Feature Branch**: `vladmitkovsky/wat-167-video-cropping-tool`  
**Created**: Friday, September 19, 2025  
**Status**: Draft  
**Input**: User description: "AI CODING AGENT BRIEF — Vertical Video Crop Tool (Monorepo)

ROLE
Act as a senior full-stack engineer working in an Nx monorepo with Next.js, TypeScript, Tailwind v4, and shadcn/ui. Produce a brief plan first, then immediately implement.

CONTEXT
- Monorepo: Nx, pnpm
- New app: apps/cropper (Next.js App Router, TypeScript strict)
- Shared UI: libs/ui (existing or create if missing) using shadcn/ui + Tailwind v4 tokens
- Video source: internal Video API (videos discoverable by slug)
- Goal: take horizontal source videos and produce a vertical 9:16 crop suitable for TikTok/Reels/Shorts
- Constraint: browser-first implementation using WebAssembly/Web APIs; enable optional server/worker export if needed

PRIMARY REQUIREMENTS
1) Video picker by slug
   - Search input with debounced query and results list
   - Ability to paste a slug or open a "recent" list
   - Load metadata: duration, width/height, thumbnail(s)

2) Preview + crop workspace
   - 9:16 frame overlay at target resolutions (e.g., 1080×1920, 720×1280)
   - Drag/zoom pan of crop region over the playing video
   - Timeline with scrubber, thumbnails every N seconds, and keyframe markers
   - Keyframed crop path: user can set crop box at timestamps; tween between keyframes
   - Snap lines and safe margins; grid toggle

3) "Focus on main character" assist
   - Person/face detection pipeline to suggest an auto-tracked crop path
   - Use lightweight, local models (e.g., MediaPipe Tasks Vision person/face detector or the "Human" JS library) running in a Web Worker
   - Sample frames at ~8–12 fps while scrubbing; apply smoothing (Kalman or exponential smoothing of bbox center/size)
   - User can toggle between "Auto track," "Auto track + user offset," and "Manual only"
   - If detector confidence drops, gracefully fall back to last good bbox and flag segments for manual review

4) Export
   - One-click export to 9:16 with selected preset (1080×1920 30 fps)
   - First pass: browser-side export with ffmpeg.wasm (H.264 if feasible; fall back to WebM/VP9 if needed)
   - Optional second pass: generate an instruction file (JSON/EDL) and POST to a serverless job for faster encode; return downloadable artifact URL
   - Burn-in letterbox optional off by default

5) UX, performance, and accessibility
   - Keyboard controls: J/K/L and arrow keys, space to pause/play, +/- to zoom crop
   - Keep interactive work at 60 fps where possible; run detectors in a Worker at reduced fps
   - Announce states for screen readers; focus styles; color-contrast compliant

6) Project hygiene
   - TypeScript strict, ESLint + Prettier, Tailwind v4 config
   - shadcn/ui components for layout (Card, Slider, Tabs, DropdownMenu, Dialog, Button)
   - E2E test with Playwright for basic flow; unit tests for crop keyframe interpolation
   - Provide README with setup, env, and usage
   - Follow repository branch naming and commit rules enforced by CI

DELIVERABLES
- Working Next.js app at apps/cropper
- Reusable components in libs/ui where appropriate
- Person/face detection Worker, crop-path store, timeline component, export pipeline
- Tests (unit + E2E), sample env file, README
- A small demo dataset hook for local dev if API is empty

ASSUMPTIONS
- Video API exposes endpoints to list videos by slug and fetch a playable HLS/MP4 URL and metadata
- It's acceptable to start with WebM export and iterate toward H.264; server export can be added behind a flag

TECH SPEC HINTS
- State: Zustand or Redux Toolkit; time-based keyframes stored as [{t, x, y, w, h}]
- Interpolation: cubic or linear with easing; clamp to source bounds; safe margins for heads
- Worker contracts:
  - DETECT_REQUEST { url|frame, time }
  - DETECT_RESPONSE { time, bbox, score }
- Smoothing: EMA on center and size; configurable alpha
- Export with ffmpeg.wasm:
  - Prepare crop filters per frame segment using keyframes, or re-render with a scripted "crop" filter chain
  - Presets: 1080×1920, 720×1280; constant frame rate 30
- Timeline thumbnails: createImageBitmap on sampled frames for responsiveness
- Error handling: show detector status and export progress with cancel

NON-GOALS (FOR V1)
- Multi-person identity tracking
- Automatic captioning
- LUT/color grading

ENV & COMMANDS
- Package manager: pnpm
- Generate app: Nx Next.js app under apps/cropper (App Router)
- Tailwind v4: ensure tailwind config and PostCSS set for both app and libs/ui
- shadcn/ui: install and configure once at repo root; share tokens via libs/ui

PLANNING THEN BUILD
A) PLAN (output this first as a checklist)
   1. Create app and configure Tailwind v4 and shadcn/ui
   2. Scaffolding: layout, page routes, app shell
   3. Video search by slug + data fetching
   4. Player + overlay crop box + 9:16 frame
   5. Timeline with thumbnails and keyframes
   6. Worker-based person/face detection and smoothing
   7. Auto-track to keyframes conversion and user overrides
   8. Export via ffmpeg.wasm
   9. Tests, README, polish

B) IMPLEMENT (after plan is printed)
   - Create a feature branch that satisfies repo rules
   - Commit early and often with conventional commits
   - Provide all code changes, config files, and test files inline
   - Include a final "How to run" section and known limitations

CONSTRAINTS
- No MUI; use shadcn/ui
- TypeScript strict; no "any" without justification
- Keep CPU usage reasonable; detectors must be in a Worker
- Respect monorepo paths and TS path aliases

ACCEPTANCE CRITERIA
- I can search or paste a slug, load a video, scrub the timeline, set keyframed crop, preview 9:16, auto-track a person, and export a playable 9:16 file at 1080×1920 or 720×1280
- Tests pass locally and in CI
- README explains setup, env, and usage clearly

START NOW
1) Output the PLAN checklist with concrete file paths, Nx/pnpm commands, and component names
2) Then begin IMPLEMENTATION: create the app, core components, Worker, detection pipeline scaffolding, and a minimal export path
3) Include Playwright E2E test for the happy path (pick video, set one keyframe, export)"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors (content creators, video editors), actions (search, crop, export), data (videos, keyframes, metadata), constraints (browser-first, 9:16 aspect ratio)
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → Clear user flow identified from description
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (video data, crop keyframes, export settings)
7. Run Review Checklist
   → No [NEEDS CLARIFICATION] markers remain
   → Implementation details properly abstracted
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a content creator preparing videos for social media platforms (TikTok, Instagram Reels, YouTube Shorts), I need to convert horizontal videos into vertical 9:16 format so that my content fits the expected aspect ratio and engages viewers properly on mobile devices.

### Acceptance Scenarios
1. **Given** I have a horizontal video in the system, **When** I search for it by slug and select it, **Then** the video loads with its metadata and I can see a preview
2. **Given** a video is loaded, **When** I interact with the timeline scrubber, **Then** the video seeks to that timestamp and shows the corresponding frame
3. **Given** a video is playing, **When** I drag to define a crop region and set it as a keyframe, **Then** the crop box is saved at that timestamp and interpolated between keyframes
4. **Given** crop keyframes are set, **When** I enable auto-track mode, **Then** the system detects persons/faces and suggests an optimal crop path with smoothing
5. **Given** a crop path is defined (manually or auto-tracked), **When** I click export with a preset, **Then** a 9:16 video file is generated and downloadable

### Edge Cases
- What happens when video API is unavailable or returns no results?
- How does system handle videos shorter than 1 second or longer than 10 minutes?
- What happens when person detection confidence drops below threshold?
- How does system behave when browser lacks WebAssembly support?
- What happens when export fails midway through processing?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Users MUST be able to search for videos by slug with debounced input and view results list
- **FR-002**: Users MUST be able to paste a video slug directly or select from recent videos list
- **FR-003**: System MUST load and display video metadata including duration, dimensions, and thumbnails
- **FR-004**: System MUST display a 9:16 aspect ratio overlay frame on the video preview
- **FR-005**: Users MUST be able to drag and resize a crop region over the playing video
- **FR-006**: System MUST provide a timeline with scrubber, thumbnails, and keyframe markers
- **FR-007**: Users MUST be able to set crop keyframes at specific timestamps with tweening between them
- **FR-008**: System MUST provide snap lines, safe margins, and optional grid overlay
- **FR-009**: System MUST offer person/face detection with auto-tracking capability
- **FR-010**: System MUST apply smoothing algorithms to detected bounding boxes
- **FR-011**: Users MUST be able to toggle between auto-track, auto-track with offset, and manual modes
- **FR-012**: System MUST gracefully handle detection failures and flag segments for review
- **FR-013**: Users MUST be able to export cropped videos in 9:16 format with preset resolutions
- **FR-014**: System MUST support browser-side video processing with WebAssembly
- **FR-015**: System MUST provide keyboard controls for video playback and crop manipulation
- **FR-016**: System MUST maintain 60fps interactive performance and run detection at reduced framerate
- **FR-017**: System MUST provide screen reader announcements and focus management
- **FR-018**: System MUST pass accessibility color contrast requirements
- **FR-019**: System MUST include E2E tests for the complete user flow
- **FR-020**: System MUST include unit tests for keyframe interpolation logic

### Key Entities *(include if feature involves data)*
- **Video**: Represents a source video with slug identifier, metadata (duration, dimensions, thumbnails), and playable URL
- **Keyframe**: Represents a crop position at a specific timestamp with x, y, width, height coordinates
- **CropPath**: Collection of keyframes that define the complete crop animation over time
- **DetectionResult**: Contains bounding box coordinates, confidence score, and timestamp for person/face detection
- **ExportPreset**: Defines target resolution (1080×1920, 720×1280) and encoding settings

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
