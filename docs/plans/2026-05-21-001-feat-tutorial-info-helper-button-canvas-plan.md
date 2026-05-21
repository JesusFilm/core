---
title: 'feat: Tutorial info helper button in journey editor canvas'
type: feat
status: active
date: 2026-05-21
linear: NES-1642
---

# feat: Tutorial info helper button in journey editor canvas

## Summary

Add a floating ℹ️ helper button to the top-left of `JourneyFlow` that, when clicked, reveals the shipped `TemplateInfoPanel` rendered with a new `contained` chrome. The helper pairs with the existing `AnalyticsOverlaySwitch` via the existing `isTemplate` check — same `<Panel position="top-left">` slot, opposite branch — and reuses the `teamTemplateCollection` LaunchDarkly flag that already gates `TemplateInfoPanel`'s templates-tab surface.

---

## Problem Frame

Template creators editing a template inside the journey editor have no in-context surface explaining how templates work — what types exist, how to create one, how tracking and sharing behave. NES-1538 shipped the educational `TemplateInfoPanel` next to the templates grid, but users editing a template don't see it there. NES-1642 adds an unobtrusive entry point on the canvas itself, reusing the shipped panel content with no new copy or assets.

---

## Requirements

- R1. A floating ℹ️ button appears in the top-left of the journey editor canvas when `teamTemplateCollection` is on and the journey being edited is a template.
- R2. The button does not render for non-template journeys, when the flag is off, or before `journey` has loaded.
- R3. The button does not overlap or obstruct the existing toolbar, step-navigation, or drag-handle controls — it occupies the same `Panel position="top-left"` slot that `AnalyticsOverlaySwitch` uses on non-template journeys.
- R4. Clicking the button reveals `TemplateInfoPanel` rendered as a self-contained floating card; clicking the trigger again, clicking outside the card, or pressing Escape collapses it.
- R5. Focus moves into the panel when it opens and returns to the trigger button when it closes; focus is trapped inside the panel while open.
- R6. Expand and collapse are animated using the same MUI primitive (`Fade`) the sibling `JourneyAnalyticsCard` uses, for canvas-wide motion symmetry.
- R7. The panel sits visually above canvas nodes and step controls but below modals, snackbars, and editor dropdowns.
- R8. `TemplateInfoPanel` gains a new boolean `contained` prop (default `false`) that controls whether it renders its own rounded card chrome. Existing callsites are unaffected.

---

## Scope Boundaries

- No modification of accordion content inside `TemplateInfoPanel` (sections 1-4 ship as-is from NES-1538).
- No "Section 5" (Canva / Google Slides embedding) content — explicitly removed during NES-1538 QA, not revived here.
- No `surface: 'templates-tab' | 'editor-canvas'` prop or context-switching copy — the prop is purely about chrome.
- No new LaunchDarkly flag — reuses `teamTemplateCollection`.
- No screenshot/GIF asset sourcing — assets already ship with NES-1538.
- No extraction of a shared `getIsTemplate(journey)` helper — three local flavors exist in the codebase but consolidating them is its own piece of work.
- No change to `JourneyList`'s consumption of `TemplateInfoPanel` (it continues to omit the prop, which means `contained={false}` — the existing chrome-less behavior).

### Deferred to Follow-Up Work

- **Mobile/narrow-viewport behavior** — ticket open question. Current plan: the floating card overflows the viewport on narrow screens like the analytics panel does today. Revisit if QA flags it.
- **Expand/collapse persistence across sessions or template switches** — ticket open question. Current plan: always collapsed on open, internal state only.
- **Shared `getIsTemplate(journey)` helper extraction** — flagged by repo research; out of scope for this 2-pt ticket.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx:602-603` — canonical `isTemplate` inline expression for this slot: `journey?.team?.id === 'jfp-team' || journey?.template === true`. Reuse verbatim; do **not** import `libs/getIsLocalTemplate` (excludes global templates — wrong semantics here).
- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx:655-669` — the existing `<Panel position="top-left">` branch the helper pairs with. Currently gated by `!isTemplate && journey != null && editorAnalytics`; the new helper takes the inverse branch.
- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx:662` — `<Fade in={showAnalytics} unmountOnExit><Box>...</Box></Fade>` — direct animation analogue. Mirror this shape so the two canvas affordances feel motion-symmetric.
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeActionButton/CodeActionButton.tsx:133-144` — closest in-repo `ClickAwayListener` precedent (trigger button + `Popper` anchor + `ClickAwayListener` closes content). Mirror the wrapper shape.
- `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx` — the shipped panel. Currently renders `<Box sx={{ width: '100%' }}>` (chrome-less, wrapped by Drawer on the templates tab). The `contained` prop will swap the outer element to a `Paper` with rounded corners + soft elevation + content sizing when `true`.
- `apps/journeys-admin/src/components/JourneyList/JourneyList.tsx` (post-NES-1538) — confirms the LD flag key is `teamTemplateCollection` via `useFlags()` from `@core/shared/ui/FlagsProvider`.

### Institutional Learnings

- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — confirms `teamTemplateCollection` is the live flag (renamed from `templateGalleryPage` mid-NES-1539). Pattern 10 ("ship the simplest version, iterate later") supports the deferred mobile/persistence calls above.
- No prior solutions doc covers MUI `ClickAwayListener` + focus-trap composition, `Fade` vs `Collapse` tradeoffs on the editor canvas, or `TemplateInfoPanel` chrome assumptions. After this work lands, consider capturing the floating-disclosure-on-canvas pattern via `/ce-compound`.

### External References

- Not consulted. The work uses well-established MUI primitives that already have local precedent.

---

## Key Technical Decisions

- **Flag is `teamTemplateCollection`, not the `templateInfoSidePanel` named in the Linear ticket.** NES-1538 shipped on `teamTemplateCollection`; piggy-backing keeps the helper from rendering in a world where the surface it educates about is hidden, and avoids LD config churn.
- **Animation is `Fade`, not `Collapse` or `Slide`.** Mirrors the sibling `JourneyAnalyticsCard` (`JourneyFlow.tsx:662`). The two top-left canvas affordances will animate identically, which reads as one design language rather than two.
- **`contained` is a boolean prop on `TemplateInfoPanel`, default `false`.** When `true`, the panel renders an outer `<Paper>` with rounded corners on all sides, soft elevation, and content-sized height. When omitted or `false`, current behavior is preserved (outer `<Box>`, chrome supplied by the consumer's Drawer on the templates tab). A boolean is sufficient — no variant union — because the two visual modes do not extend further.
- **Trigger and floating-disclosure behavior live in a new colocated component (`TemplateInfoHelper`) under `JourneyFlow/`.** `TemplateInfoPanel` stays surface-agnostic; only the new helper knows about the canvas, the trigger, click-outside, focus management, and the LD flag.
- **`isTemplate` re-uses the inline expression at `JourneyFlow.tsx:602`.** Extracting a helper is tempting but adds drift surface (three flavors exist in the codebase) and is out of scope for a 2-pt nice-to-have.
- **Single `<Panel position="top-left">` continues to host both branches.** Stacking two `Panel`s at the same position is undefined under `@xyflow/react`'s `Panel` API; instead, the existing Panel's children become a top-level `isTemplate` switch.

---

## Open Questions

### Resolved During Planning

- **Which LD flag?** `teamTemplateCollection` — confirmed against the shipped NES-1538 code (`JourneyList.tsx` post-#9221, `useFlags()` usage).
- **What animation primitive?** `Fade` — repo research confirmed this is the canvas idiom; the sibling analytics card uses it directly.
- **Where does the trigger live?** Inside the existing `<Panel position="top-left">` slot, conditionally rendered alongside the analytics-switch branch (single Panel, switched contents).
- **Is the `contained` prop a variant union or a boolean?** Boolean. The two modes do not extend; a union would be more typing for the same expressivity.
- **Reuse `getIsLocalTemplate`?** No — wrong semantics (excludes global templates). Reuse the inline expression.

### Deferred to Implementation

- **Focus-trap primitive choice** — the codebase has zero `FocusTrap` precedent. Options at implementation time: (a) MUI's `Unstable_TrapFocus` (renamed `FocusTrap` in current MUI), (b) `useEffect` that focuses panel root on open and trigger on close without strict trap, (c) wrap the whole disclosure in MUI `Popover` and accept its `Paper` chrome (would override `contained` styling assumptions — currently disfavored). Pick at implementation when the exact MUI version's API is confirmed.
- **Exact `Paper` styling under `contained={true}`** — radius, elevation, max-width, internal padding-overrides. Driven by Figma node `39662-67865`; finalize against the design while implementing.
- **Trigger button icon** — Figma shows a circular pill with an "i" glyph. Implementation chooses between `@core/shared/ui/icons/InformationCircle` (or similar) vs. an inline glyph; resolve by inspecting the design token at implementation time.
- **Keyboard handling for Escape** — `useEffect` on document keydown vs. native MUI dialog/modal keydown propagation. Resolved alongside the focus-trap choice above (they are typically the same primitive).

---

## High-Level Technical Design

> _Directional guidance for review, not implementation specification. The implementing agent should treat this as context, not code to reproduce._

Mount-site change in `JourneyFlow`:

```tsx
<Panel position="top-left">
  {isTemplate && teamTemplateCollection ? (
    <TemplateInfoHelper />
  ) : (
    !isTemplate && editorAnalytics && (
      <>
        <AnalyticsOverlaySwitch />
        <Fade in={showAnalytics} unmountOnExit>
          <Box><JourneyAnalyticsCard /></Box>
        </Fade>
      </>
    )
  )}
</Panel>
```

The Panel itself stays gated on `journey != null` (single guard) plus `activeSlide === ActiveSlide.JourneyFlow` (already enforced by the surrounding `&&`).

`TemplateInfoHelper` shape:

```text
state: open (boolean)
trigger: IconButton with aria-expanded, aria-controls, focus-bearing
panel (when open): ClickAwayListener > Fade > FocusTrap > TemplateInfoPanel contained
escape handling: keydown listener while open → setOpen(false)
on close: trigger.focus()
```

`TemplateInfoPanel` chrome decision:

```text
contained=false (default, today's behavior):  Box{ width: 100% }   ─ chrome from consumer Drawer
contained=true  (editor canvas):              Paper{ borderRadius, elevation, width, ... } ─ self-chrome
```

---

## Implementation Units

- U1. **Add `contained` prop to `TemplateInfoPanel`**

**Goal:** Give `TemplateInfoPanel` a boolean `contained` prop that swaps the outer wrapper between today's chrome-less `Box` (default) and a self-contained rounded `Paper` (when `true`). Existing consumer (`JourneyList`) untouched.

**Requirements:** R8

**Dependencies:** None.

**Files:**

- Modify: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx`
- Modify: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.spec.tsx`
- Modify: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.stories.tsx` (add a contained story)

**Approach:**

- Extend `TemplateInfoPanelProps` with `contained?: boolean` (default `false`). Update the JSDoc note so future readers see the two modes.
- When `contained` is `true`, render the outer element as `<Paper elevation=... sx={{ borderRadius, width, ... }}>` instead of `<Box sx={{ width: '100%' }}>`. Use design tokens already in the theme; do not invent new ones. The exact radius/elevation/width come from Figma node `39662-67865`.
- Internal layout (`Stack` header, `Divider`, accordion list) is unchanged. The prop only affects the outermost wrapper.
- Add a Storybook story exercising `contained={true}` so the visual delta is reviewable in isolation.

**Patterns to follow:**

- Existing prop typing/JSDoc style on `TemplateInfoPanelProps`.
- Story shape from `TemplateInfoPanel.stories.tsx`.

**Test scenarios:**

- Happy path: renders today's chrome-less outer element when `contained` is omitted (baseline regression).
- Happy path: renders a `Paper` wrapper with rounded corners and elevation when `contained={true}` (assert via role/test-id, not exact pixel values).
- Edge case: accordion behavior (single-expand, defaultExpanded) is unchanged across both modes — exercise the same expand/collapse interaction under both prop values.
- Edge case: passing `className` through still composes correctly under both modes.

**Verification:**

- Storybook story shows the contained card matching Figma `39662-67865` shape.
- The existing `JourneyList` consumer (which omits the prop) is unchanged visually.

---

- U2. **Build `TemplateInfoHelper` floating-disclosure component**

**Goal:** A new colocated component that owns the trigger button, the open/close state, click-outside and Escape close paths, focus trap and focus-return, and the `Fade` animation around the `TemplateInfoPanel` (rendered with `contained={true}`).

**Requirements:** R4, R5, R6, R7

**Dependencies:** U1.

**Files:**

- Create: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/TemplateInfoHelper/TemplateInfoHelper.tsx`
- Create: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/TemplateInfoHelper/TemplateInfoHelper.spec.tsx`
- Create: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/TemplateInfoHelper/TemplateInfoHelper.stories.tsx`
- Create: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/TemplateInfoHelper/index.ts`

**Approach:**

- Internal state: `open` boolean via `useState`; refs for the trigger and the panel root.
- Trigger: an MUI `IconButton` (or small `Button` with an info icon) with `aria-label`, `aria-expanded={open}`, `aria-controls=<panel-id>`. Click toggles `open`.
- Floating panel: when `open`, render `<ClickAwayListener onClickAway={handleClose}><div><Fade in unmountOnExit><FocusTrap><TemplateInfoPanel contained /></FocusTrap></Fade></div></ClickAwayListener>`. The `<div>` exists because `ClickAwayListener` requires a single ref-bearing child; mirror `CodeActionButton.tsx:133-144`.
- Escape key handling: `useEffect` that attaches a `keydown` listener to `document` while `open === true`, calls `setOpen(false)` on `Escape`, removes the listener on cleanup. (Or rely on the focus-trap primitive's keydown if it surfaces Escape.)
- On close: imperatively call `trigger.focus()` so focus returns to the button. Mirror the existing-event-handler naming (`handleOpen`, `handleClose`, `handleClickAway`).
- Z-index: set on the floating wrapper to sit above canvas nodes but below MUI modal/snackbar/menu layers — pick from `theme.zIndex` (`fab`, `speedDial`, or a slot just under `appBar`); do not invent a magic number. The exact slot is an implementation detail.
- No Apollo, no `useJourney`, no `useEditor` — the parent mount-site already gates on those.

**Patterns to follow:**

- `CodeActionButton.tsx:133-144` — `ClickAwayListener` wrapping the floating content with a single child.
- `JourneyFlow.tsx:662` — `<Fade in={...} unmountOnExit>` shape for the animation.
- Frontend rules: `handle`-prefixed event handlers, MUI components only, early returns, accessibility on interactive elements (`tabIndex`, `aria-label`, `onClick`, `onKeyDown`).

**Test scenarios:**

- Happy path: trigger renders with correct `aria-label` and `aria-expanded="false"`; clicking opens the panel; clicking again closes it; `aria-expanded` reflects state.
- Happy path: opening the helper renders `TemplateInfoPanel` with `contained={true}` (assert the chrome shape and accordion presence).
- Edge case (Escape): pressing Escape while open closes the panel and returns focus to the trigger.
- Edge case (Click outside): clicking outside the floating wrapper closes the panel and returns focus to the trigger; clicking inside it (e.g. on an accordion summary) does not close.
- Edge case (Focus trap): with the panel open, tabbing past the last focusable element returns focus to the first focusable inside the panel — not out into the canvas.
- Edge case (Initial focus): on open, focus moves into the panel (first focusable, e.g. the first accordion summary).
- Edge case (Default-collapsed on every open): closing then re-opening the panel renders all accordions collapsed — no stale expansion state across opens.
- Integration: while open, the panel mounts a `TemplateInfoPanel` (assert via the panel's `data-testid="TemplateInfoPanel"`) — confirms the wiring is real, not mocked.

**Verification:**

- Storybook story shows the open and closed states.
- Spec passes under `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage` (see `.claude/rules/running-jest-tests.md`).

---

- U3. **Mount `TemplateInfoHelper` in `JourneyFlow` paired with the analytics switch**

**Goal:** Render `TemplateInfoHelper` in the existing `<Panel position="top-left">` slot when the journey is a template and `teamTemplateCollection` is on, leaving the analytics-switch branch untouched for non-templates.

**Requirements:** R1, R2, R3

**Dependencies:** U2.

**Files:**

- Modify: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx`
- Modify: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.spec.tsx` (or whatever the spec is named — confirm during implementation)

**Approach:**

- Destructure `teamTemplateCollection` from `useFlags()` alongside the existing `editorAnalytics`.
- The existing `isTemplate` inline expression at lines 602-603 stays unchanged and becomes the load-bearing switch.
- Inside the existing `<Panel position="top-left">` slot, replace today's `!isTemplate && journey != null && editorAnalytics && (...)` block with a top-level branch:
  - When `isTemplate && teamTemplateCollection && journey != null` → render `<TemplateInfoHelper />`.
  - Otherwise, when `!isTemplate && editorAnalytics && journey != null` → render today's `AnalyticsOverlaySwitch` + Fade-wrapped `JourneyAnalyticsCard` (no behavior change).
- One Panel; conditional contents; no second Panel at the same position.
- The Panel itself remains inside the `activeSlide === ActiveSlide.JourneyFlow` guard already in place.

**Patterns to follow:**

- Existing if-else inside the same `Panel` block — mirror the structure, do not extract a sub-component.

**Test scenarios:**

- Happy path: with `journey.template === true` and `teamTemplateCollection: true`, the helper trigger renders in `JourneyFlow`; analytics switch does NOT render.
- Happy path: with `journey.team.id === 'jfp-team'` and `teamTemplateCollection: true`, helper renders (covers the global-template branch of the `isTemplate` expression).
- Happy path: with a regular journey and `editorAnalytics: true`, analytics switch renders as today; helper does NOT render.
- Edge case: `journey == null` — neither helper nor analytics switch renders (current behavior preserved).
- Edge case: `isTemplate: true` but `teamTemplateCollection: false` — helper does NOT render (and analytics switch still does not render because of the inverse `!isTemplate` guard). Confirms the new flag gate respects the rollout state.
- Edge case: `activeSlide !== ActiveSlide.JourneyFlow` — Panel is not mounted; helper not present (unchanged from today).
- Integration: open the helper from this mount-site (i.e. via `userEvent.click` on the rendered trigger) and confirm `TemplateInfoPanel` mounts — proves the wiring is end-to-end.

**Verification:**

- Visual check in the dev server: editing a template (e.g. `jfp-team` or `template: true` journey) shows the ℹ️ button top-left; editing a regular journey shows the analytics switch as today.
- Spec passes under `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage`.

---

## System-Wide Impact

- **Interaction graph:** Helper consumes the existing `Panel position="top-left"` slot in `JourneyFlow`. No other components consume that slot today, so no overlap risk. `TemplateInfoPanel`'s `JourneyList` consumer is unaffected (omits the new prop → `contained` defaults to `false`).
- **Error propagation:** No new async paths, no new GraphQL queries, no new mutations. Helper is purely local state.
- **State lifecycle risks:** The helper's `open` state lives in the component. If the user switches activeSlide while open, the parent `activeSlide === ActiveSlide.JourneyFlow` guard already unmounts the Panel, which unmounts the helper, which resets state. No leak.
- **API surface parity:** Adding the `contained` prop is non-breaking — existing call-sites omit it and get today's behavior.
- **Integration coverage:** U2 and U3 both include an integration scenario asserting `TemplateInfoPanel` actually mounts when the helper opens.
- **Unchanged invariants:** `TemplateInfoPanel`'s accordion behavior, content, single-expand semantics, and `defaultExpanded` API are untouched. `AnalyticsOverlaySwitch` and `JourneyAnalyticsCard` are untouched. `JourneyList`'s consumption of `TemplateInfoPanel` is untouched.

---

## Risks & Dependencies

| Risk                                                                                                                                                                                             | Mitigation                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MUI `FocusTrap` primitive choice — codebase has no precedent, so introducing one risks API/UX drift.                                                                                             | U2's "Deferred to Implementation" item names the candidate primitives explicitly. Resolve at implementation by inspecting installed MUI version and matching the simplest fit. If no clean primitive exists, fall back to focus-on-open + focus-return-on-close without strict trap, and note the AC partial-fulfillment for QA. |
| Z-index regressions — sitting above canvas but below modals/snackbars is a layered claim that's easy to break later.                                                                             | Use a `theme.zIndex.*` slot rather than a magic number. Add a Storybook story or spec that asserts the resulting computed `z-index` falls in the expected band.                                                                                                                                                                  |
| Two top-left affordances in the codebase risk drifting visually over time.                                                                                                                       | Both use `Fade` and live in the same Panel slot; future visual changes naturally apply to both. Capture this pairing as a `/ce-compound` learning after merge.                                                                                                                                                                   |
| Flag rename history — `teamTemplateCollection` was renamed from `templateGalleryPage` during NES-1539 (see institutional learning). If LD is renamed again, the helper silently stops rendering. | Standard LD risk; mitigated by referencing the same key the shipped `JourneyList` consumer uses — they fail or succeed together.                                                                                                                                                                                                 |
| New `contained` prop adds a configuration mode that may diverge from the templates-tab usage over time.                                                                                          | Keep the prop strictly boolean. Document the two modes in the JSDoc on `TemplateInfoPanelProps`. Resist adding further chrome modes; if a third mode emerges, the prop should be reshaped at that point.                                                                                                                         |

---

## Documentation / Operational Notes

- No new LaunchDarkly flag — `teamTemplateCollection` already exists in the dashboard. Rolling NES-1642 out means flipping the same flag that already controls the templates-tab surface.
- No migrations, no rollout sequencing, no monitoring impact.
- No copy changes — accordion content ships as-is from NES-1538. Translations already exist.
- Update the JSDoc on `TemplateInfoPanelProps.contained` to describe the two modes so future consumers can reason about it without reading the implementation.

---

## Sources & References

- Linear ticket: [NES-1642 — Tutorial info helper button in journey editor canvas (n2h)](https://linear.app/jesus-film-project/issue/NES-1642/tutorial-info-helper-button-in-journey-editor-canvas-n2h)
- Related shipped work: [NES-1538 — Add template info side panel to local template tab](https://linear.app/jesus-film-project/issue/NES-1538/add-template-info-side-panel-to-local-template-tab), PR [#9221](https://github.com/JesusFilm/core/pull/9221)
- Figma — button placement: [node 39631-61135](https://www.figma.com/design/q86gwEsOR2IQvenrhDizmP/%F0%9F%92%A1-NS---Editor--WIP-?node-id=39631-61135&m=dev)
- Figma — panel design: [node 39662-67865](https://www.figma.com/design/q86gwEsOR2IQvenrhDizmP/%F0%9F%92%A1-NS---Editor--WIP-?node-id=39662-67865&m=dev)
- Code anchors:
  - `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx:602-669`
  - `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx`
  - `apps/journeys-admin/src/components/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeActionButton/CodeActionButton.tsx:133-144`
- Institutional learning: `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md`
- Project rules consulted: `.claude/rules/frontend/apps.md`, `.claude/rules/running-jest-tests.md`
