# Journeys

The authoring-and-delivery context. `api-journeys` owns the **Journey** — an interactive, multi-step experience built from a tree of visual blocks — from the editor that composes it to the public page that serves it. It is the source of truth for journeys, their block content, the teams that own them, and the templates they are cloned from. The audience-facing measurement side — who visits a published journey and what they do — is a separate bounded context that shares the same deployable and database: see [Journey Analytics](./CONTEXT-analytics.md). Journeys references users, languages, media, and short links by id only; those identities are owned elsewhere.

> **Product framing.** Journeys are typically **gospel-presentation / evangelism funnels** (the NextSteps product). This is not incidental branding — it is baked into the domain vocabulary: the goal labels a creator tracks are `decisionForChrist`, `gospelPresentationStart/Complete`, `prayerRequest`, and `rsvp` (see **Event Label** in the sibling [Journey Analytics](./CONTEXT-analytics.md) context). Treat "ministry funnel" as the mental model for what a Journey is *for*.

## Language

### Journey & structure

**Journey**:
The aggregate root and central entity — one interactive experience, addressable by **Slug**, owned by a **Team**, rendered from an ordered tree of **Blocks**. Moves through a **Journey Status** lifecycle and may itself be a **Template**.
_Avoid_: flow, funnel, page, site (each means something narrower here)

**Slug**:
A Journey's URL-safe public address (the path segment at `<base>/<slug>`), unique across all journeys. Generated from the title on create/duplicate; on collision the Journey's UUID is appended.
_Avoid_: path, permalink, url

**Block**:
A node in a Journey's content tree. A single `Block` table with a `typename` discriminator (single-table inheritance) specialises into 17 concrete types (see **Block Types**). Blocks nest via `parentBlockId` and sort among siblings via `parentOrder`.
_Avoid_: element, component, node, widget

**Step**:
A single screen of a Journey — the `StepBlock` — and a node in the editor's flow diagram (positioned by `x`/`y`). "Step" and "StepBlock" are the same thing; there is no separate Step entity. Steps are chained by `nextBlockId`, and a **locked** Step prevents the visitor advancing manually.
_Avoid_: slide, screen, page, card (a Card is the Step's child, not the Step)

**Card**:
The `CardBlock` — the content container inside a Step that holds the visible blocks and carries the Step's theming, background, and **Cover**. Exactly one Card per Step in normal authoring.
_Avoid_: panel, container, slide

**Containment hierarchy**:
Journey → Step (`StepBlock`) → Card (`CardBlock`) → content blocks. Question blocks nest one level deeper: RadioQuestion → RadioOption, Multiselect → MultiselectOption, GridContainer → GridItem → content.

**Cover**:
A child block (usually an Image or Video) attached to a Card via `coverBlockId` and rendered as the Card's background rather than inline; when `fullscreen` is set it renders as a blurred backdrop.
_Avoid_: background block, hero

**Journey-level image slots**:
Four special single blocks a Journey points at directly: **primary image block** (the main/social-share image), **creator image block** (the creator's picture), **logo image block** (the logo overlay), and **menu step block** (the Step used as the Journey's menu screen).
_Avoid_: featured image, thumbnail (for primary image block)

### Block types

**Block Types** (the `typename` values):
- **StepBlock** — a screen; the flow node (see **Step**).
- **CardBlock** — the content container inside a Step (see **Card**).
- **TypographyBlock** — a text element.
- **ImageBlock** — an image (with focal point, blurhash).
- **VideoBlock** — a video, sourced from `internal` (a Media video), `mux`, `youTube`, or `cloudflare`; may carry a **poster block**.
- **VideoTriggerBlock** — fires an **Action** at a set second into a video (auto-navigation).
- **ButtonBlock** — a clickable button carrying an **Action**.
- **IconBlock** — an icon, used as a child of buttons/sign-ups.
- **RadioQuestionBlock** — a single-choice poll container.
- **RadioOptionBlock** — one answer under a RadioQuestion; carries an **Action** and an optional **poll option image block**.
- **MultiselectBlock** — a multi-choice container bounded by `min`/`max`.
- **MultiselectOptionBlock** — one option under a Multiselect.
- **TextResponseBlock** — a free-text input; its `type` (**Text Response Type**) is `freeForm`, `name`, `email`, or `phone`.
- **SignUpBlock** — a name/email sign-up form carrying an **Action**.
- **SpacerBlock** — vertical spacing.
- **GridContainerBlock** / **GridItemBlock** — a flex/grid layout container and its responsive cells.

_Avoid_ inventing informal names ("text box", "poll", "form") — use the `typename`.

### Actions

**Action**:
What a block does when triggered. One Action per block, keyed 1:1 by `parentBlockId` (the block's id is the Action's primary key). Only a **ButtonBlock**, **RadioOptionBlock**, **SignUpBlock**, **VideoBlock**, or **VideoTriggerBlock** may own one. The concrete type is discriminated by which column is populated.
_Avoid_: link, handler, onClick

**Action Types**:
- **NavigateToBlockAction** — go to another block/Step within the Journey (`blockId`).
- **LinkAction** — open an external URL.
- **EmailAction** — open a mailto.
- **PhoneAction** — call or text a number (`contactAction` = `call` | `text`).
- **ChatAction** — open a messaging/chat link.

### Access & ownership

**Team**:
The ownership boundary. Everything — journeys, visitors, hosts, integrations, custom domains, QR codes — belongs to a Team, never directly to a user. `title` is the internal name members see; `publicTitle` is the name shown to visitors.
_Avoid_: organization, workspace, account, tenant

**Team membership (UserTeam)**:
A user's membership of a Team, carrying a **Team Role**. `manager` is the team admin (update/delete the team, manage memberships and invites); `member` is a collaborator who can read the team and work on its journeys.
_Avoid_: seat, org member; do not call a manager an "owner" (owner is a *journey* role)

**Journey access (UserJourney)**:
A user's direct access to one Journey, carrying a **Journey Role**: `owner` (full control), `editor` (edit and invite, but not manage roles), or `inviteRequested` (a *pending request* to join — not a granted role, and never counted as a collaborator).
_Avoid_: collaborator role, permission

> **Two role vocabularies, one authorization.** Team roles (`manager`/`member`) and Journey roles (`owner`/`editor`) are distinct axes, but they compose: a **team manager has owner-equivalent authority over every Journey in the team**, even with no `UserJourney` row. Never reason about journey permissions from the `UserJourney` alone — always fold in the caller's Team role on the owning team.

**Invite**:
An email invitation to join a Team (`UserTeamInvite`) or a single Journey (`UserInvite`). Both follow the same lifecycle: created by a sender, then `acceptedAt` or `removedAt` is stamped. Distinct from `inviteRequested`, which is the *reverse* direction (a user asking in).
_Avoid_: request (that is `inviteRequested`), share

**Publisher**:
The one platform-wide **Role** (`UserRole.roles` = `[publisher]`), independent of any Team or Journey. It gates authoring **global templates** (creating journeys for the `jfp-team`, managing any template, and featuring journeys). Surfaced in auth as `isPublisher`.
_Avoid_: admin, superAdmin (that is an api-users concept), editor

**Auth scope**:
A coarse authorization gate evaluated per request in `authScopes.ts`: `isAuthenticated` (has an email), `isAnonymous` (no email), `isPublisher`, `isSuperAdmin` (read through to the users DB, lazily), `isValidInterop` (trusted service-to-service call), `isInTeam`, `isTeamManager`, `isIntegrationOwner`. Finer owner/editor/member checks live in per-domain `*.acl.ts` files.
_Avoid_: guard, policy (reserve "ACL" for the `*.acl.ts` rules)

**Journey Profile**:
A user's per-account app state within Journeys (keyed by userId): `acceptedTermsAt`, `lastActiveTeamId` (restores team context on next login), and onboarding/feature-tour flags. Not identity — identity is owned by api-users.
_Avoid_: user profile, settings, account

### Templates & the gallery

**Template**:
A Journey flagged `template === true`: a reusable source others clone rather than an ordinary Journey. A **global template** belongs to the `jfp-team` and duplicates into a normal Journey; a **local template** belongs to a regular team and duplicates as a template again.
_Avoid_: master, blueprint, preset

**Duplicate**:
The act of deep-copying a Journey (all Steps, descendant blocks with remapped navigation, image/menu blocks, theme, customization fields, chat buttons) into a target Team. Duplicating a Template sets **fromTemplateId** on the copy so it can trace its origin.
_Avoid_: copy, fork, clone (use "duplicate" — it is the mutation and the mental model)

> **The four Journey booleans — keep them straight.**
> - **`template`** — this Journey *is* a reusable template.
> - **`templateSite`** — a companion published "site" exists for this template. Records existence only; not copied on duplicate.
> - **`website`** — this Journey renders as a multi-page website experience rather than the default single-flow journey.
> - **`customizable`** — *derived, not user-set*: whether a template exposes editable content (text, links, or media) for a duplicator to personalise. Recalculated from customization fields/flags; only meaningful when `template` is true.

**Template Gallery Page**:
A team-curated, slug-addressable **public landing page** (`/collections/<slug>`) bundling a hand-picked, hand-ordered list of template journeys for others to discover and duplicate. Has a `draft`/`published` status and its own hero **media**. Exposed publicly as the narrowed `TemplateGalleryPagePublic` / `TemplateGalleryItem` types so anonymous callers cannot traverse to team or block internals.
_Avoid_: gallery, marketplace, catalog page

**Journey Collection**:
An ordered set of a *team's own* journeys, wired to **Custom Domain** routing — an internal distribution container, not a public curation surface. Do not conflate with a Template Gallery Page: a Gallery Page markets templates to strangers; a Collection routes a team's own journeys under its domain.
_Avoid_: gallery, group, folder

### Customization & theming

**Customization Field**:
A per-Journey key/value slot for template personalisation (`JourneyCustomizationField`): `defaultValue` is the template author's fallback, `value` is the duplicator's override. The author supplies fields via the publisher-update path; the duplicator fills `value` via the user-update path.
_Avoid_: variable, placeholder, merge field

**Journey Theme**:
A per-Journey **font** override set (`headerFont`, `bodyFont`, `labelFont`) layered on top of the built-in theme. Distinct from `themeMode` (`light`/`dark`) and `themeName` (`base`), which select a built-in design theme.
_Avoid_: theme (ambiguous — say "Journey Theme" for fonts vs "theme mode/name" for the built-in)

**Host**:
A reusable, team-scoped presenter identity shown as hosting a Journey: a name (`title`), optional location, and one or two avatar images (`src1`/`src2`, supporting a paired co-host display). Attached to many journeys; rendered only when the Journey's `showHosts` is set.
_Avoid_: presenter, author, creator (creator is a separate image/description on the Journey)

**Chat Button**:
A per-Journey contact CTA pairing a **Message Platform** with a destination `link`, gated for display by the Journey's `showChatButtons`.
_Avoid_: social button, contact link

**Message Platform**:
The messaging channel a **Chat Button** or **ChatAction** points to (`facebook`, `telegram`, `whatsApp`, `instagram`, `line`, and many more, plus icon-only values). Shared vocabulary — the [Journey Analytics](./CONTEXT-analytics.md) context reuses it for a Visitor's reachable channel and `ChatOpenEvent`.
_Avoid_: channel, social network

### Distribution & routing

**Custom Domain**:
A team's vanity hostname for serving journeys. `apexName` is the registrable root used for DNS verification. `routeAllTeamJourneys` fans the domain out to every team journey by slug; when false it resolves to a linked **Journey Collection** instead.
_Avoid_: domain, host (Host is the presenter), vanity url

**QR Code**:
A scannable code that deep-links into a Journey (`toJourneyId`, optionally `toBlockId` for a specific Step), styled with colours and backed by a federated **short link** (`shortLinkId`). Its redirect URL uses the team's Custom Domain when one exists.
_Avoid_: qr, link code

### Account deletion

**Journey deletion classification**:
When a user is deleted, each Journey/Team they touch is classified as **delete** (they were the sole accessor), **transfer** (they were owner/manager and others remain, so authority passes on), or **remove** (they were a plain collaborator, so only their membership goes). Pending `inviteRequested` access never keeps a Journey alive.
_Avoid_: cleanup, purge

**User Delete Journeys Check / Confirm**:
The two-phase deletion of this context's half of an account: `Check` is a dry run returning counts and a log; `Confirm` executes it and returns the removed journey/team/membership ids. Identity itself is removed by api-users (see the Context Map).
_Avoid_: hard delete, wipe
