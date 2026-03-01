# PRD: AI SDK v6 + @vercel/otel v2 + Langfuse v4 Upgrade

## Context

The journeys-admin app uses three interconnected packages for AI inference and observability:

- **`ai` (Vercel AI SDK)** — currently on `^5.0.86`. v6 is now the published `latest`. Staying on v5 means falling behind on model provider support, new Agent abstractions, and provider-specific tools (Google Maps, File Search for Gemini 2.5).
- **`@vercel/otel`** — currently on `^1.13.0`. v2.1.1 was released with full OpenTelemetry JS SDK v2 support.
- **`langfuse` + `langfuse-vercel`** — currently on `^3.37.4`. Both are deprecated in favour of the rewritten `langfuse@4.x` SDK, which is split into `@langfuse/otel` and `@langfuse/client`. The previous blocker (OTel SDK version mismatch between `@vercel/otel@1.x` and `@langfuse/otel@4.x`) is now resolved — both v2 packages share the same OTel SDK v2 dependency tree.

These three upgrades must be done together because they share the OTel SDK version constraint.

---

## Goals

- Upgrade all three dependency groups to their current stable versions
- Remove deprecated packages (`langfuse`, `langfuse-vercel`)
- Preserve all existing observability behaviour (prompt management, tracing, trace metadata, environment tagging)
- No functional regression in the AI chat pipeline

## Non-Goals

- Adopting the new v6 `Agent` abstraction or `generateImage` editing features (these are additive future work)
- Migrating `generateObject`/`streamObject` to `generateText`/`streamText` with `Output` (deprecated but not removed in v6)

---

## Package Changes

### Root `package.json`

| Action | Package | From | To |
|--------|---------|------|-----|
| Upgrade | `ai` | `^5.0.86` | `^6.0.0` |
| Upgrade | `@ai-sdk/google` | `^2.0.26` | `^3.0.0` |
| Upgrade | `@ai-sdk/google-vertex` | `^2.2.27` | `^4.0.0` |
| Upgrade | `@ai-sdk/openai` | `^1.3.22` | `^3.0.0` |
| Upgrade | `@ai-sdk/react` | `^2.0.0` | `^3.0.0` |
| Upgrade | `@vercel/otel` | `^1.13.0` | `^2.1.1` |
| Remove | `langfuse` | `^3.37.4` | — |
| Remove | `langfuse-vercel` | `^3.37.4` | — |
| Add | `@langfuse/otel` | — | `^4.6.1` |
| Add | `@langfuse/client` | — | `^4.6.1` |
| Add | `@langfuse/tracing` | — | `^4.6.1` |

---

## Code Changes

### 1. Run AI SDK codemod first (automated)

```bash
npx @ai-sdk/codemod v6
```

This automatically renames the following across all source files:

| Old | New |
|-----|-----|
| `isToolOrDynamicToolUIPart` | `isToolUIPart` |
| `getToolOrDynamicToolName` | `getToolName` |
| `isToolUIPart` | `isStaticToolUIPart` |
| `getToolName` | `getStaticToolName` |
| `CoreMessage` | `ModelMessage` |
| `convertToCoreMessages()` | `await convertToModelMessages()` |
| `ToolCallOptions` | `ToolExecutionOptions` |
| Google Vertex `providerOptions.google` | `providerOptions.vertex` |

Affected files include:
- `apps/journeys-admin/src/components/AiChat/MessageList/MessageList.tsx`
- `apps/journeys-admin/src/components/AiChat/MessageList/ToolInvocationPart/` (spec files)
- Any file importing from `@ai-sdk/ui-utils`

### 2. `apps/journeys-admin/src/libs/ai/langfuse/server.ts`

**Before:**
```typescript
import { Langfuse } from 'langfuse'
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseEnvironment =
  process.env.VERCEL_ENV ?? process.env.DD_ENV ?? process.env.NODE_ENV ?? 'development'

export const langfuseExporter = new LangfuseExporter({ environment: langfuseEnvironment })
export const langfuse = new Langfuse({ environment: langfuseEnvironment })
```

**After:**
```typescript
import { LangfuseClient } from '@langfuse/client'
import { LangfuseSpanProcessor } from '@langfuse/otel'

export const langfuseSpanProcessor = new LangfuseSpanProcessor()
export const langfuse = new LangfuseClient()
```

Notes:
- `langfuseEnvironment` and its derivation logic is removed — environment is now set via `LANGFUSE_TRACING_ENVIRONMENT` in Doppler (see env vars section).
- `LangfuseSpanProcessor` reads `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL` from env automatically.
- `LangfuseClient` reads the same env vars automatically. The deprecated `langfuse.getPrompt()` alias still works in v4 but prefer `langfuse.prompt.get()` going forward.
- The export name changes from `langfuseExporter` → `langfuseSpanProcessor`; update all import sites.

### 3. `apps/journeys-admin/src/libs/ai/langfuse/client.ts`

**`LangfuseWeb` is removed in Langfuse v4 with no browser-compatible equivalent.** The `@langfuse/client` package is Node.js-only and has no `browser` entrypoint.

Action: **Delete `client.ts`** and remove all imports of `langfuseWeb`. Audit usages across the app — if any component actively calls `langfuseWeb`, that feature must be dropped or deferred until a v4 browser SDK exists. A grep for `langfuseWeb` import sites should be run as part of implementation.

### 4. `apps/journeys-admin/instrumentation.ts`

**Before:**
```typescript
import { registerOTel } from '@vercel/otel'
import { langfuseExporter } from './src/libs/ai/langfuse/server'

export function register() {
  registerOTel({
    serviceName: 'journeys-admin',
    traceExporter: langfuseExporter
  })
}
```

**After:**
```typescript
import { registerOTel } from '@vercel/otel'
import { LangfuseSpanProcessor } from '@langfuse/otel'

export function register() {
  registerOTel({
    serviceName: 'journeys-admin',
    spanProcessors: [
      'auto',
      new LangfuseSpanProcessor()
    ]
  })
}
```

Notes:
- `spanProcessors` (array) replaces `traceExporter` (single exporter) — `LangfuseSpanProcessor` is a `SpanProcessor`, not a `SpanExporter`.
- `'auto'` preserves `@vercel/otel`'s default Vercel trace export pipeline alongside Langfuse.
- `LangfuseSpanProcessor` is instantiated directly here; the import of `langfuseExporter` from `server.ts` is removed.

### 5. `apps/journeys-admin/app/api/chat/route.ts`

**`forceFlush`** — replace `langfuseExporter.forceFlush()` with `langfuseSpanProcessor.forceFlush()`, updating the import from `server.ts`.

**`getPrompt`** — `langfuse.getPrompt()` still works in v4 (deprecated alias), but migrate to `langfuse.prompt.get()` for forward-compatibility:

```typescript
// Before
const systemPrompt = await langfuse.getPrompt('system/api/chat/route', undefined, {
  label: langfuseEnvironment,
  cacheTtlSeconds: ...
})

// After
const systemPrompt = await langfuse.prompt.get('system/api/chat/route', {
  label: process.env.LANGFUSE_TRACING_ENVIRONMENT ?? 'development',
  cacheTtlSeconds: ...
})
```

**`langfuse.trace().update()`** — this pattern is **removed in v4**. Traces are now created automatically via OTEL spans from `experimental_telemetry`. The output text is captured automatically. To attach custom tags, use `@langfuse/tracing`'s `updateActiveTrace`:

```typescript
// Before
onFinish: async (result) => {
  await langfuseExporter.forceFlush()
  const trace = langfuse.trace({ id: langfuseTraceId })
  await trace.update({ output: result.text, tags: ['output-added'] })
}

// After
import { updateActiveTrace } from '@langfuse/tracing'

onFinish: async (_result) => {
  updateActiveTrace({ tags: ['output-added'] })
  await langfuseSpanProcessor.forceFlush()
}
```

Note: `output` no longer needs to be set manually — the OTEL span emitted by AI SDK's `experimental_telemetry` captures `result.text` automatically. The `langfuseTraceId` UUID in `experimental_telemetry.metadata` remains as-is; it continues to correlate spans to the correct Langfuse trace.

**`experimental_telemetry`** — not a breaking change in AI SDK v6; no changes required.

### 6. Environment Variables

> **Action required in Doppler** — do not edit `.env` files directly. Make the following changes in the Doppler project for all relevant environments (development, preview, production).

| Current key | Action | New key | Notes |
|-------------|--------|---------|-------|
| `LANGFUSE_BASEURL` | Rename | `LANGFUSE_BASE_URL` | Old name still works in v4 but is deprecated |
| `LANGFUSE_PUBLIC_KEY` | Keep | — | No change |
| `LANGFUSE_SECRET_KEY` | Keep | — | No change |
| `NEXT_PUBLIC_LANGFUSE_BASE_URL` | Remove | — | Only used by `LangfuseWeb` in `client.ts`, which is being deleted |
| `NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY` | Remove | — | Same — only used by `LangfuseWeb` |
| _(missing)_ | Add | `LANGFUSE_TRACING_ENVIRONMENT` | Replaces the `environment` constructor argument; set to the same value as the old `DD_ENV` / `VERCEL_ENV` per environment |

---

## Critical Files

| File | Change Type |
|------|-------------|
| `package.json` (root) | Package additions/removals/upgrades |
| `apps/journeys-admin/instrumentation.ts` | OTel setup rewrite |
| `apps/journeys-admin/src/libs/ai/langfuse/server.ts` | Full rewrite |
| `apps/journeys-admin/src/libs/ai/langfuse/client.ts` | **Delete** — `LangfuseWeb` has no v4 equivalent |
| `apps/journeys-admin/app/api/chat/route.ts` | Import updates + prompt/trace API changes |
| Doppler (all envs) | Env var rename + addition — **manual action required** |
| Codemod-handled files (see §1) | Automated rename |

---

## Resolved Questions

| Question | Answer |
|----------|--------|
| `LangfuseWeb` v4 replacement | **None.** `@langfuse/client` is Node.js-only. `client.ts` must be deleted; browser-side tracing is not available in v4. |
| `langfuse.trace().update()` in v4 | **Removed.** Use `updateActiveTrace({ tags })` from `@langfuse/tracing`. Output is captured automatically via OTEL spans. |
| Node.js / `@vercel/otel` v2 compatibility | **No issues.** Running Node.js v24.13.0; Next.js 15.5.7. All packages require `>=18.19.0` — fully satisfied. |

---

## Verification

1. Install packages: `pnpm install`
2. Build journeys-admin: `nx build journeys-admin`
3. Run type-check: `nx run journeys-admin:type-check`
4. Run tests: `nx run-many --target=test --projects=journeys-admin,api-journeys-modern,shared-ai`
5. Smoke test locally: Start dev server, open AI chat, send a message, confirm:
   - Streaming response appears
   - A trace appears in the Langfuse dashboard with correct model, token counts, and environment tag
   - System prompt from Langfuse prompt management is loaded correctly
