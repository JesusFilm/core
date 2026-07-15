# Intake INDEX — bug-diagnosis retrieval entry point

Always-in-context index for **diagnosing reported bugs** (distinct from the domain map in
`CONTEXT-MAP.md`). One line per area: its domain file, its intake file, and the reporter
trigger-phrases that route a report to it. The ENG-3707 accessor fetches an area's
`CONTEXT-intake.md` on demand using this index; agents match a report's wording against
`triggers`, then open that area's intake file.

**Line format:** `area | domain: <path> | intake: <path> | triggers: …`

## Areas (NextSteps)

- **journeys-admin** (creator/editor surface) | domain: `apps/journeys-admin/CONTEXT.md` | intake: `apps/journeys-admin/CONTEXT-intake.md` | triggers: "block won't save", "changes not showing in preview", "have to refresh", "can't translate into <language>", "template won't let me customize", "transfer ownership", "analytics numbers are wrong", "historical data disappeared"
- **journeys (published viewer)** (audience surface) | domain: `apps/journeys/CONTEXT.md` | intake: `apps/journeys/CONTEXT-intake.md` | triggers: "button doesn't go to the next card", "goes to the wrong card", "video won't load", "video is slow", "image is cropped / wrong fit", "can't click / can't type on the card", "looks wrong when published", "custom domain / embed not working"

_The two intake surfaces are where bugs are **reported** (creator editor, audience viewer). The
backend (`api-journeys`) and shared kernel (`libs/journeys/ui`) are reached via each surface's
"look first" pointers, not separate intake files — reporters don't file bugs against them directly._

## Failure-type taxonomy (T1–T11)

Referenced by intake entries. Canonical source: repo-root `AGENTS.md` (routing paragraph added by
ENG-3686). Distilled from 2 years of #nextsteps-bugs history (AI Bug-Intake Playbook).

- **T1** data-semantics / nullable-column / query-filter mismatch
- **T2** auth / sign-in / session & redirect
- **T3** analytics / event mapping & counting
- **T4** cache / revalidation / stale page
- **T5** client-side state sync / optimistic-update drift
- **T6** rendering / visual / UI display
- **T7** editor / canvas block-state
- **T8** i18n / translation / language lists
- **T9** template duplication / language-id collision — _resolved by removal (#9151); reports stale_
- **T10** media / video / external-content pipeline
- **T11** permissions / ACL / data-privacy
