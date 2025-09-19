# Tasks: Vertical Video Crop Tool

**Input**: Design documents from `/specs/vladmitkovsky/wat-167-video-cropping-tool/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## 📊 Current Implementation Status

**Progress**: 36/56 tasks completed (64%)
- ✅ **Setup & Infrastructure**: 6/6 tasks ✅
- ✅ **Tests**: 8/8 tasks ✅ (implemented but may need API endpoints to pass)
- ✅ **Core Implementation**: 15/15 tasks ✅
- ⚠️ **Integration**: 7/11 tasks (MediaPipe working, detection worker exists)
- ⚠️ **Polish**: 4/16 tasks ✅ (unit tests done, missing performance/accessibility)

**Critical Gaps**:
- ❌ Auto-tracking integration: Detection results → Crop keyframes (T056)
- ❌ Real ffmpeg.wasm Web Worker setup (T031) and video export pipeline (T033)
- ❌ Performance tests and accessibility audit

**Working Features**:
- Video search and selection (GraphQL + mock data)
- Video playback controls and timeline
- Crop workspace with keyframe editing
- Real-time MediaPipe person detection (shows bounding boxes)
- Auto-tracking checkbox UI (detection runs when enabled)
- Basic export dialog (mock implementation)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: Next.js 14, React 18, Tailwind v4, shadcn/ui, ffmpeg.wasm, MediaPipe Tasks Vision
2. Load design documents:
   → data-model.md: 5 entities (Video, CropKeyframe, CropPath, DetectionResult, ExportPreset)
   → contracts/: 3 API endpoints (search, get video, export)
   → research.md: WebAssembly integration patterns, detection algorithms
   → quickstart.md: 5 test scenarios
3. Generate tasks by category:
   → Setup: Nx app creation, dependencies, shadcn/ui setup
   → Tests: 3 contract tests, 5 integration tests
   → Core: 5 model types, 8 components, Web Worker setup
   → Integration: API integration, ffmpeg.wasm, MediaPipe detection
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `apps/cropper/` (new Next.js app)
- **Source files**: `apps/cropper/src/`
- **Tests**: `apps/cropper-e2e/src/`
- **Components**: `apps/cropper/src/components/`
- **Workers**: `apps/cropper/src/workers/`

## Phase 3.1: Setup
- [x] T001 Create Nx Next.js app structure in apps/cropper/
- [x] T002 Configure Next.js 14 with App Router and TypeScript strict mode
- [x] T003 [P] Install dependencies: React 18, Tailwind v4, shadcn/ui, ffmpeg.wasm, MediaPipe Tasks Vision
- [x] T004 [P] Configure ESLint and Prettier for TypeScript/React
- [x] T005 [P] Setup shadcn/ui components and theming in apps/cropper/src/components/ui/
- [x] T006 Create basic project structure: app/, components/, lib/, workers/, types/

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T007 [P] Contract test GET /videos/search in apps/cropper-e2e/src/contract/video-search.spec.ts
- [x] T008 [P] Contract test GET /videos/{slug} in apps/cropper-e2e/src/contract/video-details.spec.ts
- [x] T009 [P] Contract test POST /videos/{slug}/export in apps/cropper-e2e/src/contract/video-export.spec.ts
- [x] T010 [P] Integration test video search and selection in apps/cropper-e2e/src/integration/video-picker.spec.ts
- [x] T011 [P] Integration test crop workspace interaction in apps/cropper-e2e/src/integration/crop-workspace.spec.ts
- [x] T012 [P] Integration test timeline and keyframes in apps/cropper-e2e/src/integration/timeline-keyframes.spec.ts
- [x] T013 [P] Integration test person detection auto-tracking in apps/cropper-e2e/src/integration/person-detection.spec.ts
- [x] T014 [P] Integration test export workflow in apps/cropper-e2e/src/integration/export-workflow.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T015 [P] TypeScript types for Video entity in apps/cropper/src/types/video.ts
- [x] T016 [P] TypeScript types for CropKeyframe entity in apps/cropper/src/types/crop-keyframe.ts
- [x] T017 [P] TypeScript types for CropPath entity in apps/cropper/src/types/crop-path.ts
- [x] T018 [P] TypeScript types for DetectionResult entity in apps/cropper/src/types/detection.ts
- [x] T019 [P] TypeScript types for ExportPreset entity in apps/cropper/src/types/export.ts
- [x] T020 [P] Zod validation schemas for all entities in apps/cropper/src/lib/validation.ts
- [x] T021 Video picker component with search in apps/cropper/src/components/video-picker.tsx
- [x] T022 Crop workspace component with 9:16 overlay in apps/cropper/src/components/crop-workspace.tsx
- [x] T023 Timeline component with thumbnails in apps/cropper/src/components/timeline.tsx
- [x] T024 Keyframe editor component in apps/cropper/src/components/keyframe-editor.tsx
- [x] T025 Export dialog component in apps/cropper/src/components/export-dialog.tsx
- [x] T026 Video API integration service in apps/cropper/src/lib/video-api.ts
- [x] T027 Crop engine utility functions in apps/cropper/src/lib/crop-engine.ts
- [x] T028 Video processing utilities in apps/cropper/src/lib/video-utils.ts
- [x] T029 Main app layout and routing in apps/cropper/src/app/layout.tsx and page.tsx

## Phase 3.4: Integration
- [x] T030 Detection Web Worker setup in apps/cropper/src/workers/detection.worker.ts
- [ ] T031 ffmpeg.wasm Web Worker setup in apps/cropper/src/workers/ffmpeg.worker.ts
- [x] T032 MediaPipe Tasks Vision integration in apps/cropper/src/lib/detection.ts *(Real detection working, shows bounding boxes)*
- [ ] T056 Auto-tracking integration: Detection results → Crop keyframes in apps/cropper/src/hooks/use-cropper.ts *(Connect detection results to automatically create/update crop keyframes)*
- [ ] T033 ffmpeg.wasm video export pipeline in apps/cropper/src/lib/export-engine.ts
- [x] T034 Keyframe interpolation algorithms in apps/cropper/src/lib/interpolation.ts
- [x] T035 Video thumbnail generation in apps/cropper/src/lib/thumbnails.ts
- [x] T036 State management with React hooks in apps/cropper/src/hooks/use-cropper.ts
- [x] T037 Video playback controls integration in apps/cropper/src/hooks/use-video.ts
- [x] T038 Progress tracking for export operations in apps/cropper/src/hooks/use-export.ts
- [x] T039 Error handling and user feedback in apps/cropper/src/lib/error-handling.ts

## Phase 3.5: Polish
- [x] T040 [P] Unit tests for validation schemas in apps/cropper/src/__tests__/validation.test.ts
- [x] T041 [P] Unit tests for interpolation algorithms in apps/cropper/src/__tests__/interpolation.test.ts
- [x] T042 [P] Unit tests for crop engine utilities in apps/cropper/src/__tests__/crop-engine.test.ts
- [x] T043 [P] Unit tests for video utilities in apps/cropper/src/__tests__/video-utils.test.ts
- [ ] T044 Performance tests for 60fps UI responsiveness
- [ ] T045 Performance tests for detection processing (8-12fps target)
- [ ] T046 Performance tests for export workflow (<30s target)
- [ ] T047 Accessibility audit and keyboard navigation fixes
- [ ] T048 Screen reader support and ARIA labels implementation
- [ ] T049 Browser compatibility testing (Chrome, Firefox, Safari)
- [ ] T050 Error boundary implementation for graceful failure handling
- [ ] T051 Loading states and progress indicators
- [ ] T052 Documentation updates for API integration
- [ ] T053 README and quickstart guide updates
- [ ] T054 Code cleanup and remove dead code
- [ ] T055 Final validation against quickstart.md scenarios

## Dependencies
- Setup tasks (T001-T006) before all other tasks
- Test tasks (T007-T014) before implementation tasks (T015-T039)
- TypeScript types (T015-T019) before validation schemas (T020)
- Core components (T021-T025) before integration features (T030-T039)
- API service (T026) before components that use it (T021, T032)
- Web Workers (T030-T031) before integration code (T032-T033)
- Implementation tasks (T015-T039) before polish tasks (T040-T055)
- Parallel [P] tasks can run simultaneously if no file conflicts

## Parallel Execution Examples
```
# Contract tests can run in parallel:
Task: "Contract test GET /videos/search in apps/cropper-e2e/src/contract/video-search.spec.ts"
Task: "Contract test GET /videos/{slug} in apps/cropper-e2e/src/contract/video-details.spec.ts"
Task: "Contract test POST /videos/{slug}/export in apps/cropper-e2e/src/contract/video-export.spec.ts"

# Integration tests can run in parallel:
Task: "Integration test video search and selection in apps/cropper-e2e/src/integration/video-picker.spec.ts"
Task: "Integration test crop workspace interaction in apps/cropper-e2e/src/integration/crop-workspace.spec.ts"
Task: "Integration test timeline and keyframes in apps/cropper-e2e/src/integration/timeline-keyframes.spec.ts"
Task: "Integration test person detection auto-tracking in apps/cropper-e2e/src/integration/person-detection.spec.ts"
Task: "Integration test export workflow in apps/cropper-e2e/src/integration/export-workflow.spec.ts"

# TypeScript types can run in parallel:
Task: "TypeScript types for Video entity in apps/cropper/src/types/video.ts"
Task: "TypeScript types for CropKeyframe entity in apps/cropper/src/types/crop-keyframe.ts"
Task: "TypeScript types for CropPath entity in apps/cropper/src/types/crop-path.ts"
Task: "TypeScript types for DetectionResult entity in apps/cropper/src/types/detection.ts"
Task: "TypeScript types for ExportPreset entity in apps/cropper/src/types/export.ts"

# Core components can run in parallel:
Task: "Video picker component with search in apps/cropper/src/components/video-picker.tsx"
Task: "Crop workspace component with 9:16 overlay in apps/cropper/src/components/crop-workspace.tsx"
Task: "Timeline component with thumbnails in apps/cropper/src/components/timeline.tsx"
Task: "Keyframe editor component in apps/cropper/src/components/keyframe-editor.tsx"
Task: "Export dialog component in apps/cropper/src/components/export-dialog.tsx"
```

## Notes
- [P] tasks = different files, no dependencies, can run in parallel
- Verify all tests fail before implementing any functionality
- Commit after each completed task for proper git history
- Follow TDD: Red → Green → Refactor cycle
- Use exact file paths as specified in tasks
- Ensure 9:16 aspect ratio constraints in all crop operations
- Implement smooth keyframe interpolation for professional results
- Handle WebAssembly loading gracefully with user feedback
- Maintain 60fps UI responsiveness during video processing
- Follow accessibility guidelines for keyboard navigation and screen readers

## Task Generation Rules Applied
*Applied during task generation process*

1. **From Contracts**:
   - video-api.yaml → 3 contract test tasks [P]
   - video-api.contract.spec.ts → integration test patterns
   - Each API endpoint → corresponding implementation task

2. **From Data Model**:
   - 5 entities → 5 TypeScript type definition tasks [P]
   - Entity relationships → validation and service layer tasks
   - State management entities → React hook tasks

3. **From Research**:
   - ffmpeg.wasm patterns → Web Worker and export pipeline tasks
   - MediaPipe integration → detection worker and algorithm tasks
   - Browser optimizations → performance and compatibility tasks

4. **From Quickstart**:
   - 5 test scenarios → 5 integration test tasks [P]
   - Performance targets → performance test tasks
   - Accessibility requirements → polish tasks

5. **Ordering**:
   - Setup → Tests → Types → Validation → Components → Integration → Polish
   - Dependencies enforced through task numbering and prerequisites

## Validation Checklist
*GATE: Checked before task generation completion*

- [x] All 3 contracts have corresponding test tasks (T007-T009)
- [x] All 5 entities have model/type tasks (T015-T019)
- [x] All 5 user stories have integration tests (T010-T014)
- [x] All tests come before implementation (T007-T014 before T015-T039)
- [x] Parallel tasks are truly independent (different file paths)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies properly ordered by phase and prerequisites
- [x] Task count appropriate for feature scope (56 total tasks)
- [x] Technical decisions from research.md incorporated
- [x] Quickstart scenarios covered in test tasks

---
*Generated from design documents in /specs/vladmitkovsky/wat-167-video-cropping-tool/
Total Tasks: 56 | Parallel Tasks: 24 | Sequential Tasks: 32*
