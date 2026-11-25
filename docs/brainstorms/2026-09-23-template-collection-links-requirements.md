---
date: 2026-09-23
topic: template-collection-links
---

# Team templates in many collections

## Summary

Let one team template belong to several collections at once. Dropping a card onto another collection offers an explicit choice between **Move here** and **Link here**, revealed over every eligible collection the moment a drag starts. One membership is the template's _home_ and draws as a normal card; every other membership is a _link_ and draws greyed. Removal is by drag to All Templates or a card menu item, and the collection dialog's template picker becomes the click-to-link path.

Interactive prototype (primary source for the interaction): https://claude.ai/artifact/Kkzg44JxjGFfzGPk2EVXKw

---

## Problem Frame

Team template collections shipped with a single-membership rule: a template can be in at most one collection. Publishers curate overlapping collections (seasonal, audience, campaign), and the same template naturally belongs in more than one. Today the only way to get it there is "Copy to collection…", which duplicates the journey. The copies then drift: an edit to one never reaches the others, and the team ends up maintaining several near-identical templates.

The constraint is not structural. The database already joins templates to collections through a many-to-many table; the single-membership rule is enforced by the assign and update mutations, by the collection dialog hiding templates owned by other collections, and by the admin UI treating drag as a pure move. The real difficulty is interaction design: drag currently carries exactly one meaning, and "All Templates" is defined as "not in any collection". Both need a new reading once a template can be in several places, without making the drag feel ambiguous or noisy.

The demand is anticipated rather than observed: the team has not yet built or been asked for a workaround. The prototype was used to find an interaction that feels right before committing.

---

## Actors

- A1. Team publisher: curates collections in the admin Collections tab, drags templates, opens the collection dialog, publishes collections.
- A2. Public gallery viewer: visits a published collection page and sees its templates. Never sees home versus link.

---

## Key Flows

- F1. Link a template into a second collection by drag
  - **Trigger:** A1 picks up a card that is already in collection A and drags it toward collection B.
  - **Actors:** A1
  - **Steps:** On drag start, every collection other than A shows two boxes over its template grid: Move here and Link here. Collection A shows nothing (dragging within A remains a reorder). A1 drops on Link here in B.
  - **Outcome:** The template is in both A and B. The card in A is unchanged; the card in B draws greyed as a link. A toast confirms.
  - **Covered by:** R1, R2, R3, R6, R7, R8, R9, R21

- F2. Move a template between collections by drag
  - **Trigger:** Same as F1, but A1 drops on Move here.
  - **Actors:** A1
  - **Steps:** As F1, choosing the Move box.
  - **Outcome:** The membership in A is gone; the template is in B with the same role it had in A (a home stays home, a link stays a link).
  - **Covered by:** R1, R2, R3, R4, R11

- F3. Remove a template from a collection
  - **Trigger:** A1 drags a card from collection A onto All Templates, or chooses "Remove from collection" in the card's menu.
  - **Actors:** A1
  - **Steps:** The membership in A is removed. If it was the home and links exist elsewhere, the oldest link becomes the home. Only when no membership remains does the template appear in All Templates.
  - **Outcome:** As above. A toast states what happened, including a promotion when one occurred.
  - **Covered by:** R12, R13, R14, R15

- F4. Link by clicking in the collection dialog
  - **Trigger:** A1 opens a collection's settings and uses the "Templates on the page" picker.
  - **Actors:** A1
  - **Steps:** The picker lists every team template, including ones in other collections. Ticking one links it into this collection (it becomes home only if it had no home). Unticking removes it under the same promotion rule.
  - **Outcome:** Saving applies the membership changes. The picker shows no home versus link distinction.
  - **Covered by:** R16, R17

---

## Requirements

**Drop interaction**

- R1. Drag remains the primary way to place a template in a collection. A drag within a template's own collection is a reorder, exactly as today, and never shows Move or Link boxes on that collection.
- R2. The moment a drag starts, every collection other than the source shows two boxes laid over its template grid, labelled **Move here** and **Link here**. The boxes are legible at rest (opaque, solid, readable labels) and do not cover the collection's header, so title, count and status remain visible during the drag.
- R3. The boxes sit flush with the outer edges of the card grid, use the same gap as the cards, and match the card corner radius, so they read as two large cards over the real ones.
- R4. Hovering a box highlights it (Move in the primary accent, Link in a neutral dark). A drop must land on a box; a drop on the collection but outside both boxes does nothing and shows a short hint toast.
- R5. When the dragged template comes from All Templates, the target collection shows a single **Add here** box. The template becomes its home there.
- R6. When the target collection already contains the dragged template, it shows a single dimmed **Already here** box. Dropping does nothing.
- R7. Collapsed collections show a slim two-box row under their header for the duration of a drag, so they remain valid drop targets.
- R8. The standing "Drag templates here" placeholder tile is removed from collections. A collection with no templates keeps a minimum-height grid area so it still has somewhere to drop.

**Home and links**

- R9. A template has at most one home. Its first placement in any collection makes that membership the home; every later placement is a link.
- R10. Home is purely presentational. No behaviour (editing, publishing, the public page, copy) depends on which membership is the home.
- R11. Moving a membership keeps its role: moving the home makes the destination the home; moving a link keeps it a link.
- R12. Removing a membership that is the home, while links remain, promotes the oldest remaining link to home.
- R13. Only when a template has no membership at all does it appear in All Templates. All Templates keeps its current meaning of "not in any collection", including its sort and bulk actions.
- R14. Dropping a card on All Templates always means "remove from the collection it was picked up from". If other memberships remain, the template does not appear in All Templates; the toast says where the home now is.
- R15. Each card inside a collection has a menu item **Remove from collection** with the same semantics as R14. There is no hover remove control on the card.

**Collection dialog picker**

- R16. The "Templates on the page" picker lists every team template, including templates that belong to other collections. Selecting one links it into this collection; deselecting one removes it under R12.
- R17. The picker shows no home versus link distinction.

**Card appearance**

- R18. In a collection, a home card draws as today. When it has links elsewhere, it shows a quiet chip such as "Also in 2 more".
- R19. A link card draws with a light grey veil over the whole card and a chip such as "Linked from Easter 2026" naming the home collection. Final chip copy is decided at build time.
- R20. In All Templates, cards draw as today (they are by definition in no collection).

**Public page and other surfaces**

- R21. Published collection pages render links identically to homes. Nothing on the public page changes.
- R22. Linking and moving into a published collection is allowed, as moving is today.
- R23. Ungrouping a collection removes all its memberships; any home in it with links elsewhere promotes under R12.
- R24. The card menu item **Copy to collection…** and its dialog are removed. The cross-team **Copy to…** action is unchanged.

**Data and analytics**

- R25. Each membership row records whether it is the home and when it was created. All existing rows become homes, which is exactly true under single membership today. No other data migration.
- R26. Move, link and remove are three explicit operations on the API, each applying the home and promotion rules in one transaction. The current assign operation and its single-membership guard are retired, and the collection update operation stops rejecting templates that belong to other collections.
- R27. The existing drag analytics event gains a move or link mode. Link via the picker, remove via the menu, and remove via drag each get their own event.

---

## Acceptance Examples

- AE1. **Covers R2, R4, R9.** Given template T is only in collection A, when the user drags T over collection B and drops on Link here, T is in A (home, crisp) and B (link, greyed).
- AE2. **Covers R11.** Given T is home in A and a link in B, when the user drags the link card in B to collection C and drops on Move here, T is home in A and a link in C, and no longer in B.
- AE3. **Covers R12, R14.** Given T is home in A and a link in B, when the user drags the card in A onto All Templates, T is no longer in A, the card in B becomes the crisp home, T does not appear in All Templates, and the toast says the home is now B.
- AE4. **Covers R13, R14.** Given T is only in A, when the user drags the card in A onto All Templates, T appears in All Templates and in no collection.
- AE5. **Covers R5.** Given T is in no collection, when the user drags T from All Templates over collection A, only an Add here box shows; dropping makes T the home in A.
- AE6. **Covers R6.** Given T is in A, when the user drags T from B over A, A shows a single dimmed Already here box and dropping changes nothing.
- AE7. **Covers R1.** Given T is in A, when the user drags T within A, no boxes appear on A, and dropping reorders A as today.
- AE8. **Covers R4.** Given a drag in progress, when the user drops on collection B's grid but between the two boxes, nothing changes and a hint toast appears.
- AE9. **Covers R16, R12.** Given T is home in A, when the user opens B's settings, ticks T and saves, T is a link in B and still home in A. When the user then opens A's settings, unticks T and saves, T becomes home in B.
- AE10. **Covers R7.** Given collection B is collapsed, when a drag starts, B shows a slim Move here / Link here row under its header and accepts drops there.
- AE11. **Covers R21.** Given T is a link in published collection B, when a visitor opens B's public page, T appears exactly like every other template.
- AE12. **Covers R23.** Given T is home in A and a link in B, when A is ungrouped, T becomes home in B.

---

## Success Criteria

- A publisher can put one template in several collections without duplicating it, and an edit to the template shows in every collection.
- In a first drag, a publisher can tell which drop means Move and which means Link before dropping, and the collection they are aiming at stays identifiable.
- After any move, link or remove, the admin page shows the resulting membership without a manual refresh, and the toast matches what happened.
- Planning can proceed without inventing product behaviour: every membership transition is covered by an acceptance example above.

---

## Scope Boundaries

- No "make this the home" action. Home follows the first-placement and promotion rules only.
- All Templates is not turned into a full library view. Noted as a possible follow-up, not planned.
- No keyboard drag. The dialog picker (R16) and the menu item (R15) are the non-pointer paths.
- No change to the public gallery page, its ordering, or its filtering.
- No change to template editing, publishing, translation, or the cross-team Copy to… flow.
- No new feature flag. Ships under the existing Collections tab flag.
- Reordering within a collection is untouched.

---

## Key Decisions

- **Split drop revealed on drag start, over the grid only.** Alternatives tried in the prototype: a strip under the grid that splits on hover, and an end-of-grid slot that splits. Both put the affordance where the card lands, which hides the Move or Link choice at the moment it matters. Revealing across every eligible collection, header left visible, was clearly better.
- **Home is visual only.** A crisp card versus greyed links gives publishers a sense of where the "real" one lives without adding behaviour. Keeping it presentational keeps the rules to two: first placement is home, removal promotes the oldest link.
- **All Templates keeps meaning "not in any collection".** Least change, and drag-to-All-Templates keeps a single meaning (remove from this collection).
- **Remove lives in the card menu, not a hover control.** The card already has a menu; hover does not exist on touch.
- **The collection dialog picker is the click-to-link path.** It already exists and only needs to stop hiding other collections' templates. No new "Add to collection…" dialog.
- **Copy to collection… is removed.** Linking replaces its main use. The translate-a-copy variant goes with it; the cross-team Copy to… covers duplication.
- **Three explicit API operations.** Move, link and remove each name their source and target. Retiring assign avoids overloading one mutation with mode flags and a null-means-remove convention.
- **No new flag.** The single-membership rule has to change server-side for everyone; two drag behaviours side by side is more code and QA than it saves.

---

## Dependencies / Assumptions

- Demand is anticipated, not yet observed; the prototype is the validation to date.
- Existing single-membership data maps cleanly to "every membership is a home".
- Collection pages are read-time filtered to published, same-team templates; links inherit that filtering unchanged.
- The prototype's interaction is the reference for feel. Where the spec and the prototype disagree, the spec wins.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R2, R7][Technical] How the reveal overlay coexists with the existing nested droppables and the collapsed-collection header drop target in the current drag wiring.
- [Affects R12, R25][Technical] Whether "oldest link" is ordered by membership creation time or by an explicit sequence, given concurrent edits.
- [Affects R16][Technical] Whether the dialog's save should issue the new link and remove operations per change, or keep a whole-list update that applies the home and promotion rules server-side.
- [Affects R18, R19][Copy] Final chip wording and whether the link chip names the home collection or just says "Linked".
- [Affects R26][Needs research] Any other callers of the assign operation outside the drag handler (worker, scripts, e2e).
