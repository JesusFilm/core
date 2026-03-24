---
title: AI Chat Interface for Journey Creation and Editing
type: feat
status: active
date: 2026-03-18
updated: 2026-03-19
---

# AI Chat Interface for Journey Creation and Editing

## Overview

Build a chat-based AI experience inside `journeys-admin` that lets non-technical creators describe what they want — and have their journey built or edited in real time. The AI understands the journey block structure and manipulates it via tools, streaming its thinking back to the user.

---

## Problem Statement

The existing journey editor is a powerful visual tool, but it requires understanding the block system — steps, cards, typography, buttons, actions, and their relationships. Non-technical creators often struggle to build flows from scratch or make systematic changes across many cards. There is no path from "I want a 5-card onboarding flow" to a working journey without manual block-by-block construction.

---

## Proposed Solution

### AI Editor (`/journeys/[id]/ai-chat`)

A new, dedicated editor route alongside the existing manual editor. The AI editor shows a read-only journey flow canvas (full card previews) on the left and an AI chat panel on the right. Users describe what they want; the AI edits the journey while the canvas updates live with per-card loading states.

### Backend AI Agent

A new GraphQL SSE subscription `journeyAiChatCreateSubscription` in `api-journeys-modern`. The backend runs a two-phase loop:

1. **Plan phase** — AI reads journey state (injected into system prompt), produces a plan via `submit_plan` tool
2. **Execute phase** — server executes plan operations directly, streaming live progress back to the client

### Tiered AI Model

| Tier | Model | Who pays |
|------|-------|----------|
| Free (default) | Gemini 2.5 Flash | Application (`GOOGLE_GENERATIVE_AI_API_KEY`) |
| Premium | Claude Sonnet 4 | User (BYOK — own Anthropic API key) |

Users get Gemini Flash for free. Power users can connect their own Anthropic API key for Claude (encrypted server-side via AES-256/GCP KMS).

### Mid-session model switching

Users can switch between free (Gemini Flash) and premium (Claude) tiers without losing conversation context:

- Subscription input includes `preferredTier?: 'free' | 'premium'` (defaults to `'premium'` if API key exists)
- Model selection: `(userKey && preferredTier !== 'free') ? claude : gemini`
- Conversation history is client-managed and format-compatible across models (Vercel AI SDK normalizes messages)
- Switching is instant — the next message simply uses the new tier
- Use cases: Claude rate limit hit → switch to free tier; testing free vs premium quality
- Client stores `preferredTier` in React state (session-scoped, resets to premium on refresh if key exists)

---

## Key Architectural Decisions

### Why `JourneySimple` is the AI-native layer

The codebase already has a purpose-built simplified schema at `libs/shared/ai/src/journeySimpleTypes.ts`. Phase 0 expands it to cover all 8 addable block types. After Phase 0, a journey is represented as:

```typescript
{
  title: string
  description: string
  cards: Array<{
    id: string              // content-derived: "card-welcome", not "card-1"
    x?: number              // optional — auto-assigned if omitted
    y?: number              // optional — defaults to 0
    backgroundColor?: string
    backgroundImage?: { src, alt, width?, height?, blurhash? }
    backgroundVideo?: { url, startAt?, endAt? }
    defaultNextCard?: string
    content: Array<
      | { type: 'heading';    text: string; variant?: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6' }
      | { type: 'text';       text: string; variant?: 'body1'|'body2'|'subtitle1'|'subtitle2'|'caption'|'overline' }
      | { type: 'button';     text: string; action: Action }
      | { type: 'image';      src: string; alt: string; width?: number; height?: number; blurhash?: string }
      | { type: 'video';      url: string; startAt?: number; endAt?: number }
      | { type: 'poll';       gridView?: boolean; options: Array<{ text: string; action: Action }> }
      | { type: 'multiselect'; min?: number; max?: number; options: string[] }
      | { type: 'textInput';  label: string; inputType?: 'freeForm'|'name'|'email'|'phone'; placeholder?: string; hint?: string; required?: boolean }
      | { type: 'spacer';     spacing: number }
    >
  }>
}

// Action — 5 types, discriminated by `kind`
type Action =
  | { kind: 'navigate'; cardId: string }
  | { kind: 'url';      url: string }
  | { kind: 'email';    email: string }
  | { kind: 'chat';     chatUrl: string }
  | { kind: 'phone';    phone: string; countryCode?: string; contactAction?: 'call'|'text' }
```

### Hybrid write strategy

- `generate_journey` (full atomic replacement via `updateSimpleJourney`) — for creation from scratch, or rewriting >50% of the journey
- Surgical tools (`create_card`, `add_block`, `update_block`, etc.) — for targeted edits to existing journeys

### Journey state injected into system prompt

Server calls `getAgentJourney(journeyId)` before the AI call and injects the full journey state (with blockIds + navigationMap) into the system prompt. This is faster than a tool call (no round-trip), 100% reliable (AI always has current state), and costs ~5-10K tokens (acceptable for Claude/Gemini).

### Two-phase loop: AI plans, server executes

1. **Plan phase**: AI reads journey state (from system prompt), calls `submit_plan` tool with structured operations list
2. **Execute phase**: Server iterates plan operations and executes each directly (no AI in the loop) — fast, cheap, reliable

AI only re-enters via conversation if something fails ("retry" or "fix the error").

### Server-driven execution rationale

Both approaches show the same real-time visuals (card shimmer, progress updates, plan card). Server-driven execution completes in ~0.5s total vs ~15s for AI-driven (3-5s per operation). The plan descriptions provide operation-level context without AI narration.

### Streaming via GraphQL SSE Subscription

The `journeyAiTranslateCreateSubscription` pattern (`apis/api-journeys-modern/src/schema/journeyAiTranslate/journeyAiTranslate.ts`) already handles streaming over SSE. We adopt the same pattern: a `subscribe` async generator that `yield`s `JourneyAiChatMessage` objects.

Use `streamText` (not `generateText`) with tools for the plan phase to stream Claude's text word-by-word to the user.

### Snapshot-based undo (per-turn checkpoints)

At the start of each agent turn, snapshot the current `JourneySimple` server-side (keyed by `turnId`, TTL 1 hour via Redis). Keys: `undo:${turnId}`, value: JSON-serialized snapshot, TTL: 1 hour via `EX 3600`. This survives pod restarts and works across replicas. Uses the existing Redis connection (`libs/yoga/src/redis/connection.ts`).

**Undo UX: hover-to-reveal on user message bubble**

Each user message that triggered AI changes shows a small undo icon (↩) at the bottom-right corner of the message bubble on hover. This keeps undo contextual — tied directly to the request that caused the change, acting as a per-turn checkpoint.

- **Hover state**: Small gray pill with undo icon appears at bottom-right corner of the user's chat bubble
- **Click**: Opens an inline confirmation below the AI response with:
  - Warning icon + "Revert all changes from this turn?"
  - Contextual description of what will be undone (e.g. "This will remove the email input from 'How did you hear?' and undo the navigation change")
  - "Yes, revert" (destructive red) + "Cancel" buttons
- **Confirmed**: `journeyAiChatUndoMutation(turnId)` restores the pre-turn snapshot via `updateSimpleJourney`
- Each completed turn is an independent checkpoint with its own undo
- Multiple turns = multiple undo points (not just the most recent)
- Undoing a past turn that has subsequent turns shows a warning: "This will also revert all later changes"
- TTL: 1 hour via Redis (`EX 3600`)

### Conversation history: ephemeral, client-managed

Chat history lives in React state only — lost on page refresh. Client sends full `history` array with each subscription call. Server is stateless (no stored conversations).

**History validation:** Server validates each history entry before passing to the AI:
- Only `user` and `assistant` roles accepted (reject `system` role from client)
- Each message content limited to 8000 characters
- Total history limited to 50 entries
- Strip any entries with unexpected structure

When history exceeds ~20 messages, server auto-summarizes older messages using the SAME model tier the user is on (free tier users get Gemini Flash for summarization, premium users get their Claude key), keeping the last 16 messages in full. This avoids introducing a third model dependency. Bounds context to ~52K tokens max.

### Risk-based confirmation (not count-based)

- `generate_journey` (full replacement) → **always confirm**
- `delete_card` × >3 → **confirm**
- Everything else (add, update, reorder) → **never confirm**, even 20+ operations

**Server-derived confirmation:** The `requiresConfirmation` flag is computed server-side from the operations list, not set by the AI:
```typescript
const requiresConfirmation = plan.operations.some(o => o.tool === 'generate_journey')
  || plan.operations.filter(o => o.tool === 'delete_card').length > 3
```
`requiresConfirmation` is not a parameter of the `submit_plan` tool.

---

## Architecture Diagram

```
┌─── journeys-admin (Next.js) ───────────────────────────────────────────┐
│                                                                         │
│  /journeys/[id]          (existing manual editor — unchanged)          │
│  /journeys/[id]/ai-chat  (NEW AI editor)                               │
│                                                                         │
│  ┌── AiEditor ────────────────────────────────────────────────────┐    │
│  │  AiEditorToolbar  [← Edit Manually]  [Title]  [■ Stop]        │    │
│  │                                                                 │    │
│  │  ┌─ AiJourneyFlow (60%) ─────┐  ┌─ AiChatPanel (40%) ───────┐ │    │
│  │  │  React Flow — view-only   │  │  Message history           │ │    │
│  │  │  Full card previews at    │  │  Starter suggestion chips  │ │    │
│  │  │  0.55 scale with scroll   │  │  AI: I'll add a poll...    │ │    │
│  │  │  Labeled edges            │  │  PlanCard with progress    │ │    │
│  │  │  Cards shimmer + spinner  │  │  [Undo all]                │ │    │
│  │  │  Auto-pans to active card │  │  [Your message...] [Send]  │ │    │
│  │  └───────────────────────────┘  └────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
           │ GraphQL SSE subscription
           ▼
┌─── api-journeys-modern (GraphQL Yoga) ──────────────────────────────────┐
│                                                                          │
│  journeyAiChatCreateSubscription(journeyId, message, history, turnId?,  │
│         contextCardId?, preferredTier?)                                    │
│         │                                                                │
│         ▼                                                                │
│  ┌── Two-phase Loop ─────────────────────────────────────────────┐      │
│  │  model: user.anthropicKey ? claude-sonnet-4-6 : gemini-2.5-flash│    │
│  │                                                                  │    │
│  │  PHASE 1 (Plan — AI call with streamText):                      │    │
│  │    Journey state injected into system prompt                     │    │
│  │    AI streams text + calls submit_plan tool                      │    │
│  │    yield { type: 'plan', operations[], requiresConfirmation }    │    │
│  │                                                                  │    │
│  │  PHASE 2 (Execute — server-driven, no AI):                      │    │
│  │    For each operation:                                           │    │
│  │      yield { type: 'plan_progress', operationId, 'running' }    │    │
│  │      Execute operation via Prisma                                │    │
│  │      yield { type: 'plan_progress', operationId, 'done'/'failed'}│   │
│  │    Post-execution: validate_journey, include result in done msg  │    │
│  │                                                                  │    │
│  │  AI Tools: search_images, submit_plan                             │    │
│  │  Server ops: generate_journey, create_card, delete_card,         │    │
│  │    update_card, add_block, update_block, delete_block,           │    │
│  │    reorder_cards, update_journey_settings, translate             │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0: Redesign `JourneySimple` for Full Block Coverage

**Goal:** `JourneySimple` currently covers about half the block system. An AI agent asked to "add a text input" or "add a multiselect" will silently fail because those block types don't exist in the schema. This phase redesigns the schema to cover every addable block type, fix structural problems that cause hallucinations, and make navigation errors impossible to miss.

**Files to modify:**
- `libs/shared/ai/src/journeySimpleTypes.ts` — full rewrite
- `apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.ts` — full rewrite
- `apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.ts` — full rewrite
- `apis/api-journeys-modern/src/schema/journey/simple/getSimpleJourney.spec.ts`
- `apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.spec.ts`
- `apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.spec.ts`
- `libs/shared/ai/src/journeySimpleTypes.spec.ts`

---

#### Current coverage gaps

The 8 block types a creator can add via the editor's AddBlock panel vs what `JourneySimple` supports today:

| Block | Addable in editor | In JourneySimple |
|---|---|---|
| TypographyBlock | ✅ | ⚠️ h3 + body1 only — 10 other variants ignored |
| ButtonBlock | ✅ | ⚠️ label + navigate/url only — Email/Chat/Phone actions missing |
| ImageBlock | ✅ | ⚠️ present but width/height/blurhash required (hallucination pressure) |
| VideoBlock | ✅ | ⚠️ YouTube only — Mux/Cloudflare sources ignored |
| RadioQuestionBlock | ✅ | ⚠️ present but gridView and poll option images missing |
| MultiselectBlock | ✅ | ❌ missing entirely |
| TextResponseBlock | ✅ | ❌ missing entirely |
| SpacerBlock | ✅ | ❌ missing entirely |

Additionally, the flat-field structure (`heading`, `text`, `button`) prevents multiple instances of the same block type on one card and loses ordering information.

Note: `SignUpBlock` has a directory in AddBlock but is **not rendered** in the AddBlock panel. Excluded from scope.

---

#### New schema: `content` array with discriminated union

Replace the flat card fields with an ordered `content: JourneySimpleBlock[]` array. Each element has a `type` discriminator.

```typescript
// libs/shared/ai/src/journeySimpleTypes.ts

// --- Actions ---
export const journeySimpleActionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('navigate'),
    cardId: z.string().describe('The id of the card to navigate to.')
  }),
  z.object({
    kind: z.literal('url'),
    url: z.string().url().refine(
      u => u.startsWith('https://') || u.startsWith('http://'),
      'Only https:// and http:// URLs are allowed'
    ).describe('A URL to open in the browser.')
  }),
  z.object({
    kind: z.literal('email'),
    email: z.string().email().describe('An email address to open in the mail client.')
  }),
  z.object({
    kind: z.literal('chat'),
    chatUrl: z.string().url().refine(
      u => u.startsWith('https://') || u.startsWith('http://'),
      'Only https:// and http:// URLs are allowed'
    ).describe('A WhatsApp or chat URL.')
  }),
  z.object({
    kind: z.literal('phone'),
    phone: z.string(),
    countryCode: z.string().optional(),
    contactAction: z.enum(['call', 'text']).optional()
  })
])

// --- Content Blocks (discriminated union) ---
export const journeySimpleBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    text: z.string(),
    variant: z.enum(['h1','h2','h3','h4','h5','h6']).optional().default('h3')
  }),
  z.object({
    type: z.literal('text'),
    text: z.string(),
    variant: z.enum(['body1','body2','subtitle1','subtitle2','caption','overline']).optional().default('body1')
  }),
  z.object({
    type: z.literal('button'),
    text: z.string().describe('Label displayed on the button.'),
    action: journeySimpleActionSchema
  }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    alt: z.string(),
    width: z.number().int().nonnegative().optional().describe('Omit — server computes from URL.'),
    height: z.number().int().nonnegative().optional().describe('Omit — server computes from URL.'),
    blurhash: z.string().optional().describe('Omit — server computes from URL.')
  }),
  z.object({
    type: z.literal('video'),
    url: z.string().describe('YouTube URL.'),
    startAt: z.number().int().nonnegative().optional(),
    endAt: z.number().int().positive().optional()
  }),
  z.object({
    type: z.literal('poll'),
    gridView: z.boolean().optional().default(false),
    options: z.array(z.object({
      text: z.string(),
      action: journeySimpleActionSchema
    })).min(2)
  }),
  z.object({
    type: z.literal('multiselect'),
    min: z.number().int().nonnegative().optional(),
    max: z.number().int().positive().optional(),
    options: z.array(z.string()).min(2)
  }),
  z.object({
    type: z.literal('textInput'),
    label: z.string(),
    inputType: z.enum(['freeForm','name','email','phone']).optional().default('freeForm'),
    placeholder: z.string().optional(),
    hint: z.string().optional(),
    required: z.boolean().optional().default(false)
  }),
  z.object({
    type: z.literal('spacer'),
    spacing: z.number().int().positive().describe('Vertical spacing in pixels.')
  })
])

// --- Card ---
export const journeySimpleCardSchema = z.object({
  id: z.string().describe(
    'Unique, semantic identifier. Use descriptive names like "card-welcome" or "card-results". Do NOT use positional names like "card-1".'
  ),
  x: z.number().optional().describe('Canvas x position. Omit to auto-layout (index * 300).'),
  y: z.number().optional().describe('Canvas y position. Omit to default to 0.'),
  backgroundColor: z.string().optional().describe('Hex color for the card background e.g. "#1A1A2E".'),
  backgroundImage: journeySimpleImageSchema.optional(),
  backgroundVideo: z.object({
    url: z.string().describe('YouTube URL.'),
    startAt: z.number().int().nonnegative().optional(),
    endAt: z.number().int().positive().optional()
  }).optional(),
  content: z.array(journeySimpleBlockSchema).describe('Ordered array of content blocks on this card.'),
  defaultNextCard: z.string().optional()
})

// --- Journey ---
export const journeySimpleSchema = z.object({
  title: z.string(),
  description: z.string(),
  cards: z.array(journeySimpleCardSchema)
})

// Write schema adds cross-card reference validation + video/background rules
export const journeySimpleSchemaUpdate = journeySimpleSchema.superRefine((data, ctx) => {
  const cardIds = new Set(data.cards.map((c) => c.id))
  for (const card of data.cards) {
    // Cross-card reference validation
    const checkRef = (ref: string | undefined, path: string) => {
      if (ref && !cardIds.has(ref)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cards', data.cards.indexOf(card), path],
          message: `Card "${ref}" does not exist. Valid IDs: ${[...cardIds].join(', ')}`
        })
      }
    }
    checkRef(card.defaultNextCard, 'defaultNextCard')
    for (const block of card.content) {
      if (block.type === 'button' && block.action.kind === 'navigate')
        checkRef(block.action.cardId, 'content[button].action.cardId')
      if (block.type === 'poll')
        block.options.forEach((o, i) => {
          if (o.action.kind === 'navigate')
            checkRef(o.action.cardId, `content[poll].options[${i}].action.cardId`)
        })
    }

    // Video/background rules
    const hasContentVideo = card.content.some(b => b.type === 'video')
    const hasBgImage = card.backgroundImage != null
    const hasBgVideo = card.backgroundVideo != null

    if (hasContentVideo && card.content.length > 1)
      ctx.addIssue({ code: 'custom', message: 'Video content must be the only content block on a card' })
    if (hasContentVideo && (hasBgImage || hasBgVideo))
      ctx.addIssue({ code: 'custom', message: 'Video content cards cannot have background image/video' })
    if (hasBgImage && hasContentVideo)
      ctx.addIssue({ code: 'custom', message: 'Cards with background image cannot have video content' })
    if (hasBgImage && hasBgVideo)
      ctx.addIssue({ code: 'custom', message: 'Card cannot have both backgroundImage and backgroundVideo' })
  }
})
```

---

#### Content-derived card IDs for existing journeys

`simplifyJourney` generates card IDs from card heading/text content (not positional):

```typescript
function generateCardIds(cards: { heading?: string; firstText?: string }[]): string[] {
  const usedIds = new Set<string>()
  return cards.map((card) => {
    const label = card.heading || card.firstText || 'untitled'
    const slug = label.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      .split(/\s+/).slice(0, 4).join('-') || 'untitled'
    let id = `card-${slug}`
    let counter = 2
    while (usedIds.has(id)) { id = `card-${slug}-${counter++}` }
    usedIds.add(id)
    return id
  })
}
```

Handles: no heading (fallback to text → "untitled"), duplicates (suffix -2, -3), special chars (stripped), long headings (first 4 words).

**ID stability for existing cards**: When `simplifyJourney` runs on an existing journey, card IDs are generated from content. However, surgical tools (`update_block`) that change headings must NOT regenerate IDs — they use the stable `blockId` from Prisma. Card `simpleId`s are only generated during `simplifyJourney` (read path) and `updateSimpleJourney` (full replacement). Surgical edits never touch `simpleId`s because they operate on `blockId`s directly.

---

#### Changes to `simplifyJourney.ts`

Rewrite to emit the new `content` array format. Key mappings:

| Prisma block `typename` | `JourneySimpleBlock.type` | Notes |
|---|---|---|
| `TypographyBlock` with `variant: h1-h6` | `heading` | Preserve variant |
| `TypographyBlock` with other variants | `text` | Preserve variant |
| `ButtonBlock` | `button` | Map all 5 action types to `kind` |
| `ImageBlock` (non-cover) | `image` | |
| `VideoBlock` (youTube, non-cover) | `video` | Only YouTube for now |
| `RadioQuestionBlock` + children | `poll` | Assemble options with actions |
| `MultiselectBlock` + children | `multiselect` | Options are `MultiselectOptionBlock.label` (no actions) |
| `TextResponseBlock` | `textInput` | Map Prisma `type` → schema `inputType` |
| `SpacerBlock` | `spacer` | |
| `CardBlock.coverBlockId` → `ImageBlock` | `card.backgroundImage` | Card-level field |
| `CardBlock.coverBlockId` → `VideoBlock` (youTube) | `card.backgroundVideo` | Card-level field |

Sort childBlocks by `parentOrder` (default null to Infinity). Reverse action mapping:

```typescript
function mapActionReverse(action: Action | null): JourneySimpleAction | undefined {
  if (!action) return undefined
  if (action.blockId) return { kind: 'navigate', cardId: resolveCardId(action.blockId) }
  if (action.url)     return { kind: 'url', url: action.url }
  if (action.email)   return { kind: 'email', email: action.email }
  if (action.chatUrl) return { kind: 'chat', chatUrl: action.chatUrl }
  if (action.phone)   return { kind: 'phone', phone: action.phone, countryCode: action.countryCode, contactAction: action.contactAction }
  return undefined
}
```

---

#### Changes to `updateSimpleJourney.ts`

Move all external I/O before the transaction:

```typescript
// 1. [OUTSIDE TX] Pre-process all images (Cloudflare upload + blurhash)
//    processImage: URL validation → conditional Cloudflare upload → blurhash generation
const processedImages = await preProcessAllImages(simple.cards)

// 2. [OUTSIDE TX] Pre-process all videos (YouTube API duration fetch)
const videoMetadata = await preProcessAllVideos(simple.cards)

// 3. Transaction: only DB writes
return prisma.$transaction(async (tx) => {
  // a. Soft-delete all existing blocks
  // b. Update journey title/description
  // c. For each card:
  //    - Create StepBlock (parentOrder = card index, x ?? index * 300, y ?? 0)
  //    - Create CardBlock (parentBlockId = stepBlock.id, parentOrder = 0)
  //    - For each content block (parentOrder = index):
  //      switch (block.type):
  //        'heading'/'text' → TypographyBlock (variant from block)
  //        'button' → ButtonBlock + Action (map all 5 action kinds)
  //        'image' → ImageBlock (from pre-processed map)
  //        'video' → VideoBlock (YouTube only, from pre-processed duration)
  //        'poll' → RadioQuestionBlock + RadioOptionBlock children (each with Action)
  //        'multiselect' → MultiselectBlock + MultiselectOptionBlock children (label only, no actions)
  //        'textInput' → TextResponseBlock (map inputType → Prisma type field)
  //        'spacer' → SpacerBlock (spacing field)
  //    - If backgroundImage: create ImageBlock + set CardBlock.coverBlockId
  //    - If backgroundVideo: create VideoBlock (YouTube, autoplay:true) + set CardBlock.coverBlockId
  //    - Set StepBlock.nextBlockId for defaultNextCard
})
```

Action mapping helper (all 5 kinds):

```typescript
function mapAction(action: JourneySimpleAction, stepBlocks: StepBlockMap) {
  switch (action.kind) {
    case 'navigate': return { blockId: stepBlocks.find(s => s.simpleCardId === action.cardId)?.stepBlockId }
    case 'url':      return { url: action.url }
    case 'email':    return { email: action.email }
    case 'chat':     return { chatUrl: action.chatUrl }
    case 'phone':    return { phone: action.phone, countryCode: action.countryCode, contactAction: action.contactAction }
  }
}
```

---

#### Phase 0 acceptance criteria

- [ ] All 8 addable block types are representable in `JourneySimple`
- [ ] All 5 action types (navigate, url, email, chat, phone) work in buttons and poll options
- [ ] All TypographyBlock variants (h1–h6, body1/2, subtitle1/2, caption, overline) round-trip correctly
- [ ] `backgroundImage` and `backgroundVideo` both work (mutually exclusive via Zod)
- [ ] Video card exclusivity: Zod rejects content arrays with video + other blocks
- [ ] Content-derived card IDs: heading "Welcome!" → `card-welcome`
- [ ] `x`/`y` can be omitted — server defaults to `index * 300, 0`
- [ ] `image.width`, `image.height`, `image.blurhash` can be omitted — server computes from URL
- [ ] A `nextCard`/`cardId` referencing a non-existent card produces a Zod error naming the invalid ID and listing valid IDs
- [ ] MultiselectBlock creates parent + MultiselectOptionBlock children (label only, no actions)
- [ ] TextResponseBlock `inputType` maps to Prisma `type` field correctly
- [ ] `simplifyJourney` produces a `JourneySimple` that `updateSimpleJourney` can ingest without data loss
- [ ] All existing tests updated and passing
- [ ] `nx type-check shared-ai && nx type-check api-journeys-modern` passes
- [ ] `nx build api-journeys-modern` passes

---

### Phase 1: Backend AI Agent

**Goal:** Working `journeyAiChatCreateSubscription` with a complete tool set, two-phase loop (AI plans, server executes), backend safety guards, and tiered model support.

**Files to create/modify:**

- `apis/api-journeys-modern/src/schema/journeyAiChat/journeyAiChat.ts` — subscription + agent loop
- `apis/api-journeys-modern/src/schema/journeyAiChat/getAgentJourney.ts` — read function with blockIds + navigationMap + journey language name
- `apis/api-journeys-modern/src/schema/journeyAiChat/executeOperation.ts` — server-side plan executor
- `apis/api-journeys-modern/src/schema/journeyAiChat/tools/` — one file per tool
- `apis/api-journeys-modern/src/schema/journeyAiChat/systemPrompt.ts`
- `apis/api-journeys-modern/src/schema/journeyAiChat/snapshotStore.ts` — Redis-based snapshot storage with TTL for undo
- `apis/api-journeys-modern/src/schema/journeyAiChat/journeyAiChat.spec.ts`
- `libs/shared/ai/src/agentJourneyTypes.ts` — AgentJourney, PlanOperation, NavigationMap types

#### `AgentJourney` type definition

```typescript
// libs/shared/ai/src/agentJourneyTypes.ts

interface AgentJourney {
  title: string
  description: string
  language: string              // Journey's language name (e.g. "English", "Spanish")
  cards: Array<{
    simpleId: string           // Content-derived ID (e.g. "card-welcome")
    blockId: string            // Prisma StepBlock.id — stable across edits, used by surgical tools
    cardBlockId: string        // Prisma CardBlock.id
    heading?: string           // First heading text (for display)
    content: Array<JourneySimpleBlock & { blockId: string }>  // Each content block includes its Prisma block ID for surgical targeting
    backgroundColor?: string
    backgroundImage?: { src: string; alt: string }
    backgroundVideo?: { url: string }
    defaultNextCard?: string   // simpleId of next card
  }>
  navigationMap: Array<{
    sourceCardId: string       // simpleId
    targetCardId: string       // simpleId
    trigger: 'default' | 'button' | 'poll'
    label?: string             // Button/poll option text
    blockId: string            // The block that owns this navigation
  }>
}
```

The AI references `blockId` for surgical operations (update_block, delete_block), ensuring stable references that don't change when content changes. The `simpleId` is for human-readable references in descriptions.

- `apis/api-journeys-modern/src/env.ts` — add `ANTHROPIC_API_KEY` (optional, for server fallback)
- `package.json` — add `@ai-sdk/anthropic`

---

#### Agent loop implementation

```typescript
subscribe: async function* (_root, { input }, context) {
  // Auth (same pattern as journeyAiTranslate)
  const journey = await prisma.journey.findUnique(...)
  if (!journey) throw new GraphQLError('journey not found')
  if (!ability(Action.Update, subject('Journey', journey), context.user))
    throw new GraphQLError('permission denied')

  // Published journey warning
  if (journey.status === 'published') {
    yield { type: 'warning', text: 'This journey is published and live. Changes will be visible to users immediately.' }
  }

  const abort = new AbortController()
  context.request.signal.addEventListener('abort', () => abort.abort())

  // Snapshot for undo
  const turnId = input.turnId ?? randomUUID()
  const snapshot = await getSimpleJourney(input.journeyId)
  await redis.set(`journeyAiChat:undo:${turnId}`, JSON.stringify({
    snapshot,
    userId: context.user.id,
    journeyId: input.journeyId,
    plan: null
  }), 'EX', 3600)

  // Tiered model selection (supports mid-session switching)
  const userKey = await decryptAnthropicKey(context.user.id)
  const preferFree = input.preferredTier === 'free'
  const model = (userKey && !preferFree)
    ? anthropic('claude-sonnet-4-6', { apiKey: userKey })
    : google('gemini-2.5-flash')

  // Inject journey state into system prompt
  const agentJourney = await getAgentJourney(input.journeyId)
  // Validate contextCardId against actual journey state
  const contextCard = input.contextCardId
    ? agentJourney.cards.find(c => c.simpleId === input.contextCardId)
    : null
  const contextSuffix = contextCard
    ? `\n\nThe user is referring to: "${contextCard.heading ?? 'Untitled'}" card (blockId: ${contextCard.blockId}) — contains ${contextCard.content.length} blocks.`
    : ''
  const fullSystemPrompt = `${preSystemPrompt}\n\n${systemPrompt}\n\n## Current Journey State\n${hardenPrompt(JSON.stringify(agentJourney))}\n\nSummary: ${agentJourney.cards.length} cards, ${countBlocks(agentJourney)} blocks.${contextSuffix}`

  // Condense history if needed (>20 messages)
  const condensedHistory = await condenseHistory(input.history)

  // Phase 1: Plan (AI call with streamText)
  const result = streamText({
    model,
    system: fullSystemPrompt,
    messages: [...condensedHistory, { role: 'user', content: input.message }],
    tools: {
      search_images: { ... },
      // validate_journey runs automatically server-side after execution (not an AI tool)
      submit_plan: {
        description: 'Submit your execution plan',
        parameters: planOperationArraySchema,
        execute: async (args) => args
      }
    },
    maxSteps: 5,
    abortSignal: abort.signal
  })

  // Stream text + tool events to client
  let plan = null
  for await (const event of result.fullStream) {
    switch (event.type) {
      case 'text-delta':
        yield { type: 'text', text: event.textDelta }
        break
      case 'tool-call':
        if (event.toolName === 'submit_plan') plan = event.args
        yield { type: 'tool_call', name: event.toolName, args: JSON.stringify(event.args) }
        break
      case 'tool-result':
        yield { type: 'tool_result', name: event.toolName, summary: summarize(event.result) }
        break
    }
  }

  if (!plan) {
    // AI responded conversationally without planning — that's fine
    yield { type: 'done', journeyUpdated: false, turnId }
    return
  }

  // Server-derived confirmation (not AI-set)
  const requiresConfirmation = plan.operations.some(o => o.tool === 'generate_journey')
    || plan.operations.filter(o => o.tool === 'delete_card').length > 3
  yield { type: 'plan', operations: plan.operations, turnId, requiresConfirmation }

  if (requiresConfirmation) {
    // Store plan for later execution via executePlanId
    snapshotStore.set(turnId, { ...snapshotStore.get(turnId), plan: plan.operations })
    yield { type: 'done', journeyUpdated: false, turnId }
    return
  }

  // Phase 2: Server-driven execution
  let journeyUpdated = false
  for (const op of plan.operations) {
    if (abort.signal.aborted) break
    yield { type: 'plan_progress', operationId: op.id, status: 'running', cardId: op.cardId }
    try {
      await executeOperation(op, input.journeyId, context)
      yield { type: 'plan_progress', operationId: op.id, status: 'done' }
      journeyUpdated = true
    } catch (error) {
      const safeMessage = sanitizeErrorMessage((error as Error).message)
      yield { type: 'plan_progress', operationId: op.id, status: 'failed', error: safeMessage }
      // Log full error server-side
      logger.error('Operation failed', { operationId: op.id, error })
      yield { type: 'text', text: `Failed: ${safeMessage}. You can undo all changes or ask me to retry.` }
      break
    }
  }

  // Post-execution validation
  const validation = journeyUpdated ? await validateJourney(input.journeyId) : null

  yield { type: 'done', journeyUpdated, turnId, validation }
}
```

`sanitizeErrorMessage` strips Prisma table names, connection strings, and stack traces, returning only the user-relevant portion.

---

#### `executeOperation` — server-side plan executor

```typescript
async function executeOperation(op: PlanOperation, journeyId: string, context) {
  switch (op.tool) {
    case 'generate_journey':
      return updateSimpleJourney(journeyId, op.args.simple)
    case 'create_card':
      return createCard(journeyId, op.args)
    case 'delete_card':
      return deleteCard(journeyId, op.args)
    case 'update_card':
      return updateCard(journeyId, op.args)
    case 'add_block':
      return addBlock(journeyId, op.args)
    case 'update_block':
      return updateBlock(journeyId, op.args)
    case 'delete_block':
      return deleteBlock(journeyId, op.args)
    case 'reorder_cards':
      return reorderCards(journeyId, op.args)
    case 'update_journey_settings':
      return updateJourneySettings(journeyId, op.args)
    case 'translate':
      return translateJourney(journeyId, op.args)
  }
}
```

#### Surgical tool specifications

**`create_card`**: Creates StepBlock + CardBlock. If `insertAfterCard` is specified, rewires the source card's `nextBlockId` to the new card, and sets the new card's `nextBlockId` to what was previously the source's next. Assigns `parentOrder` = insert position, shifts subsequent cards' parentOrder +1.

**`delete_card`**: Soft-deletes StepBlock + CardBlock + all child blocks (`deletedAt = now()`). If `redirectTo` is specified, finds all blocks navigating to the deleted card and rewires them to the redirect target. If no redirect, removes the navigation actions pointing to this card.

**`update_card`**: Updates CardBlock properties (backgroundColor, backgroundImage, backgroundVideo) and/or StepBlock properties (x, y, nextBlockId for defaultNextCard). Does NOT touch content blocks — use `update_block` for that.

**`add_block`**: Creates a new block under the specified card's CardBlock. Sets `parentOrder` = insert position (default: end). Shifts subsequent blocks' parentOrder +1. For images: pre-processes via Cloudflare upload + blurhash BEFORE the write (same pattern as `updateSimpleJourney`). For polls: creates parent RadioQuestionBlock + child RadioOptionBlocks.

**`update_block`**: Updates properties of an existing block by `blockId`. For TypographyBlock: content, variant. For ButtonBlock: label, action. For RadioOptionBlock: label, action. For ImageBlock: src (triggers re-upload + blurhash). For TextResponseBlock: label, placeholder, hint, type.

**`delete_block`**: Soft-deletes a block by `blockId` (`deletedAt = now()`). Shifts subsequent siblings' parentOrder -1. If the block had navigation actions, those edges are removed.

**`reorder_cards`**: Takes an ordered array of `blockId`s. Updates each StepBlock's `parentOrder` to match the new order. Updates `x` positions based on new order (`index * 300`).

**`update_journey_settings`**: Updates Journey-level fields: title, description.

All surgical tools validate that the target `blockId` exists and belongs to the specified journey before operating.

---

#### `PlanOperation` schema (discriminated union by tool)

```typescript
const planOperationSchema = z.discriminatedUnion('tool', [
  z.object({ id: z.string(), description: z.string(), tool: z.literal('generate_journey'), cardId: z.string().optional(), args: z.object({ simple: journeySimpleSchema }) }),
  z.object({ id: z.string(), description: z.string(), tool: z.literal('create_card'), cardId: z.string().optional(), args: z.object({ card: journeySimpleCardSchema, insertAfterCard: z.string().optional() }) }),
  z.object({ id: z.string(), description: z.string(), tool: z.literal('delete_card'), cardId: z.string().optional(), args: z.object({ cardId: z.string(), redirectTo: z.string().optional() }) }),
  z.object({ id: z.string(), description: z.string(), tool: z.literal('translate'), cardId: z.string().optional(), args: z.object({ targetLanguage: z.string(), cardIds: z.array(z.string()).optional() }) }),
  // ... etc for each tool
])
```

---

#### System prompt highlights

- Role: "You are an AI journey editor for non-technical creators."
- Always Plan before Execute — never skip the planning phase
- Use `generate_journey` for creation/large rewrites; surgical tools for targeted edits
- Always call `search_images` before adding any image — never invent URLs
- `validate_journey` runs automatically server-side after execution completes (not as an AI tool). Results are included in the `done` message.
- Card IDs must be semantic: `card-welcome`, not `card-1`
- blockIds (from system prompt journey state) are stable — use them for update/delete
- If the journey has 0 cards, always use `generate_journey` — never use `create_card` for building from scratch
- When creating new cards via `create_card`, ensure the card ID doesn't collide with existing IDs
- Every non-video card needs at least one navigation path
- Max 20 cards per journey
- Include a complete 2-3 card example journey in the prompt
- Include the journey's language in the system prompt: "This journey's content is in {language}. Respond and generate content in the same language unless the user communicates differently."
- Conciseness: simple edits (1-3 ops) = 1-2 sentences. Complex edits = brief explanation.
- Operation `description` fields must be written for non-technical users. Reference cards by their heading text (e.g. "the Welcome card"), not by ID. Describe what changes in plain English. Never expose block type names, field names, or card IDs.
- If the journey is published, warn the user in the first response that changes are live

---

#### Backend safety

**1. Snapshot per turn for undo** — Redis-based storage with TTL 1 hour (keys: `undo:${turnId}`, value: JSON-serialized snapshot, `EX 3600`). Uses the existing Redis connection (`libs/yoga/src/redis/connection.ts`). For confirmation flow: stores snapshot + plan together. TTL: 30 minutes. Undo mutation:

```typescript
builder.mutationField('journeyAiChatUndo', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Boolean',
    args: {
      turnId: t.arg.string({ required: true }),
      journeyId: t.arg.string({ required: true })
    },
    resolve: async (_root, { turnId, journeyId }, context) => {
      // Auth check
      const journey = await prisma.journey.findUnique({ where: { id: journeyId } })
      if (!journey) throw new GraphQLError('journey not found')
      if (!ability(Action.Update, subject('Journey', journey), context.user))
        throw new GraphQLError('permission denied')

      const entry = snapshotStore.get(turnId)
      if (!entry) throw new GraphQLError('Snapshot expired')

      // Verify snapshot belongs to this journey
      if (entry.journeyId !== journeyId)
        throw new GraphQLError('Snapshot does not match journey')

      await updateSimpleJourney(journeyId, entry.snapshot)
      snapshotStore.delete(turnId)
      return true
    }
  })
)
```

**Confirmation flow — `journeyAiChatExecutePlan` mutation**:

When `requiresConfirmation` is true, the client shows Execute/Cancel. Execute calls this mutation. Cancel calls `journeyAiChatUndo`.

```typescript
builder.mutationField('journeyAiChatExecutePlan', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Boolean',
    args: { turnId: t.arg.string({ required: true }), journeyId: t.arg.string({ required: true }) },
    resolve: async (_root, { turnId, journeyId }, context) => {
      // Auth check
      const journey = await prisma.journey.findUnique({ where: { id: journeyId } })
      if (!journey) throw new GraphQLError('journey not found')
      if (!ability(Action.Update, subject('Journey', journey), context.user))
        throw new GraphQLError('permission denied')

      const entry = snapshotStore.get(turnId)
      if (!entry?.plan) throw new GraphQLError('Plan expired or not found')
      for (const op of entry.plan) {
        await executeOperation(op, journeyId, context)
      }
      snapshotStore.set(turnId, { ...entry, plan: undefined }) // Clear plan, keep snapshot for undo
      return true
    }
  })
)
```

**2. Abort on SSE disconnect** — `context.request.signal` → `AbortController` → `abortSignal` in AI SDK calls + checked before each operation in execution loop.

**3. Optimistic lock via `updatedAt` comparison** — The `expectedUpdatedAt` is captured once before the execution loop begins. If a non-plan write occurred between snapshot creation and first operation, the lock catches it. Once execution starts, the plan owns the journey — its own writes naturally update `updatedAt`. The lock is plan-scoped, not operation-scoped. Implementation: add a `WHERE updatedAt = expectedUpdatedAt` clause to the first Prisma update, catching `RecordNotFound` errors as conflict signals. This uses the existing `updatedAt` field — no schema changes needed.

**4. I/O outside transaction** — Image upload, YouTube API calls happen before `prisma.$transaction`.

**5. Conversation history summarization** — When history > 20 messages, server summarizes older messages using the same model tier the user is on (Gemini Flash for free tier, user's Claude key for premium). Keeps last 16 in full.

---

#### User API key management (BYOK Claude)

```prisma
model UserApiKey {
  userId                   String   @id
  anthropicApiKeyEncrypted String
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
  user                     User     @relation(fields: [userId], references: [id])
}
```

- Key encrypted with AES-256-GCM via GCP KMS envelope encryption
- Stored in Prisma, never exposed to browser JavaScript (immune to XSS)
- Decrypted server-side for each AI call
- User enters key in AI editor settings modal, validated with test API call

---

### Phase 2: AI Editor Frontend

**Goal:** New `/journeys/[id]/ai-chat` route with full card preview canvas and live agent activity states.

#### Route

```
apps/journeys-admin/pages/journeys/[journeyId]/ai-chat.tsx
```

Needs `getServerSideProps` for auth + journey data fetch (adapt from `pages/journeys/[journeyId].tsx`).

Navigated to from:
- "✨ AI Editor" button in the existing editor's Toolbar (next to PreviewItem)
- "Create with AI" on the journey list (Phase 3)

#### Layout

```
pages/journeys/[journeyId]/ai-chat.tsx
  └─ JourneyProvider (journey data, variant: 'admin')
     └─ EditorProvider (steps, selectedStep — reused for canvas data)
        └─ CommandProvider (undo/redo)
           └─ AiEditor.tsx
              ├─ AiEditorToolbar
              │   ├─ BackButton ("← Edit Manually" → /journeys/[id])
              │   ├─ JourneyTitle
              │   └─ StopButton (visible when AI is active)
              └─ Box (display: flex)
                 ├─ AiJourneyFlow (flex: 3)
                 │   └─ ReactFlow
                 │       nodeTypes: { StepBlock: AiCardPreviewNode, ... }
                 │       edgeTypes: { Custom: AiViewEdge, Start: StartEdge }
                 │       nodesDraggable={false}, nodesConnectable={false}, fitView
                 └─ AiChatPanel (flex: 2)
                     ├─ MessageList (auto-scroll)
                     │   ├─ MessageBubble (user/AI text)
                     │   ├─ ToolCallCard (tool progress)
                     │   ├─ PlanCard (operations + status + Undo)
                     │   └─ StarterSuggestions (chips, shown when empty)
                     ├─ ModelIndicator ("AI-powered · Use your own Claude key →")
                     └─ ChatInput (textarea + Send/Stop toggle)
```

#### AiCardPreviewNode — full card preview with scrolling

```typescript
const CARD_PREVIEW_SCALE = 0.55
const NODE_WIDTH = Math.round(CARD_WIDTH * CARD_PREVIEW_SCALE)  // ≈ 178px

function AiCardPreviewNode({ data }) {
  return (
    <Box sx={{ width: NODE_WIDTH, borderRadius: 2, overflow: 'hidden', boxShadow: 3, position: 'relative' }}>
      {/* Scrollable wrapper — captures wheel before React Flow */}
      <Box
        sx={{ maxHeight: 400, overflowY: 'auto', overflowX: 'hidden' }}
        onWheelCapture={(e) => e.stopPropagation()}
      >
        {/* Scaled content in provider context — blocks not clickable */}
        <ThemeProvider theme={journeyTheme}>
          <JourneyProvider value={{ journey, variant: 'embed' }}>
            <Box sx={{ width: CARD_WIDTH, transformOrigin: 'top left', transform: `scale(${CARD_PREVIEW_SCALE})`, pointerEvents: 'none' }}>
              <BlockRenderer block={data.step} />
            </Box>
          </JourneyProvider>
        </ThemeProvider>
      </Box>

      {/* AI editing overlay */}
      {data.isBeingEdited && (
        <>
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'primary.main', opacity: 0.12,
                     animation: 'aiEditPulse 1.2s ease-in-out infinite', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'primary.main',
                     borderRadius: '50%', width: 22, height: 22, display: 'flex',
                     alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={14} sx={{ color: 'white' }} />
          </Box>
        </>
      )}
    </Box>
  )
}
```

BlockRenderer needs `ThemeProvider` + `JourneyProvider` wrapping inside React Flow nodes. Use `variant: 'embed'` to suppress editor-mode behaviors.

#### Edge labels and visual distinction

Edges in the AI editor canvas use three visually distinct styles based on connection type:

| Edge type | Source position | Line style | Color | Label format |
|---|---|---|---|---|
| **Default next** | Card right edge, vertical center | Solid | `#6D6D7D80` (gray, 50%) | Arrow icon + "Default" |
| **Button action** | Card right edge, vertical center | Solid | `#6D6D7D30` (light gray) | Click icon + button label text |
| **Poll/radio option** | Card right edge, spaced vertically per option | Solid | `#4c9bf880` (blue-tinted) | Branch icon + option label text |

All edges include:
- **Source handle**: 8px circle with white fill and colored border, flush with card right edge
- **Target handle**: Single centered handle on card left edge (all incoming edges converge)
- **Arrow marker**: Small triangle at the target end
- **Label chip**: White pill with 1px border, floating above the line midpoint — contains an icon + text

For poll/radio options, each option gets its own source handle at a different Y position on the card's right edge (evenly distributed), ensuring edges don't overlap when fanning out to different target cards.

`AiViewEdge` renders the label chip via React Flow's `EdgeLabelRenderer`. The `transformSteps` utility receives `options.labelEdges = true` to populate `edge.data.label` and `edge.data.edgeType` ('default' | 'button' | 'poll') for styling.

File: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/libs/transformSteps/transformSteps.ts`

#### Card selection as context

Users can click a card on the canvas to select it as context for their next message. Selected cards show a primary-colored border with a glow shadow. The chat input displays a dismissible context pill showing the card's heading (e.g. `card-question ×`). When sent, the context card ID is included in the subscription input so the AI knows which card the user is referring to.

```typescript
// Subscription input addition
type JourneyAiChatInput = {
  // ...existing fields
  contextCardId?: string  // Selected card ID — included in system prompt as "The user is referring to this card"
}
```

The context pill appears above the text input area inside the input field. Clicking × or pressing Escape deselects the card. Selecting a different card replaces the current context.

**Input validation:**
- `input.message` limited to 4000 characters
- `maxTokens` set on `streamText` call: 4096 for text generation
- `input.history` entries each limited to 8000 characters

#### Canvas auto-pan during execution

```typescript
if (msg.type === 'plan_progress' && msg.status === 'running' && msg.cardId) {
  const node = reactFlowInstance.getNode(msg.cardId)
  if (node) reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 0.8, duration: 400 })
}
```

#### Canvas layout for branching flows

Linear journeys (A → B → C) are trivial to lay out. Branching journeys — where a poll or multiple buttons fan out to different cards — need a layout algorithm.

**Layout strategy: dagre auto-layout**

Use `@dagrejs/dagre` (already used by React Flow examples) for directed graph layout:

```typescript
import dagre from '@dagrejs/dagre'

function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 40 })

  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach((edge) => g.setEdge(edge.source, edge.target))

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    return { ...node, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } }
  })
}
```

- `rankdir: 'LR'` — left-to-right flow matching existing editor convention
- `ranksep: 120` — horizontal gap between columns (accounts for edge labels)
- `nodesep: 40` — vertical gap between cards in the same column (branching targets)

Re-layout is triggered after every AI execution turn completes (when the canvas re-renders with updated data).

**Source handles for multiple outgoing edges**

`AiCardPreviewNode` renders small source handle dots on the right edge of the card, spaced vertically — one per outgoing connection:

```typescript
const sourceHandles = outgoingEdges.map((edge, i) => {
  const yOffset = ((i + 1) / (outgoingEdges.length + 1)) * NODE_HEIGHT
  return (
    <Handle
      key={edge.id}
      type="source"
      position={Position.Right}
      id={edge.sourceHandle}
      style={{ top: yOffset }}
    />
  )
})
```

This ensures edges exit at different Y positions and don't overlap.

**Edge paths for branching**

Use React Flow's `BezierEdge` (default) for non-horizontal connections. When source and target Y positions differ by more than 20px, the bezier curve provides a clean visual path. For near-horizontal connections, the curve degrades gracefully to near-straight.

**Target handle**: Single centered handle on the left edge of each card (all incoming edges converge to one point).

#### Subscription hook

```typescript
function useJourneyAiChatSubscription() {
  const [messages, setMessages] = useState<JourneyAiChatMessage[]>([])
  const [activeCardIds, setActiveCardIds] = useState<Set<string>>(new Set())
  const [subscriptionInput, setSubscriptionInput] = useState<Input | null>(null)
  const client = useApolloClient()

  useSubscription(JOURNEY_AI_CHAT_SUBSCRIPTION, {
    skip: subscriptionInput == null,
    variables: { input: subscriptionInput! },
    onData: ({ data }) => {
      const msg = data.data?.journeyAiChatCreateSubscription
      if (!msg) return

      // Coalesce text deltas into single message
      if (msg.type === 'text') {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.type === 'text' && last?.role === 'assistant')
            return [...prev.slice(0, -1), { ...last, text: last.text + msg.text }]
          return [...prev, { ...msg, role: 'assistant' }]
        })
      } else {
        setMessages(prev => [...prev, msg])
      }

      // Track active card IDs
      if (msg.type === 'plan_progress' && msg.cardId) {
        if (msg.status === 'running') setActiveCardIds(prev => new Set([...prev, msg.cardId]))
        else setActiveCardIds(prev => { const n = new Set(prev); n.delete(msg.cardId); return n })
      }

      // Refetch on done
      if (msg.type === 'done' && msg.journeyUpdated) {
        client.query({ query: GET_ADMIN_JOURNEY, variables: { id: journeyId }, fetchPolicy: 'network-only' })
      }
      if (msg.type === 'done') setSubscriptionInput(null)
    }
  })

  return { messages, activeCardIds, send: setSubscriptionInput, isActive: subscriptionInput != null }
}
```

#### Stop button

Chat input shows [■ Stop] button while AI is active, replacing [Send ↵]:

```typescript
{isActive
  ? <Button color="error" onClick={() => { subscription.unsubscribe(); setSubscriptionInput(null) }}>■ Stop</Button>
  : <Button onClick={() => send(input)}>Send ↵</Button>
}
```

#### Files to create (Phase 2)

| File | Purpose |
|------|---------|
| `pages/journeys/[journeyId]/ai-chat.tsx` | Page route |
| `src/components/AiEditor/AiEditor.tsx` | Main layout |
| `src/components/AiEditor/AiEditorToolbar/AiEditorToolbar.tsx` | Top bar |
| `src/components/AiEditor/AiJourneyFlow/AiJourneyFlow.tsx` | React Flow canvas |
| `src/components/AiEditor/AiJourneyFlow/nodes/AiCardPreviewNode/AiCardPreviewNode.tsx` | Full card preview node |
| `src/components/AiEditor/AiJourneyFlow/edges/AiViewEdge/AiViewEdge.tsx` | Labeled edge |
| `src/components/AiEditor/AiChatPanel/AiChatPanel.tsx` | Chat panel |
| `src/components/AiEditor/AiChatPanel/MessageBubble/MessageBubble.tsx` | Message display |
| `src/components/AiEditor/AiChatPanel/PlanCard/PlanCard.tsx` | Plan operations display |
| `src/components/AiEditor/AiChatPanel/ToolCallCard/ToolCallCard.tsx` | Tool progress display |
| `src/components/AiEditor/AiChatPanel/StarterSuggestions/StarterSuggestions.tsx` | Initial suggestion chips |
| `src/libs/useJourneyAiChatSubscription/useJourneyAiChatSubscription.ts` | Subscription hook |
| `src/components/AiEditor/AiJourneyFlow/libs/layoutNodes/layoutNodes.ts` | Dagre auto-layout for branching |
| `src/components/Editor/Toolbar/Items/AIEditorItem/AIEditorItem.tsx` | Toolbar button |

All paths relative to `apps/journeys-admin/`.

Modified (minimal):
- `apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx` — add AIEditorItem between Items and PreviewItem
- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/libs/transformSteps/transformSteps.ts` — add optional `labelEdges` parameter

---

### Phase 3: Extended AI Capabilities

**3a: Theme/Appearance Tool** — Add `update_journey_theme` tool to the agent.

**3b: AI Image Search Tool** — Extract `searchUnsplashPhotos` from `apis/api-media/src/schema/unsplash/service.ts` to shared NX lib (`libs/shared/unsplash/`). Importable by both api-media and api-journeys-modern.

**Phase 1 workaround**: Until `searchUnsplashPhotos` is extracted to a shared lib (Phase 3b), the `search_images` AI tool calls the Unsplash API directly using the existing `UNSPLASH_ACCESS_KEY` environment variable. This is a direct HTTP call (no shared lib needed), duplicating ~20 lines from `api-media`. Extracted to shared lib in Phase 3b.

`search_images` accepts a `queries: string[]` parameter (up to 5 queries) and returns results grouped by query. This lets the AI search for multiple card images in a single tool call, staying within `maxSteps`.

**3c: Journey Creation Entry Point** — "Create with AI" button on journey list page:
1. Creates empty journey via `journeyCreate`
2. Navigates directly to `/journeys/[id]/ai-chat`
3. Chat panel opens with pre-filled prompt: "Let's build your journey. What's the goal?"

---

### Phase 4: MCP Server (DEFERRED — post-MVP)

External agents can create and edit journeys via MCP, authenticating with their existing journeys account. Deferred due to OAuth 2.0 + Firebase delegation complexity. Architecturally independent of Phases 0-2.

---

## User Flow

### Entry Point 1: Existing editor → AI Editor
```
Journey List (/) → Click journey card → /journeys/[journeyId] (editor)
  → Toolbar: [...existing...] [✨ AI Editor] [Preview]
    → /journeys/[journeyId]/ai-chat
      → AiEditor: canvas (left 60%) + chat panel (right 40%)
      → Chat shows starter suggestion chips based on journey state
      → "← Edit Manually" returns to /journeys/[journeyId]
```

### Entry Point 2: Create with AI (Phase 3c)
```
Journey List (/) → "Create with AI" button
  → journeyCreate mutation (empty journey with defaults)
    → /journeys/[newJourneyId]/ai-chat
      → Chat pre-filled: "Let's build your journey. What's the goal?"
```

### Chat interaction flow
```
User types message → Send
  → SSE subscription starts
    → "Thinking..." indicator shown immediately
    → Phase 1 (Plan): AI text streams word-by-word
      → Tool call cards appear ("Searching images...")
      → Plan card appears with operations list
    → Phase 2 (Execute): Server runs each operation
      → Cards shimmer on canvas (auto-pans to active card)
      → Plan card updates: ⏸ pending → 🔄 running → ✅ done / ❌ failed
    → Done: canvas re-renders via Apollo refetch
    → Post-execution validation result shown if issues found
  → User can: type another message, click "Undo all", click "■ Stop", or switch to manual editor
```

---

## UX Polish

- **First-time tooltip** on "✨ AI Editor" button: "Describe changes in plain English — AI builds them for you"
- **Model indicator** in chat panel: "AI-powered · Use your own Claude key →" (not technical model names)
- **"Thinking..." animated indicator** before text starts streaming
- **Canvas auto-pans** to the card being edited during execution
- **"Edit Manually" navigation guard**:
  - If AI is actively streaming or executing: block navigation, show confirmation: "AI is still working. Stop and switch to manual editing?"
  - If conversation has messages (chat history exists): show confirmation: "Switch to manual editing? Your chat history and undo points will be cleared."
  - If chat is empty (no messages sent): navigate immediately, no confirmation
  - On confirm: abort any active subscription, navigate to `/journeys/[id]`, show "Changes saved" toast (Snackbar, auto-dismiss 2s)
- **Empty state after refresh or return**: "Start a new conversation. Your previous changes are already saved in the journey." + starter suggestion chips. Previous undo points are no longer accessible.
- **Error boundary** around AiEditor with "Something went wrong" fallback + "Back to Editor" link

---

## System-Wide Impact

### Interaction Graph

```
User message
  → journeyAiChatCreateSubscription
    → Phase 1: getAgentJourney → inject into system prompt → streamText with tools
    → AI calls submit_plan → yield { type: 'plan', operations[] }
    → Phase 2: server executes each operation via Prisma
        yield plan_progress 'running' / 'done' / 'failed'
    → validate_journey (post-execution)
    → yield { type: 'done', turnId, validation }
  → Client: apolloClient.query GET_ADMIN_JOURNEY (network-only)
  → AiJourneyFlow re-renders with updated BlockRenderer previews
```

### Error & Failure Propagation

- **AI API timeout/error**: Caught in subscription handler, yields `{ type: 'error' }`, ends gracefully
- **Step failure during execution**: `plan_progress(operationId, 'failed', error)` + text explanation + `done`. Snapshot valid for undo.
- **`updateSimpleJourney` Zod validation failure**: Thrown inside `executeOperation`. Plan card shows ❌ failed.
- **Auth failure**: `ForbiddenError` before subscription starts. Chat panel shows error state.
- **Optimistic lock conflict** (`CONFLICT`): Plan card shows ❌ failed. Client refreshes before next turn.
- **SSE disconnect / Stop button**: AbortController stops new operations. Completed steps remain applied. Snapshot valid for undo.
- **Upstream API rate limit (429)**: Catch 429 responses from Gemini or Anthropic APIs. For free tier (Gemini): show "AI service temporarily unavailable — try again shortly." For BYOK Claude: extract `retry-after` header from Anthropic's response, show "Your Claude API rate limit reached — resets in X minutes" with option to switch to manual editing. **Concurrent subscription limit:** Only 1 active subscription per user at a time. Starting a new subscription while one is active aborts the previous one. This prevents tab-spam abuse without restricting normal usage. No per-hour message caps — Google's own quotas apply for the free tier, and Anthropic's limits apply for BYOK. Upstream 429 responses are caught and surfaced to the user.
- **Confirmation timeout** (plan stored server-side but not executed): Plan expires after 30 min. Error message shown.
- **Navigation during active AI operation**: "Edit Manually" click during streaming/execution shows confirmation dialog. On confirm: AbortController stops the subscription, completed operations persist, remaining are cancelled. User sees partial changes in manual editor.
- **Invalid user API key**: Test call fails during key setup. Error shown in settings modal.

### Integration Test Scenarios

1. **Create from scratch**: Send "Build a 3-card welcome flow" → `journeySimpleGet` returns 3 cards, each with valid navigation
2. **Edit existing journey**: "Add a poll to the second card" → card gains poll blocks, other cards unchanged
3. **Plan mode with confirmation**: "Delete all 8 cards and rebuild" → plan shown with `requiresConfirmation: true`, Execute clicked → full replacement
4. **Mid-plan failure recovery**: AI plans 4 operations; step 3 fails → 2 ✅ + 1 ❌ + 1 ⏸; user undoes → pre-turn snapshot restored
5. **`insertAfterCard` nav rewiring**: Journey A→B→C; "add a card between B and C" → A→B→D→C
6. **`redirectTo` on delete**: Journey A→B→C→D; "remove C" → B navigates to D
7. **Concurrent edit protection**: Manual edit while AI streams → `expectedUpdatedAt` mismatch → agent reports conflict
8. **Undo AI edit**: AI updates 3 cards → user clicks "Undo all" → pre-turn snapshot restored
9. **Stop mid-execution**: User clicks ■ Stop after 2 of 4 operations → 2 ✅ + 2 ⏸, undo available
10. **Tiered model**: Free user → Gemini Flash. BYOK user → Claude Sonnet 4. Same UX.
11. **Background video**: Card with backgroundVideo + heading + button renders correctly
12. **Branching layout**: Journey with poll card (3 options → 3 different cards) renders with dagre layout, edges don't overlap, labels distinguish each path

---

## Acceptance Criteria

### Functional

- [ ] "✨ AI Editor" in existing editor Toolbar navigates to `/journeys/[id]/ai-chat`
- [ ] AI editor canvas shows full card previews (all blocks rendered via BlockRenderer, scrollable within node)
- [ ] Canvas edges are labeled with connection type (Button: "X", Poll: "Y", Default)
- [ ] Canvas auto-pans to the card being edited
- [ ] Cards shimmer while AI is actively modifying them
- [ ] User can type a message and receive a streaming response (word by word)
- [ ] "Thinking..." indicator shown before first text arrives
- [ ] Plan card shows before execution with operation list and status indicators
- [ ] Destructive operations (generate_journey, >3 deletions) show [Execute] / [Cancel]
- [ ] AI can create a journey from scratch in a single message
- [ ] AI can edit existing journeys: add/remove cards, change text, update navigation
- [ ] Tool call progress shown inline ("Searching images..." / "Validating journey...")
- [ ] Canvas re-renders with updated block content after AI completes
- [ ] Post-execution validation warns about orphaned cards or dead-end navigation
- [ ] Hover over user message bubble reveals undo icon at bottom-right corner
- [ ] Clicking undo icon shows inline confirmation with contextual description of changes to revert
- [ ] Confirming undo restores the pre-turn snapshot; undoing past turns warns about cascading revert
- [ ] ■ Stop button cancels AI mid-request
- [ ] Starter suggestion chips shown on empty chat
- [ ] "Changes saved" toast when switching to manual editor
- [ ] Conversation history maintained within session (ephemeral, lost on refresh)
- [ ] Free tier (Gemini Flash) works without any setup
- [ ] Premium tier (Claude) works after user enters Anthropic API key
- [ ] Content-derived card IDs (card-welcome, not card-1) for existing journeys
- [ ] Clicking a card on the canvas selects it as context; context pill shown in chat input; card ID sent to subscription
- [ ] Branching journeys (poll/multi-button) render with fanned-out target cards and non-overlapping bezier edges
- [ ] Upstream API 429 errors are caught and shown as friendly messages with retry timing (Claude BYOK extracts `retry-after` header)
- [ ] Users can switch between free and premium tiers mid-conversation without losing chat context
- [ ] "Edit Manually" shows confirmation dialog when chat history exists or AI is active
- [ ] Active AI operations are cleanly aborted before navigation to manual editor

### Non-Functional

- [ ] First AI response token streams within 2 seconds
- [ ] `generate_journey` completes in under 5 seconds for journeys up to 20 cards
- [ ] Server-driven execution completes all operations in under 2 seconds
- [ ] Prompt injection hardened via `hardenPrompt` + `preSystemPrompt`
- [ ] Auth: subscription requires valid Firebase JWT
- [ ] User API keys encrypted server-side (AES-256/GCP KMS), never in browser JS

### Quality Gates

- [ ] Unit tests for `journeyAiChatCreateSubscription` (mock AI SDK)
- [ ] Unit tests for `AiChatPanel`, `AiCardPreviewNode`, `PlanCard` components
- [ ] `nx type-check shared-ai && nx type-check api-journeys-modern` passes
- [ ] `nx build api-journeys-modern` passes
- [ ] `nx build journeys-admin` passes
- [ ] `nx generate-graphql api-journeys-modern` generates schema with new types
- [ ] No unused imports, no empty catch blocks

---

## Dependencies & Prerequisites

| Dependency | Notes |
|---|---|
| `@ai-sdk/anthropic` | Add to root package.json (for BYOK users) |
| `@google-cloud/kms` | For API key encryption (or Firebase server-side encryption) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Already configured — powers free tier |
| `JourneySimple` Phase 0 redesign | Must complete before Phase 1 |
| `BlockRenderer` (viewer mode) | Already in `libs/journeys/ui` — needs `ThemeProvider` + `JourneyProvider` wrapping |
| `CARD_WIDTH` / `CARD_HEIGHT` | Already in `Canvas/utils/calculateDimensions/` — 324×674px |
| `searchUnsplashPhotos` | Extract from `api-media` to shared NX lib (`libs/shared/unsplash/`) |
| `journeyAiTranslateCreate` | Already exists — `translate_journey` tool delegates to it |
| SSE subscription infrastructure | Already wired via `SSELink` + `graphql-sse` in Apollo Client |
| `hardenPrompt` + `preSystemPrompt` | Already in `libs/shared/ai/src/prompts/` |
| Redis (`libs/yoga/src/redis/connection.ts`) | Already available — used for per-turn snapshot + plan storage with TTL |
| `@dagrejs/dagre` | Directed graph layout for branching journey flows |
| `transformSteps` | Existing utility — add optional `labelEdges` parameter |

---

## NX Commands

```bash
# Phase 0 — after schema changes:
nx prisma-validate prisma-journeys
nx prisma-generate prisma-journeys         # MUST run after Prisma schema changes
nx prisma-migrate prisma-journeys          # If adding UserApiKey model
nx type-check shared-ai
nx test shared-ai
nx type-check api-journeys-modern
nx test api-journeys-modern
nx build api-journeys-modern

# Phase 1 — after Pothos schema changes:
nx generate-graphql api-journeys-modern    # MUST run after adding subscription/mutation types

# Phase 2:
nx build journeys-admin
```

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BlockRenderer in React Flow node causes performance issues | Low | Medium | React.memo on AiCardPreviewNode, pointerEvents: none, maxHeight: 400 with scroll |
| AI generates invalid navigation (orphaned cards) | Low | Medium | Zod superRefine + post-execution validate_journey + insertAfterCard/redirectTo |
| Gemini Flash quality insufficient for complex edits | Medium | Medium | Users can upgrade to Claude BYOK; system prompt + examples mitigate |
| Canvas re-render flicker after AI edit | Low | Low | Apollo network-only refetch + CSS transitions |
| User API key security | Low | High | AES-256/GCP KMS encryption, never in browser JS, immune to XSS |
| Surgical tool blockId fragility | None (mitigated) | High | All surgical tools use blockId from injected journey state |
| Context window growth in long sessions | Low | Medium | Auto-summarization via same model tier after 20 messages |

---

## `JourneySimple` Remaining Limitations

After Phase 0, the following are still out of scope:

- **SignUpBlock** — not in AddBlock UI panel, excluded
- **Mux/Cloudflare video sources** — only YouTube
- **Poll option images** (`pollOptionImageBlockId`)
- **Button icons** (`startIconId`, `endIconId`)
- **VideoTriggerBlock** — time-based navigation trigger
- **GridContainerBlock / GridItemBlock** — confirmed unused
- **Journey-level appearance** (`chatButtons[]`, `host`, custom fonts) — deferred to Phase 3
- **CardBlock `backdropBlur`** — blur effect not exposed

The `content` array design makes adding any of these a local change to the discriminated union.

---

## Future Considerations

- **Persisted conversation history** — store chat messages in `JourneyAiChatSession` table
- **AI journey templates** — pre-seeded prompts for common use cases
- **Multi-journey operations** — "Update all journeys in this team to use new brand colors"
- **Image generation integration** — AI generates background images on the fly
- **Analytics-driven suggestions** — "This card has 60% drop-off. Want me to simplify it?"
- **MCP Server (Phase 4)** — External agents via Model Context Protocol with OAuth 2.0

---

## Sources & References

### Internal

- `JourneySimple` schema: `libs/shared/ai/src/journeySimpleTypes.ts`
- `getSimpleJourney`: `apis/api-journeys-modern/src/schema/journey/simple/getSimpleJourney.ts`
- `updateSimpleJourney`: `apis/api-journeys-modern/src/schema/journey/simple/updateSimpleJourney.ts`
- `simplifyJourney`: `apis/api-journeys-modern/src/schema/journey/simple/simplifyJourney.ts`
- Streaming pattern: `apis/api-journeys-modern/src/schema/journeyAiTranslate/journeyAiTranslate.ts`
- Prompt hardening: `libs/shared/ai/src/prompts/hardeningPrompt/`, `libs/shared/ai/src/prompts/preSystemPrompt.ts`
- `BlockRenderer` (viewer mode): `libs/journeys/ui/src/components/BlockRenderer/BlockRenderer.tsx`
- Card dimensions: `apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/utils/calculateDimensions/`
- React Flow nodes: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/nodes/`
- React Flow edges: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/edges/`
- `transformSteps`: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/libs/transformSteps/transformSteps.ts`
- Editor component tree: `apps/journeys-admin/src/components/Editor/Editor.tsx`
- Apollo SSE client: `apps/journeys-admin/src/libs/apolloClient/apolloClient.ts`
- EditorProvider: `libs/journeys/ui/src/libs/EditorProvider/EditorProvider.tsx`
- CommandProvider: `libs/journeys/ui/src/libs/CommandProvider/CommandProvider.tsx`
- JourneyProvider: `libs/journeys/ui/src/libs/JourneyProvider/JourneyProvider.tsx`
- Unsplash: `apis/api-media/src/schema/unsplash/service.ts`
- Redis: `libs/yoga/src/redis/connection.ts`
- Prisma Block model: `libs/prisma/journeys/db/schema.prisma:534-638`
- Prisma Action model: `libs/prisma/journeys/db/schema.prisma:640-660`
- Builder config: `apis/api-journeys-modern/src/schema/builder.ts`

### External

- Vercel AI SDK tool-use: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
- Pothos GraphQL schema builder: https://pothos-graphql.dev/docs
