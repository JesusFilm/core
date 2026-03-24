---
title: "AI Chat Journey Editor — Full-Stack Feature Pattern"
category: architecture
date: 2026-03-19
tags:
  - ai-agent
  - graphql-subscription
  - react-flow
  - vercel-ai-sdk
  - two-phase-execution
  - pencil-mockups
  - plan-driven-development
modules:
  - api-journeys-modern
  - journeys-admin
  - shared-ai
severity: n/a
resolution_time: "1 session (~4 hours)"
---

# AI Chat Journey Editor — Full-Stack Feature Pattern

## Problem

Build a complete AI-powered editing experience for a complex block-based content system (journeys). Non-technical users need to describe changes in natural language and see them executed in real time on a visual canvas. This required coordinating: schema redesign, backend AI agent with tools, GraphQL streaming, React Flow canvas with full card previews, and a chat interface — all in one feature.

## Root Cause / Challenge

The existing `JourneySimple` schema only covered ~50% of block types and used a flat field structure that prevented multiple blocks of the same type. The AI couldn't create multiselect, text input, or spacer blocks. Navigation actions were limited to navigate/url only (missing email, chat, phone). This made the AI unreliable for real editing.

## Solution

### Architecture: Plan → Design → Implement (in phases)

**Phase 0 (Schema):** Redesigned `JourneySimple` with a `content: JourneySimpleBlock[]` discriminated union array. All 8 block types, all 5 action kinds, cross-card reference validation, content-derived card IDs.

**Phase 1 (Backend):** Two-phase agent loop — AI plans via `submit_plan` tool, server executes operations directly. Surgical tools for targeted edits (`addBlock`, `updateBlock`, etc.) alongside atomic `generate_journey` for full rewrites. Redis undo snapshots, tiered model selection (Gemini free / Claude BYOK).

**Phase 2 (Frontend):** Split-pane editor — React Flow canvas (60%) with full card previews at 0.55 scale + chat panel (40%) with streaming messages, plan cards, suggestion chips.

### Key Technical Decisions

#### 1. Two-phase loop (AI plans, server executes)

```
User message → AI streams text + calls submit_plan → Server executes each operation → Canvas updates
```

**Why:** Server-driven execution completes in ~0.5s vs ~15s for AI-driven. The AI only makes decisions once; server handles I/O.

#### 2. Vercel AI SDK v4 tool definition pattern

```typescript
import { stepCountIs, streamText, tool } from 'ai'

const result = streamText({
  model,
  system: fullSystemPrompt,
  messages,
  tools: {
    search_images: tool({
      description: '...',
      inputSchema: z.object({ queries: z.array(z.string()) }),
      execute: async ({ queries }) => { ... }
    }),
    submit_plan: tool({
      description: '...',
      inputSchema: planOperationArraySchema,
      execute: async (args) => args
    })
  },
  stopWhen: stepCountIs(5)
})

for await (const part of result.fullStream) {
  switch (part.type) {
    case 'text-delta': /* part.text (not part.textDelta) */
    case 'tool-call':  /* part.input (not part.args) */
    case 'tool-result': /* part.output (not part.result) */
  }
}
```

**Critical:** AI SDK v4 renamed: `parameters` → `inputSchema`, `maxSteps` → `stopWhen: stepCountIs(N)`, `textDelta` → `text`, `args` → `input`, `result` → `output`.

#### 3. Content-derived card IDs

```typescript
function generateCardIds(cards) {
  const usedIds = new Set<string>()
  return cards.map((card) => {
    const slug = (card.heading ?? card.firstText ?? 'untitled')
      .toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      .split(/\s+/).slice(0, 4).join('-') || 'untitled'
    let id = `card-${slug}`
    let counter = 2
    while (usedIds.has(id)) { id = `card-${slug}-${counter++}` }
    usedIds.add(id)
    return id
  })
}
```

**Why:** Semantic IDs (`card-welcome`) help the AI reason about card relationships vs positional IDs (`card-1`).

#### 4. Prompt hardening for journey state injection

```typescript
const fullSystemPrompt = `${preSystemPrompt}\n\n${systemPrompt}\n\n## Current Journey State\n${hardenPrompt(JSON.stringify(agentJourney))}\n\nSummary: ${agentJourney.cards.length} cards.${contextSuffix}`
```

**Why:** User-authored card content is injected into the system prompt — without `hardenPrompt` wrapping, prompt injection via card headings is possible.

#### 5. Server-derived confirmation (not AI-decided)

```typescript
const requiresConfirmation = plan.operations.some(o => o.tool === 'generate_journey')
  || plan.operations.filter(o => o.tool === 'delete_card').length > 3
```

**Why:** The AI shouldn't decide whether to confirm destructive operations — it could be manipulated via prompt injection to skip confirmation.

#### 6. Dagre auto-layout for branching flows

```typescript
import dagre from '@dagrejs/dagre'
const g = new dagre.graphlib.Graph()
g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 40 })
```

**Why:** Linear journeys (A→B→C) are trivial, but poll cards branching to 3+ targets need algorithmic positioning.

### Design Process (Pencil Mockups)

Created 16 screens covering every UX state:
- Empty state, thinking, streaming, executing (shimmer), completed, undo confirmation
- Error state, rate limit, stop mid-execution, empty journey
- Branching flow visualization, API key setup, Claude connected
- Switch to manual editing confirmation

**Key design decisions made during mockup iteration:**
- Card selection border: blue (not red — red was overloaded for selected/executing/error)
- Undo: hover-to-reveal on user message bubble (not toolbar button)
- Default next edge: solid gray line (not dashed — dashed was invisible)
- Plan card descriptions: user-friendly language ("Add email input to Welcome card" not "Add TextResponseBlock to card-welcome")

## Prevention Strategies

1. **Always check AI SDK version** before writing tool definitions. The API changed significantly between v3 and v4 (`parameters` → `inputSchema`, `maxSteps` → `stopWhen`).

2. **Move all external I/O outside Prisma transactions** — image uploads, YouTube API calls happen before `$transaction`.

3. **Use Redis (not lru-cache) for data that must survive pod restarts** — undo snapshots routed to different pods via load balancer.

4. **Server-derive security-sensitive flags** — confirmation, rate limiting decisions should not be AI-controlled.

5. **Content-derived IDs need collision handling** — always deduplicate with counter suffixes.

6. **Run `nx generate-graphql` after adding Pothos types**, then compose gateway schema, then run Apollo client codegen. Three separate steps.

7. **ESLint in this codebase requires i18n wrapping** — all user-visible strings need `useTranslation` + `t()`. Check this before committing frontend components.

## Cross-References

- Plan: `docs/plans/2026-03-18-001-feat-ai-chat-journey-editor-plan.md`
- Progress: `docs/plans/2026-03-19-ai-chat-editor-implementation-progress.md`
- Low-priority findings: `docs/plans/2026-03-19-ai-chat-editor-low-priority-findings.md`
- Design mockups: `pencil-new.pen`
- Existing translate pattern: `apis/api-journeys-modern/src/schema/journeyAiTranslate/journeyAiTranslate.ts`
