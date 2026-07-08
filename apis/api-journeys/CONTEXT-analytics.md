# Journey Analytics

The audience-and-measurement context. It owns the *other* side of a Journey: not who builds it, but who **visits** it and what they do. It records every visitor interaction with a published Journey, aggregates that into per-team and per-journey audience views, measures it against conversion goals, and pushes captured responses out to external systems. It shares the `api-journeys` deployable and the journeys database with the [Journeys](./CONTEXT.md) authoring context, but is a distinct bounded context: it references a **Journey**, **Block**, and **Team** by id and never authors them.

> **Ministry measurement.** This context is where the evangelism-funnel purpose becomes measurable. The conversions worth counting are gospel-oriented — a **decision for Christ**, a completed gospel presentation, a prayer request, an RSVP — and the goal vocabulary (**Event Label**, Plausible capture goals) names them directly. See the product framing in [Journeys](./CONTEXT.md).

## Language

### Audience

**Visitor**:
An anonymous audience member of a Team's *published* journeys — the person who opens and interacts with a Journey in a browser, not a logged-in creator. Team-scoped: unique on `(teamId, userId)`, so the same person is a distinct Visitor per Team. An admin triages a Visitor with a **Visitor Status**, free-text `notes`, and a reachable **Message Platform**.
_Avoid_: user, lead, contact, session, audience member (informal)

> **The `userId` trap (hazard).** A Visitor's `userId` is **not** a creator/admin user — it is the anonymous end-user's device/session identity captured on the public frontend. In the [Journeys](./CONTEXT.md) context `user`/`userId` means the *logged-in creator* (a Firebase UID). These are different identity spaces: never join a Visitor's `userId` to a `UserJourney`/`UserTeam` userId, and never resolve it against the users context. Always say which `userId` you mean.

**Journey Visitor**:
The per-Journey slice of a Visitor (unique on `(journeyId, visitorId)`): the same person's activity *within one Journey*, where a Visitor aggregates them across the whole Team. Carries denormalised `last*` snapshots (last step viewed, last chat, last text/radio/multiselect response) and counters (`duration`, `activityCount`) so admin lists sort and display without scanning the event stream.
_Avoid_: visit, session, participant, engagement

**Visitor Status**:
A manual triage label an admin assigns to a Visitor, expressed as emoji-style tokens (`star`, `thumbsUp`, `prohibited`, `warning`, `partyPopper`, …). Always human-set, never automatic.
_Avoid_: state, tag, rating, disposition

### Events

**Event**:
The immutable record of one visitor action — the fact stream this context is built on. A single `Event` table with a `typename` discriminator (single-table inheritance, mirroring **Block**) specialising into the concrete event types.
_Avoid_: hit, log, action (an **Action** is a block behaviour in the Journeys context, not a recorded fact), interaction

**Event types** (the `typename` values):
- **JourneyViewEvent** — the Journey was opened/loaded (deduped to once per day per visitor).
- **StepViewEvent** / **StepNextEvent** / **StepPreviousEvent** — a Step was viewed, or the visitor navigated forward/back.
- **ButtonClickEvent** — a button was clicked (carries the button's `ButtonAction`).
- **ChatOpenEvent** — a chat widget was opened (carries the **Message Platform**).
- **RadioQuestionSubmissionEvent** — a single-choice poll option was selected.
- **MultiselectSubmissionEvent** — a multi-select answer was submitted.
- **TextResponseSubmissionEvent** — free text (or a name/email/phone response) was submitted.
- **SignUpSubmissionEvent** — a sign-up form (name + email) was submitted.
- **VideoStart / Play / Pause / Complete / Expand / Collapse / ProgressEvent** — video playback lifecycle and milestone (`progress` = 25/50/75) events.

**Submission event**:
The four `*SubmissionEvent`s (RadioQuestion, Multiselect, TextResponse, SignUp) — the events that capture a visitor *response* rather than a view or navigation. These are the rows surfaced in data exports and pushed to integrations.
_Avoid_: response event (acceptable informally), conversion (a conversion is goal-defined, see **Event Label**)

**Event Label**:
A goal tag set on a block (`BlockEventLabel`) marking what that block's event *means* for conversion tracking: `decisionForChrist`, `gospelPresentationStart`/`Complete`, `prayerRequest`, `rsvp`, `inviteFriend`, `share`, `specialVideoStart`/`Complete`, and `custom1`–`3`. This is the evangelism-funnel goal vocabulary; the Plausible capture goals mirror it.
_Avoid_: goal (reserve for the Plausible side), tag (a `JourneyTag` is unrelated), category

### Measurement

**Plausible**:
The privacy-friendly web-analytics service this context wraps for aggregate stats (visitors, visits, pageviews, bounce rate, visit duration, conversion rate, …). Each Team/Journey has a `plausibleToken` scoping queries to its provisioned Plausible site; journey events map to Plausible custom goals — including the evangelism **capture goals** (`christDecisionCapture`, `gospelStartCapture`, `gospelCompleteCapture`, `prayerRequestCapture`, `rsvpCapture`) that mirror **Event Label**.
_Avoid_: analytics (too broad), stats, GA

**Capture goal**:
A named Plausible goal that counts an evangelism conversion (e.g. `christDecisionCapture`). The Plausible-side counterpart of an **Event Label**.
_Avoid_: conversion, funnel step

**Journey Events Export Log**:
An audit entry recording that a user exported a Journey's events — who, which Journey, the event-type filter, and the date range. It is the *record that an export happened*, not the exported file (the CSV is generated on demand and not stored).
_Avoid_: export, report, download

### Data outflow

**Integration**:
A team-level connection to an external service holding encrypted credentials (`IntegrationType` = `google` | `growthSpaces`). It is the conduit by which captured audience data leaves this context. **IntegrationGoogle** is an OAuth link to a Google account (for Sheets/Drive); **IntegrationGrowthSpaces** connects Growth Spaces, a downstream lead-routing / follow-up service.
_Avoid_: connection, plugin, app, webhook

**Google Sheets Sync**:
Configuration that exports a Journey's visitor/response data into a specific Google Sheet (`spreadsheetId`, `sheetName`, `timezone`), tied to a Journey, Team, and Google **Integration**. Supports one-off backfill and continuous live sync.
_Avoid_: export, sync (unqualified), spreadsheet export

**Route** (Growth Spaces):
A destination within the Growth Spaces service (`{ id, name }`) to which a Journey's captured sign-ups/leads are pushed for follow-up. Fetched live from Growth Spaces via the **Integration**'s credentials.
_Avoid_: endpoint, list, campaign
