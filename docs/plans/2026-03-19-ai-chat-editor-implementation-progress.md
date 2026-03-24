---
title: AI Chat Editor — Implementation Progress
date: 2026-03-19
branch: 25-03-RB-feat-ai-chat-journey-editor
plan: 2026-03-18-001-feat-ai-chat-journey-editor-plan.md
---

# Implementation Progress

## Branch: `25-03-RB-feat-ai-chat-journey-editor`

### Commits

| # | Hash | Phase | Description |
|---|------|-------|-------------|
| 1 | `f8dd50753` | Phase 0 | Schema redesign — content array, 8 block types, 5 action kinds |
| 2 | `89063dd98` | Phase 1 | Backend AI agent — subscription, tools, system prompt, undo |
| 3 | `2d4031c91` | Codegen | GraphQL schema for journeyAiChat |
| 4 | `f6325e1c8` | Phase 2 | Frontend AI Editor — canvas, chat panel, 30+ components |
| 5 | `a9f17590c` | Codegen | Gateway schema + Apollo client codegen |

### Verification Status

| Check | Status |
|-------|--------|
| `nx type-check shared-ai` | Pass |
| `nx type-check api-journeys-modern` | Pass |
| `nx test shared-ai` | 51 tests pass |
| `nx test api-journeys-modern` | 522 tests pass |
| `nx build api-journeys-modern` | Pass |
| `nx codegen journeys-admin` | 327 types generated |
| Gateway schema composition | Pass |
| Frontend ESLint (our components) | Clean |
| `nx build journeys-admin` | Fails on pre-existing SSR prerender (needs running API server via `nf start`) |

---

## Phase 0: Complete

**JourneySimple schema redesign** — full rewrite of 3 core files + 4 test files.

Files modified:
- `libs/shared/ai/src/journeySimpleTypes.ts` — content array with discriminated union
- `apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.ts` — emits new format
- `apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.ts` — ingests new format
- All corresponding `.spec.ts` test files

Key changes:
- Flat card fields (`heading`, `text`, `button`, `poll`) → ordered `content: JourneySimpleBlock[]` array
- All 8 addable block types: heading, text, button, image, video, poll, multiselect, textInput, spacer
- All 5 action kinds: navigate, url, email, chat, phone
- Content-derived card IDs (e.g. `card-welcome` not `card-1`)
- Cross-card reference validation via Zod superRefine
- Image width/height/blurhash made optional (server computes)
- Card x/y made optional (auto-layout)
- URL scheme validation (https/http only)
- Image I/O moved outside Prisma transaction
- `@ai-sdk/anthropic` dependency added

---

## Phase 1: Complete

**Backend AI Agent** — 8 new files + 2 modified.

Files created:
- `libs/shared/ai/src/agentJourneyTypes.ts` — AgentJourney, PlanOperation, NavigationMap types
- `apis/api-journeys-modern/src/schema/journeyAiChat/journeyAiChat.ts` — main subscription + mutations
- `apis/api-journeys-modern/src/schema/journeyAiChat/getAgentJourney.ts` — journey state reader for AI
- `apis/api-journeys-modern/src/schema/journeyAiChat/executeOperation.ts` — surgical tool executor
- `apis/api-journeys-modern/src/schema/journeyAiChat/systemPrompt.ts` — full AI system prompt
- `apis/api-journeys-modern/src/schema/journeyAiChat/snapshotStore.ts` — Redis undo snapshots
- `apis/api-journeys-modern/src/schema/journeyAiChat/tools/searchImages.ts` — Unsplash batch search
- `apis/api-journeys-modern/src/schema/journeyAiChat/index.ts` — barrel

Files modified:
- `apis/api-journeys-modern/src/env.ts` — added ANTHROPIC_API_KEY (optional)
- `apis/api-journeys-modern/src/schema/schema.ts` — wired journeyAiChat

Key features:
- GraphQL SSE subscription (`journeyAiChatCreateSubscription`)
- Two-phase loop: AI plans via `submit_plan`, server executes
- 10 surgical tools (createCard, deleteCard, updateCard, addBlock, updateBlock, deleteBlock, reorderCards, updateJourneySettings, generate_journey, translate)
- `search_images` batch tool (Unsplash, up to 5 queries)
- Full system prompt with examples and behavioral constraints
- Redis-based undo snapshots with per-turn checkpoints
- `journeyAiChatUndo` + `journeyAiChatExecutePlan` mutations
- Tiered model selection (Gemini Flash free / Claude BYOK)
- Mid-session model switching via `preferredTier`
- Published journey warning
- Prompt hardening (preSystemPrompt + hardenPrompt)
- History validation (roles, length, entry limits)
- Server-derived `requiresConfirmation`
- `sanitizeErrorMessage` for safe error propagation
- Vercel AI SDK v4 compatible (`inputSchema`, `tool()`, `stepCountIs()`)

---

## Phase 2: Complete

**Frontend AI Editor** — 31 new files + 4 modified.

Page route:
- `apps/journeys-admin/pages/journeys/[journeyId]/ai-chat.tsx`

Components (all in `apps/journeys-admin/src/components/AiEditor/`):
- `AiEditor.tsx` — main 60/40 split layout
- `AiEditorToolbar/` — toolbar with Edit Manually, title, Stop button
- `AiJourneyFlow/` — React Flow canvas with dagre auto-layout
  - `nodes/AiCardPreviewNode/` — full card preview at 0.55 scale
  - `edges/AiViewEdge/` — labeled edges (default/button/poll)
  - `libs/layoutNodes/` — dagre positioning
- `AiChatPanel/` — chat panel with messages, input, model indicator
  - `MessageBubble/` — user/AI bubbles with hover-to-reveal undo
  - `PlanCard/` — operation status (pending/running/done/failed)
  - `StarterSuggestions/` — empty state with suggestion chips
  - `ChatInput/` — input with context pill, send/stop toggle
  - `ModelIndicator/` — free/premium tier display
  - `ToolCallCard/` — tool progress display

Hook:
- `apps/journeys-admin/src/libs/useJourneyAiChatSubscription/`

Entry point:
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/AIEditorItem/`

Dependencies added:
- `@dagrejs/dagre` — branching canvas layout

---

## Phase 3: Not Started

Deferred items:
- Theme/Appearance tool
- AI Image Search extraction to shared NX lib
- "Create with AI" journey list entry point
- UserApiKey Prisma model + migration (BYOK encryption)

---

## Design Artifacts

- **Pencil mockups**: `pencil-new.pen` — 16 screens + review board
- **Plan document**: `docs/plans/2026-03-18-001-feat-ai-chat-journey-editor-plan.md`
- **Low priority findings**: `docs/plans/2026-03-19-ai-chat-editor-low-priority-findings.md`

---

## Known Issues

1. `nx build journeys-admin` fails on SSR prerender for `/en/templates` — pre-existing issue, needs running API server (`nf start`)
2. `journeyAiTranslate.spec.ts` has a pre-existing test failure (AI SDK version mismatch)
3. Frontend component tests not yet written
4. BYOK key encryption uses env var as placeholder — needs UserApiKey Prisma model
