---
title: 'Implementing a Figma design: verify by rendering + zooming, and wire shared components into the real pages'
date: 2026-05-27
category: developer-experience
module: libs/journeys/ui
problem_type: developer_experience
component: development_workflow
severity: medium
applies_when:
  - 'Implementing a Figma design as a React/MUI component in this monorepo'
  - 'Using the Figma MCP (get_design_context / get_screenshot) to translate a design to code'
  - 'Building a shared component intended to replace existing per-app UI'
tags:
  - figma
  - design-to-code
  - verification
  - storybook
  - workflow
related_components:
  - tooling
---

# Implementing a Figma design: verify by rendering + zooming, and wire shared components into the real pages

## Context

While rebuilding the public template-gallery page (NES-1701) two avoidable, expensive loops happened:

1. **The stakeholder saw "no changes" for several rounds.** The new shared component was built and looked correct in Storybook, but was never wired into the pages the apps actually render (`apps/journeys` `TemplateGalleryView`, `apps/journeys-admin` `CollectionPreviewPane`). From the outside it looked like nothing had been done.
2. **The card's text treatment was flip-flopped ~3 times** (dark-text-on-white ⇄ white-text-on-image). Each flip came from judging the design off a small/zoomed-out screenshot or off the Figma MCP's generated Tailwind, which were misread. The truth (white text on the image over a dark gradient) only became unambiguous after zooming hard into the actual Figma node's text region.

## Guidance

- **A component isn't "done" or reviewable until it renders in the real consuming page.** Storybook proves the component works in isolation; it does not prove the feature changed. After building a shared component, wire it into the actual page(s) and map real data onto its contract before asking for review.
- **Verify visual fidelity by rendering your implementation and screenshot-comparing it to the Figma** — then **zoom into specific regions** (text, gradients, borders) to confirm colors and structure. Use `get_screenshot` at a high `maxDimension` and crop the region in question; do not decide fine details (text color, overlay vs. on-white) from a card-sized or page-sized thumbnail.
- **Treat the Figma MCP's generated code as a hint, not ground truth.** `get_design_context` output (Tailwind, layer dumps) can misrepresent masks/blends/gradients. When the generated code and a screenshot disagree, resolve it with a high-zoom screenshot of the specific node, and cross-check against the layer's named styles/variables.

## Why This Matters

Both loops were pure rework driven by unverified assumptions. Each "describe what you see / that's still wrong" round cost a full build-screenshot-review cycle. Rendering + zoom-verifying up front, and wiring into the real page before review, collapses those rounds — the reviewer sees the actual change and the fine details are confirmed against the source instead of guessed.

## When to Apply

- Any Figma-to-code task, especially card/overlay layouts where text-color and gradient direction are easy to misjudge at thumbnail scale.
- Whenever a "shared component" is meant to replace existing UI — confirm the old call sites are actually swapped, and delete the superseded components so it's unambiguous which implementation is live.

## Examples

Render the implementation and crop the exact region before trusting it:

```bash
# Storybook (Vite) renders the story; Playwright screenshots the iframe
npx nx demo shared-storybook   # serves on :4400
# ...screenshot http://localhost:4400/iframe.html?id=<story-id>&viewMode=story
# then zoom into the detail in question rather than eyeballing the thumbnail:
convert shot.png -crop 600x520+0+880 +repage zoomed.png
```

Wire the shared component into the real page (don't stop at Storybook):

```tsx
// apps/journeys TemplateGalleryView.tsx — map the page DTO onto the contract
export function TemplateGalleryView({ gallery }: TemplateGalleryViewProps) {
  return <PublicTemplateGallery data={toGalleryData(gallery)} />
}
```

## Related

- `docs/solutions/build-errors/nx-enforce-module-boundaries-enoent-intra-lib-alias-2026-05-27.md` — a concrete gotcha hit during the same build.
- `docs/solutions/conventions/mui-spacing-token-is-4px-2026-05-24.md` — pixel→token conversion when translating Figma spacing.
