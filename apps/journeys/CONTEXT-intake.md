---
area: journeys (published viewer)
domain_ref: ./CONTEXT.md
code_paths:
  - apps/journeys/src/**
  - libs/journeys/ui/src/**
trigger_phrases:
  - "button doesn't go to the next card"
  - 'goes to the wrong card'
  - "video won't load"
  - 'video is slow to load'
  - 'image is cropped / wrong fit'
  - "can't click / can't type on the card"
  - 'looks wrong when published'
  - 'custom domain / embed not working'
type_tags: [T6, T10]
updated: 2026-07-15
---

> Diagnosis layer for reported bugs in the **published journey viewer** (what the audience sees).
> Read this when triaging or debugging a reported bug in a live/published journey — not for feature
> work. Domain model: ./CONTEXT.md.
> Note: most rendering and navigation lives in the shared kernel `libs/journeys/ui`, consumed by
> both this viewer and the journeys-admin editor — so many "look first" pointers reach into that lib.
> Failure types (T1–T11) reference the shared taxonomy in the repo-root AGENTS.md.

## Rendering — published looks different from the Editor — T6

**Signatures:** a block/card renders correctly in the Editor but wrong only in the published/preview
view (the "saved fine, wrong only in preview" branch handed over from journeys-admin).
**Localizing question (reporter):** does it look right while editing but wrong once published?
**Look first (fixer):** the shared Block Renderer + Card rendering in `libs/journeys/ui`
(`src/components/BlockRenderer`, `src/components/Card/Card.tsx`) — the viewer injects different
Wrappers than the admin, so a divergence is usually in render-mode / wrapper handling, not the data.
**Handoff:** agent-able.

## Default next step (navigation)

**Signatures:** clicking a button doesn't advance, or goes to the wrong card; "nothing happens on
the last card." Often an **authoring mistake** — the step's next action was never linked, so it
falls back to default-next-step behavior.
**Localizing question (reporter):** does the step have an explicit next action set, or is it relying
on the default next step?
**Look first (fixer):** `apps/journeys/src/components/Conductor/Conductor.tsx` (advances steps,
wires swipe/hotkey/button nav) → `libs/journeys/ui/src/libs/block/block.ts` (`getNextBlock` /
`nextActiveBlock`: resolves `nextBlockId` or falls back to the following step) →
`libs/journeys/ui/src/libs/action/getNextStepSlug.ts` (URL-level next-step).
**Handoff:** authoring "didn't link it" → how-to; genuine resolution bug → agent-able.

## Video won't load / slow to load — T10 (known weak spot)

**Signatures:** videos don't load fast enough; a video won't play; background video doesn't render
(notably first card / Android).
**Status:** preloading is a **known weak spot** — attempted a few times, never much success. Treat
"slow to load" as a known limitation, not a fresh regression, unless something clearly broke.
**Localizing question (reporter):** which video source (library / YouTube / upload), which
device/OS/browser, and a **working-vs-failing** example if possible.
**Look first (fixer):** `libs/journeys/ui/src/components/Video/Video.tsx` (video.js setup, poster,
autoplay/preload) → `libs/journeys/ui/src/components/Video/InitAndPlay/InitAndPlay.tsx` (init + play
lifecycle — load/preload timing) → `libs/journeys/ui/src/components/Card/ContainedCover/BackgroundVideo/BackgroundVideo.tsx`
(cover-card background video).
**Handoff:** old browser/OS → not-a-code-bug (explain); genuine load bug → agent-able.

## Image fit (crop / fit / fill) — T6, expectation mismatch

**Signatures:** an image looks cropped / doesn't fit as expected; confusion over crop vs fit vs fill.
**Status:** the code is generally **correct** here — this is usually expectation-setting, not a bug.
**Handoff:** set expectation / how-to; only escalate if the rendered result contradicts the chosen mode.

## Interaction — can't click / type / stay focused — T6 (event bubbling)

**Signatures:** can't click a button, can't type, or a field un-focuses while typing.
**Heuristic (high-value):** rare, and when it happens it's **almost always tied to a recent code
change** that altered how cards are structured/layered → check recent commits touching card layout.
The cards are heavily layered, so these are event-bubbling bugs in that stack.
**Look first (fixer):** `libs/journeys/ui/src/components/Card/Card.tsx` (layered cover/overlay/content
stacking) → `Card/OverlayContent/OverlayContent.tsx` + `Card/ContainedCover/ContainedCover.tsx` (the
layers that sit above content and intercept pointer/type events) → `libs/journeys/ui/src/libs/action/action.ts`
(the `handleAction` dispatch the interactive blocks' click handlers call).
**Handoff:** agent-able — and bisect to the recent card-structure change first.

## Custom domains / embeds — LOW SIGNAL, thin on purpose

**Status:** low usage → few/no regular reports; little institutional knowledge to encode yet.
**Handoff:** route to a human. (Embed-specific issues, if they arise, are usually X-Frame/CSP or
oEmbed-shape — but treat as human-diagnosed until we have real cases.)

## Chat / AI assistant — TOO NEW, out of scope

**Status:** still new, behind a flag, not widely used, not officially released → no accurate failure
data yet. Don't encode a diagnosis layer; route to a human. Revisit after release.
