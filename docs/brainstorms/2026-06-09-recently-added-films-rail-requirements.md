---
date: 2026-06-09
topic: recently-added-films-rail
---

# Recently Added Films Rail

## Summary

Add an automatic "Recently added" rail to the resources home page that surfaces the most recently published films, ordered by publish date, with no manual curation step — converting publishing work that already happens into a visible "this library is alive" signal.

---

## Problem Frame

New films are added to the video library a few times per month, but that work is invisible to users. The home page grid is curated through Algolia merchandising rules (`home_page` rule context), so a newly published film does not appear there unless someone manually edits the rule — and today, nobody does. There is no announcement step of any kind: no social post, no newsletter, no on-site signal. New films are only reachable via search or by scrolling the full `/watch/videos` grid, where nothing distinguishes them as new.

The cost is a vitality problem: the library is actively growing, but to any visitor it looks static. Returning visitors have no reason to believe anything has changed since their last visit.

---

## Requirements

**Rail behavior**

- R1. The home page displays a "Recently added" rail showing a small, bounded set of the most recently published videos, ordered by publish date (newest first).
- R2. The rail populates automatically from publish data — no manual curation, tagging, or Algolia rule edit is required for a film to appear.
- R3. When a new film is published, it appears in the rail without any additional human action; older titles naturally age out of the rail as newer ones arrive.
- R4. "Recently added" means recently published to the library (the existing `publishedAt` field on `Video` in the media API), not the film's production date.

**Presentation**

- R5. The rail is visibly labeled so users understand the content is new (e.g., a "Recently added" / "New" heading — final copy at implementers' discretion, translated like all other site copy).
- R6. Rail items use the existing video card presentation and link to the video's content page, consistent with other video rows on the site.
- R7. Titles, images, and metadata in the rail follow existing site localization behavior — localized where available, with existing fallbacks.

---

## Acceptance Examples

- AE1. **Covers R2, R3.** Given a new film is published to the library, when a visitor next loads the home page, the film appears at the front of the "Recently added" rail with no curation step having occurred.
- AE2. **Covers R1, R3.** Given the rail is at its display capacity, when a newer film is published, the oldest title in the rail no longer appears in it.
- AE3. **Covers R4.** Given an older film (produced years ago) is newly published to the library, it appears in the rail — recency is about publication to the library, not production date.

---

## Success Criteria

- A visitor landing on the home page can see at a glance that the library has recent additions, refreshed a few times per month without anyone on the team doing anything beyond publishing.
- A film published today is visible in the rail without any manual step (verifiable by publishing and loading the page).
- Planning can proceed without inventing product behavior: what the rail shows, how items enter and leave it, and what is out of scope are all defined here.

---

## Scope Boundaries

- No "New" badges on video cards elsewhere on the site (possible later complement).
- No dedicated "What's new" page or URL.
- No curation or admin tooling for choosing, pinning, or excluding featured new releases.
- No notifications, newsletters, social announcements, or RSS-style feeds.
- No personalization ("new since your last visit") — the rail is identical for all visitors.

---

## Key Decisions

- **Automatic over curated:** The team demonstrably does not perform manual announcement steps today, so any solution with a human in the loop inherits that failure mode. A date-driven rail converts existing publishing work into the signal with zero new ongoing obligation.
- **No editorial quality gate:** Whatever is published is presumed fit to show. If something niche or odd is published, it appears in the rail. Accepted as a deliberate trade-off for zero-maintenance operation.
- **Home page placement:** The vitality signal matters most where visitors land; the home page is the surface.
- **Bounded set, no expiry window:** The rail shows the latest N titles rather than "published within X days," so it never renders empty or stale-looking during a slow month.

---

## Dependencies / Assumptions

- The `publishedAt: Date` field exists on the `Video` type in the media API schema (verified in `apis/api-media/schema.graphql`). Assumed to be populated accurately for newly added films — worth confirming during planning.
- New-film cadence is a few per month, which keeps a date-driven rail feeling fresh to regular visitors.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R1, R2][Technical] Whether the rail is fed by the Algolia index (does the index carry a publish-date attribute, or would one need to be added?) or by a direct GraphQL query ordered by `publishedAt`.
- [Affects R1][Technical] The exact rail size (N) and its responsive presentation (carousel vs. row), following existing component patterns (`VideoCarousel` / `VideoGrid`).
- [Affects R4][Needs research] Whether `publishedAt` is reliably populated for all newly added films, and what to do for videos where it is null.
