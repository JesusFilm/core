# Implementation Plan: Vertical Video Crop Tool

**Branch**: `vladmitkovsky/wat-167-video-cropping-tool` | **Date**: 2025-09-19 | **Spec**: /specs/167-vertical-video-crop/spec.md
**Input**: Feature specification from `/specs/167-vertical-video-crop/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A browser-based video cropping tool that converts horizontal videos to vertical 9:16 format for social media platforms. Features include video search by slug, interactive crop workspace with keyframing, AI-assisted person tracking, and WebAssembly-based export using ffmpeg.wasm.

## Technical Context
**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS v4, shadcn/ui, ffmpeg.wasm, MediaPipe Tasks Vision  
**Storage**: Browser local storage for recent videos, temporary files for processing  
**Testing**: Jest + React Testing Library (unit), Playwright (E2E)  
**Target Platform**: Modern browsers with WebAssembly support  
**Project Type**: Web application (frontend with optional server export)  
**Performance Goals**: 60fps interactive UI, 8-12fps detection processing, <30s export for 1min video  
**Constraints**: Browser-first implementation, WebAssembly/Web APIs only, CPU usage reasonable, detectors in Web Workers  
**Scale/Scope**: Single Next.js app in apps/cropper, ~10 components, 1 Web Worker, 1-2 API integrations

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Global Principles Compliance
- [x] **pnpm package manager**: Confirmed for monorepo
- [x] **Code quality gates**: TypeScript strict, ESLint, Prettier, unit tests, E2E tests required
- [x] **Accessibility priority**: Screen reader support, keyboard controls, focus management specified
- [x] **TypeScript typing**: Strict TypeScript required, no 'any' without justification
- [x] **Server-first architecture**: Browser-first with optional server export acceptable for video processing
- [x] **Dependency minimization**: Using existing shadcn/ui, ffmpeg.wasm, MediaPipe (no new heavy dependencies)
- [x] **Implementation strategies**: This plan provides detailed implementation strategy
- [x] **Documentation maintenance**: Spec and plan created, PRD/log to be maintained

### Watch App Constitution Compliance (Reference Only)
*Note: This is a new app (apps/cropper) not modifying existing watch app, so watch-specific rules don't apply*

### Compliance Status: PASS
- No constitution violations detected
- Implementation aligns with global principles
- New app structure appropriate for feature scope

## Project Structure

### Documentation (this feature)
```
specs/167-vertical-video-crop/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend only, browser-based)
apps/cropper/
├── app/                 # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── video-picker.tsx
│   ├── crop-workspace.tsx
│   ├── timeline.tsx
│   └── export-dialog.tsx
├── lib/
│   ├── utils.ts
│   ├── video-api.ts
│   └── crop-engine.ts
├── workers/
│   └── detection.worker.ts
├── hooks/
│   ├── use-video.ts
│   └── use-crop.ts
└── types/
    └── index.ts

apps/cropper-e2e/       # Playwright E2E tests
├── src/
└── playwright.config.ts
```

**Structure Decision**: Option 2 (Web application) - Single frontend app with browser-based video processing, minimal API integration for video discovery.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - WebAssembly ffmpeg.wasm integration patterns and performance
   - MediaPipe Tasks Vision person/face detection API and worker integration
   - Browser video processing limitations and optimization strategies
   - Keyframe interpolation algorithms for smooth crop path animation
   - Video metadata extraction and thumbnail generation

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research WebAssembly video processing patterns for browser-based cropping"
     Task: "Research MediaPipe Tasks Vision integration for person detection in Web Workers"
     Task: "Research browser video API limitations and optimization strategies"
     Task: "Research keyframe interpolation algorithms for smooth crop animation"
     Task: "Research efficient video thumbnail generation at timeline intervals"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical unknowns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Video entity: slug, metadata, playable URL
   - Keyframe entity: timestamp, crop coordinates, interpolation settings
   - CropPath entity: collection of keyframes with smoothing parameters
   - DetectionResult entity: bounding box, confidence, timestamp
   - ExportPreset entity: resolution, encoding settings

2. **Generate API contracts** from functional requirements:
   - GET /api/videos/search?q={slug} → video list with metadata
   - GET /api/videos/{slug} → video details and playable URL
   - POST /api/videos/{slug}/export → server-side export job (optional)
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - Video search API contract test
   - Video details API contract test
   - Export API contract test (if implemented)
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Video search and selection scenario
   - Crop workspace interaction scenario
   - Auto-track person detection scenario
   - Export workflow scenario

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor` for Cursor assistant
   - Add ffmpeg.wasm, MediaPipe Tasks Vision, video processing context
   - Preserve existing entries, keep under 150 lines

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CURSOR.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model/type creation task [P]
- Each user story → integration test task
- Implementation tasks: Nx app setup, component development, worker integration, export pipeline

**Ordering Strategy**:
- TDD order: Contract tests before implementation
- Dependency order: Types → API integration → Core components → Advanced features
- Mark [P] for parallel execution (independent components, tests)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitution violations detected - no complexity tracking needed.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks executed (implementation complete for core features)
- [ ] Phase 4: Implementation complete (missing AI/ML integration)
- [ ] Phase 5: Validation passed

**Implementation Status Summary**:
- ✅ **Completed**: 37/55 tasks (67%) - Core app structure, UI, basic functionality
- ⚠️ **Mock Implementation**: Detection & export use mock data instead of real AI/ML
- ❌ **Missing**: Real MediaPipe integration, real ffmpeg.wasm export, performance tests

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/core/.specify/memory/constitution.md`*
