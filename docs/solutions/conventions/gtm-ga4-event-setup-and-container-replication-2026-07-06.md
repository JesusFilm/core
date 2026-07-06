---
title: GTM/GA4 event setup and container replication across environments
date: 2026-07-06
category: conventions
module: journeys-admin
problem_type: convention
component: tooling
severity: medium
applies_when:
  - "Adding new GTM/GA4 analytics events to any app in this repo"
  - "Replicating GTM container changes from the Dev container to Stage/Prod"
  - "Debugging Tag Assistant preview connection failures against localhost"
tags: [gtm, ga4, analytics, tag-assistant, container-export, measurement-id, template-gallery]
---

# GTM/GA4 event setup and container replication across environments

## Context

NES-1698 added 13 `team_collection_*` GTM events for the template gallery collection workflow (PR #9345). It was the first full walk-through of the analytics playbook in `apps/docs/docs/03-basics/06-analytics.md` by someone other than its author, and it surfaced event-design decisions, GTM container-replication traps, and local-testing gotchas that the guide doesn't cover.

## Guidance

### Event design

- **Prefix events by feature** (e.g. `team_collection_`) so they group together in GA4's flat event list.
- **GA4 hard limits shape names**: event names max **40 chars** (`team_collection_template_added_in_dialog` is exactly 40 — leave headroom when possible); parameter values max **100 chars** (send an embed *hostname* like `www.youtube.com`, never a full URL).
- **Distinct event names vs a `location` param**: use distinct names per UI surface when you want surfaces compared as top-level rows in GA4 (the three preview events); use one event + param when a single total with occasional breakdown is enough (copy-link).
- **Fire on confirmed success**, not intent: after the mutation resolves (create/publish), after the server accepts a drag-drop, and once per save-that-changed-a-field rather than per keystroke.
- **Code pattern** (from NES-1662): a typed helper file per feature in `apps/<app>/src/libs/send<Thing>Event/` wrapping `sendGTMEvent` from `@next/third-parties/google`, with a vitest spec. Example: `apps/journeys-admin/src/libs/sendCollectionEvent/`.
- **In GTM tags, map only the params that event actually sends.** GTM's dataLayer model merges across pushes, so an unmapped-but-stale key from an earlier event would silently attach old values.

### Replicating a container change Dev → Stage → Prod

There are three GTM containers (Dev, Stage, Prod), each with its own `GA4 Measurement ID` constant that all GA4 tags reference by name.

- **The GA4 Measurement ID is the SAME for Dev and Stage, but DIFFERENT in Prod.** A Dev→Stage import that accidentally carries the constant is therefore harmless-by-coincidence, but the same mistake Dev→Prod repoints tags at the wrong GA4 property. Never rely on the coincidence: **always exclude `GA4 Measurement ID` from container exports** (and any tag that hardcodes a `G-…` ID instead of referencing the constant).
- Export via **Admin → Export Container**. Select-all is fine *if* you then untick the Measurement ID constant — one untick beats hand-picking 30+ items and risking a missed one.
- Import via **Admin → Import Container → Merge**. Neither conflict mode protects you from including the constant:
  - **Overwrite conflicting** replaces the target's differing items — Stage/Prod's Measurement ID gets Dev's value, and *every* tag in that container starts reporting to the wrong property.
  - **Rename conflicting** keeps the target's items but imports Dev's as `… 2` copies **and rewires the imported tags to reference the renamed copies** — new tags silently report to the wrong property. For tags it's worse: a renamed duplicate fires alongside the original on the same trigger and double-counts.
- **Read the import preview before confirming.** Expect exactly `N added, 0 modified, 0 deleted`. Anything "modified" means the containers have drifted on that item — cancel, inspect the diff, and exclude it from the export rather than letting the import "fix" it. (Real example: `get teams` and `template use` tags disagreed on Measurement ID between Dev and Stage — pre-existing drift, excluded and flagged for follow-up.)
- Use the same version name across all three containers (e.g. `Team Collection GTM events (NES-1698)`) so the change is easy to correlate in version history.

### Testing locally with Tag Assistant (journeys-admin)

- `NEXT_PUBLIC_GTM_ID` comes from the Doppler-generated `.env` (`nx run journeys-admin:fetch-secrets`). The Cursor dev container serves its own clone at `/workspaces/core` with its own `.env` — host-side worktrees and checkouts don't share it.
- `GoogleTagManager` from `@next/third-parties` injects its script **client-side after hydration** — you cannot verify GTM presence by curling the HTML. Check in the browser console instead: `Object.keys(window.google_tag_manager || {})` should list the container ID.
- A **"307 Internal Redirect"** status on the `gtm.js` request in DevTools means a browser extension (uBlock-style) swapped it for a neutered stub — GTM never registers and Tag Assistant can't connect. Allow-list localhost in the extension.
- journeys-admin's auth redirect (`/` → `/users/sign-in?redirect=%2F`) **strips the `gtm_debug` param** Tag Assistant appends. Sign in first, then connect Preview — or connect directly to a non-redirecting URL.
- The Tag Assistant handshake also needs third-party cookies allowed (exception for `tagassistant.google.com`).

## Why This Matters

A wrong Measurement ID doesn't error — it silently sends one environment's analytics into another environment's GA4 property, corrupting both datasets in a way nobody notices until reports look off. The rename-conflicting rewire and tag double-firing are equally silent. And the local-testing gotchas (client-side injection, ad-block 307, auth redirect eating `gtm_debug`) each present as "Tag Assistant won't connect" with no error message, burning an hour if you don't know the sequence to check.

## When to Apply

- Adding GTM/GA4 events: follow the event-design rules and the `send<Thing>Event` helper pattern.
- Promoting GTM config between containers: follow the export/exclude/merge/preview procedure — especially Dev→Prod, where the Measurement ID actually differs.
- Tag Assistant won't connect locally: check, in order — container ID matches the workspace being previewed, `gtm.js` loads (console keys check), extension blocking (307 internal redirect), auth redirect (sign in first), third-party cookies.

## Examples

- Event helper + spec: `apps/journeys-admin/src/libs/sendCollectionEvent/sendCollectionEvent.ts`
- Setup walkthrough (dlvs → triggers → tags → preview → publish): `apps/docs/docs/03-basics/06-analytics.md`
- Full event/param/trigger inventory for this feature: PR #9345 description

## Related

- NES-1698 (this work), NES-1662 (original analytics pattern, `sendImageUploadEvent`)
- Follow-up: `get teams` / `template use` tags have drifted between Dev and Stage GTM containers (one likely reports to the wrong property today)
