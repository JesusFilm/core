---
title: AI Chat Editor — Low Priority Findings
type: review
status: backlog
date: 2026-03-19
parent: 2026-03-18-001-feat-ai-chat-journey-editor-plan.md
---

# Low Priority Findings

Review findings from the plan & design review that are nice-to-have improvements. These do not block implementation but should be addressed post-MVP.

## L1: Keyboard navigation for canvas card selection

**Source:** UX Review

No keyboard navigation support for selecting cards on the canvas. Tab order through the interface is undefined. Card selection (click to select, Escape to deselect) needs keyboard equivalents (arrow keys to navigate between cards, Enter to select as context).

**Recommendation:** Define Tab order: toolbar → canvas cards (arrow key navigation) → chat input → send button. Add `role="listbox"` to canvas, `role="option"` to card nodes.

---

## L2: First-time user onboarding tooltip

**Source:** UX Review

Plan mentions a "first-time tooltip on the AI Editor button" but no mockup exists. Beyond empty state suggestion chips, there is no progressive guidance for first-time users.

**Recommendation:** Add a tooltip/coach mark sequence on first visit: (1) "This is your journey canvas" pointing to cards, (2) "Describe what you want here" pointing to chat input, (3) "Or try a suggestion" pointing to chips. Store `hasSeenAiEditorOnboarding` in localStorage.

---

## L3: Complete PlanOperation schema for all 10 tool variants

**Source:** AI Review

The `PlanOperation` discriminated union only shows 2 of 10 tool variants in full. The rest is `// ... etc for each tool`. While the surgical tool specs describe behavior, the actual Zod schemas for `update_block`, `delete_block`, `add_block` args need full type definitions.

**Recommendation:** Write out all 10 variants with complete `args` objects before Phase 1 implementation begins.

---

## L4: Multiselect limitations in system prompt

**Source:** AI Review

Multiselect options are `string[]` with no actions, but the system prompt doesn't explain this. The AI might try to add navigation actions to multiselect options and fail at Zod validation.

**Recommendation:** Add to system prompt: "Multiselect options are text-only — they do not support navigation actions. Use poll blocks for options that need to navigate to different cards."

---

## L5: BYOK stolen key prevention

**Source:** Security Review

No way to prevent use of a stolen Anthropic API key. The application validates the key works but not that it belongs to the user.

**Recommendation:**
- Add ToS checkbox: "I confirm this API key belongs to me"
- Log IP + userId on key registration
- Store key hash to detect same key registered by multiple users
- Monitor for unusual patterns
