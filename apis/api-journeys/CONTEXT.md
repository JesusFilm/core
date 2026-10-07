# Journeys

The authoring-and-delivery context. `api-journeys` owns the **Journey** — an interactive, multi-step experience built from a tree of visual blocks — from the editor that composes it to the public page that serves it. It is the source of truth for journeys, their block content, the teams that own them, and the templates they are cloned from. The audience-facing measurement side — who visits a published journey and what they do — is a separate bounded context that shares the same deployable and database: see [Journey Analytics](./CONTEXT-analytics.md). Journeys references users, languages, media, and short links by id only; those identities are owned elsewhere.

> **Product framing.** Journeys are typically **gospel-presentation / evangelism funnels** (the NextSteps product). This is not incidental branding — it is baked into the domain vocabulary: the goal labels a creator tracks are `decisionForChrist`, `gospelPresentationStart/Complete`, `prayerRequest`, and `rsvp` (see **Event Label** in the sibling [Journey Analytics](./CONTEXT-analytics.md) context). Treat "ministry funnel" as the mental model for what a Journey is _for_.

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
_Avoid_: seat, org member; do not call a manager an "owner" (owner is a _journey_ role)

**Journey access (UserJourney)**:
A user's direct access to one Journey, carrying a **Journey Role**: `owner` (full control), `editor` (edit and invite, but not manage roles), or `inviteRequested` (a _pending request_ to join — not a granted role, and never counted as a collaborator).
_Avoid_: collaborator role, permission

> **Two role vocabularies, one authorization.** Team roles (`manager`/`member`) and Journey roles (`owner`/`editor`) are distinct axes, but they compose: a **team manager has owner-equivalent authority over every Journey in the team**, even with no `UserJourney` row. Never reason about journey permissions from the `UserJourney` alone — always fold in the caller's Team role on the owning team.

**Invite**:
An email invitation to join a Team (`UserTeamInvite`) or a single Journey (`UserInvite`). Both follow the same lifecycle: created by a sender, then `acceptedAt` or `removedAt` is stamped. Distinct from `inviteRequested`, which is the _reverse_ direction (a user asking in).
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
>
> - **`template`** — this Journey _is_ a reusable template.
> - **`templateSite`** — a companion published "site" exists for this template. Records existence only; not copied on duplicate.
> - **`website`** — this Journey renders as a multi-page website experience rather than the default single-flow journey.
> - **`customizable`** — _derived, not user-set_: whether a template exposes editable content (text, links, or media) for a duplicator to personalise. Recalculated from customization fields/flags; only meaningful when `template` is true.

**Template Gallery Page**:
A team-curated, slug-addressable **public landing page** (`/collections/<slug>`) bundling a hand-picked, hand-ordered list of template journeys for others to discover and duplicate. Has a `draft`/`published` status and its own hero **media**. Exposed publicly as the narrowed `TemplateGalleryPagePublic` / `TemplateGalleryItem` types so anonymous callers cannot traverse to team or block internals.
_Avoid_: gallery, marketplace, catalog page

**Journey Collection**:
An ordered set of a _team's own_ journeys, wired to **Custom Domain** routing — an internal distribution container, not a public curation surface. Do not conflate with a Template Gallery Page: a Gallery Page markets templates to strangers; a Collection routes a team's own journeys under its domain.
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
A team's vanity hostname for serving journeys. `apexName` is the registrable root used for DNS verification. `routeAllTeamJourneys` fans the domain out to every team journey by slug; when false it resolves to a linked **Journey Collection** instead. It may additionally name a **Campaign Root**, which claims the domain's `/` and region paths while journeys keep `/<slug>`.
_Avoid_: domain, host (Host is the presenter), vanity url

**QR Code**:
A scannable code that deep-links into a Journey (`toJourneyId`, optionally `toBlockId` for a specific Step), styled with colours and backed by a federated **short link** (`shortLinkId`). Its redirect URL uses the team's Custom Domain when one exists.
_Avoid_: qr, link code

### Campaigns

**Campaign**:
A team-owned seasonal campaign site: a landing page plus one page per **Campaign Region**, built from **Campaign Blocks**, pointing visitors at published Journeys. Has a draft/published status like a Template Gallery Page.
_Avoid_: site, microsite, landing page (that is one of its pages)

**Campaign Page**:
One of the two pages a Campaign has: the landing page, or the **Region Page** that every Campaign Region renders. A Campaign never has more pages than these two.
_Avoid_: screen, view, region's page (a region has no page of its own)

**Campaign Block**:
A node in a Campaign's content tree — the Campaign counterpart of **Block**: one table, a `typename` discriminator, nesting by parent and sibling order, every row scoped to its Campaign and to at most one of a Campaign Page or a Campaign Region. Typenames are prefixed `Campaign` (`CampaignHeroBlock`, `CampaignVideoBlock`, …) so they never collide with Journey block types.
_Avoid_: block (bare, where a Journey Block could be meant), element, widget

**Campaign Section**:
A top-level Campaign Block on a Campaign Page: one full-width band. Eleven typenames: Hero, Region Switcher, Region Header, Region Share, Featured Media, Journey List, Video Carousel, Analytics, Rich Text, Columns, Image. Every section carries a **Section Background** and optional heading / text / button / button-text / accent colour overrides, and may hold **Extras**. Sections have no built-in call to action; a button is always an Extra. The **Campaign Chrome** blocks share a section's styling and children but are not sections.
_Avoid_: block (for a section), row, band, panel, module

**Section Body**:
The typed, fixed part of a Campaign Section that lives on the section's own row (its eyebrow, title, lede, media slot, and so on) rather than as child blocks. Extras render above or below it.
_Avoid_: content, fields, inner blocks

**Section Background**:
What a Campaign Section sits on: nothing, the theme surface, the contrast band, the primary colour, a custom colour, or an image. An image background is an owned cover block with a light / medium / heavy overlay, as a Card owns its **Cover**.
_Avoid_: backdrop, cover (reserve for the owned image itself)

**Column Slot**:
One of exactly two fixed cells of a Columns section, each holding at most one Campaign Section. A slot may be empty; a Columns section and a Region Share section may not sit in a slot. Mirrors GridContainer → GridItem.
_Avoid_: column (ambiguous with the Columns section), cell, pane

**Media Slot**:
The single owned video or image of a Hero or Featured Media section, held apart from the section's Extras the way a Card holds its Cover.
_Avoid_: hero video, featured image, poster

**Extra**:
A **Campaign Typography** or **Campaign Button** block added as a child of a Campaign Section, placed above or below the **Section Body** by its **Placement** and ordered among its siblings like any Block. Only these two typenames may be section children.
_Avoid_: addon, child block (too broad), inline block

**Placement**:
Which side of the Section Body an Extra renders on: `above` or `below`. Sibling order is still one sequence across both sides.
_Avoid_: position, slot, side

**Protected Block**:
A Campaign Block the structural mutations refuse with `CONFLICT`: the header and footer (a campaign has exactly one of each, so a second is refused on create too), a **Column Slot**, and the two Campaign Pages themselves. A protected block is edited and styled like any other but is never deleted, moved or duplicated. Every other section and Extra is added, moved (`campaignBlockOrderUpdate`), duplicated with its subtree (`campaignBlockDuplicate`), soft-deleted and restored by the editor's structural Commands.
_Avoid_: locked, fixed block, system block

**Campaign Typography**:
The campaign text block. Size, display-versus-body font and weight are not separate settings: the typography **variant** (core's h1 … overline ladder) decides all three through the theme, with an optional alignment and hex colour.
_Avoid_: text block (bare), heading, paragraph, label

**Campaign Button**:
The campaign call-to-action block: a translated label, core's button variant and size, optional alignment and two hex colours (fill or border, and label), and a Campaign Action. Corner shape belongs to the theme.
_Avoid_: CTA, link button, action button

**Campaign Action**:
What a Campaign Button does when pressed, one row per button keyed by the button and resolved by its populated column like **Action**: a web link (`CampaignLinkAction`, https url), a scroll to a block on the same page (`CampaignScrollToBlockAction`, `blockId`), or a navigation to a Campaign Region (`CampaignNavigateToRegionAction`, `regionId`, set null when the region is deleted). GraphQL typenames carry the `Campaign` prefix because `LinkAction` already names the Journey kind.
_Avoid_: link (bare), href, navigation

**Campaign Status**:
Whether a Campaign is `draft` or `published`. Status is the only public gate: a draft is never served, a published campaign is served as it is right now. `publishedAt` records the first publish and is never cleared by unpublishing, so it means "first went live", not "currently live". Publish and unpublish are explicit actions, never undo steps; nothing on a Campaign is locked by its status. `campaignPublish` and `campaignUnpublish` are Manage-only, idempotent, and queue one revalidate job per public page path (landing and every region) through the revalidate worker's `paths[]` job; content mutations queue nothing.
_Avoid_: live/offline (use published/draft), visibility, state

**Live Editing**:
How a Campaign is edited: every edit saves in place as its own mutation, with no working copy, snapshot or Save step, so a published Campaign changes under its visitors as the author works, within the public page's refresh window. Undo is the Editor's in-memory **Command** history, not a saved version.
_Avoid_: autosave (as a feature name — it is the only mode), draft mode, preview mode, versioning

**Campaign Settings**:
The two fields of a Campaign that are not content: the default-language title and the slug, written by `campaignUpdate` (campaign Update) outside the Editor's Command history. The slug is validated as an author slug (pattern, 200 characters, the reserved list, global uniqueness) and never follows a title change. `campaignDelete` (campaign Delete, managers only) hard-deletes the row and lets the database cascade take the blocks, actions, pages, languages, theme, strings and regions; a Custom Domain naming it as Campaign Root is released, and the linked Journeys and their QR codes are untouched.
_Avoid_: metadata, properties, campaign info

**Campaign Region**:
A Campaign's regional subdivision (for example AFR, EUR), shown on the shared **Region Page** at its own address, with a required translated **name**, a slug unique within the Campaign, an ordered set of **Region Countries**, and per language a linked Journey to share. The name is its identity everywhere (page selector, breadcrumbs, translations, share copy, analytics scope); the slug is only its address. A region is **listed** when it appears on the Region Switcher; an unlisted region keeps an **Orphan Page**. Regions are hard-deleted with everything they own, and only once unlisted.
_Avoid_: country, market, locale, key (for the slug)

**Region Country**:
One country shown as a chip on a Campaign Region's card, referenced by its `api-languages` Country id so flag and translated name come from the owner. Presentation and a future country-to-region lookup; not identity.
_Avoid_: flag, chip (as the data name), territory

**Orphan Page**:
The address of a Campaign Region that has been unlisted from the Region Switcher: the shared Region Page is still served there and the region is still editable, just unreachable from the switcher. Deleting a region is offered only from its Orphan Page.
_Avoid_: hidden page, archived page, draft page

**Region Line**:
An optional, purely presentational text line (a short code, a tagline) shown under a Campaign Region's name on its switcher card and region header. A line is an ordinary **Campaign Typography** block scoped to the region rather than to a page, with nothing extra; it never names the region.
_Avoid_: label, caption, subtitle, name

**Region Page**:
The Campaign's single region-page layout, rendered once per Campaign Region. Every region shows the same sections and the same text; what differs is the region's own rows — its name, lines, countries, and the linked Journey per language. There are no per-region copies of this page, so an edit to it reaches every region at once.
_Avoid_: region template, shared layout, customised page (there is none), per-region page

**Campaign access**:
Who may do what to a Campaign, decided by the caller's **Team Role** on the owning Team and nothing else: any member or manager creates, reads and edits a Campaign and everything inside it (blocks, regions, pages, languages, theme, translation); only a manager publishes, unpublishes, deletes it, or makes it a Custom Domain's root. Every change to a part of a Campaign is authorised through the Campaign as its aggregate root, as a Block change is authorised through its Journey. Linking a Journey from another Team needs no rights there — it is a read of public data — and grants none; QR codes, short links and traffic reads about linked Journeys are the Campaign's Team's own.
_Avoid_: campaign role (there is no such role; reuse Team Role), owner (a journey role), publisher (gates templates, irrelevant here)

**Campaign Public**:
The narrowed read of a published Campaign served to anonymous visitors, like the public Template Gallery Page: status is the only gate and nothing on it leads to the Team, its members or linked-Journey internals. Read by `campaignPublic(slug | hostname, languageId)`: exactly one key, no auth, draft or unknown is `NOT_FOUND`; every Translated Field arrives resolved through `resolveText` (requested language → default column → empty), blocks come as flat lists per page plus the chrome, and each region carries its Share Languages with the linked journey's live status and resolved addresses. `hostname` resolves through a Campaign Root once that lands.
_Avoid_: public campaign (as a status), published view, visitor API

**Campaign Address**:
Where a Campaign is served. Every published Campaign always answers at its permanent address on the **Root Domain** (`/campaign/<slug>`, region pages one segment deeper). When a Custom Domain names it as its **Campaign Root**, the same pages also answer at that domain's root and `/<region slug>`, and the linked Journeys at `/<journey slug>` beside them. The Campaign stores no address of its own; a domain change moves nothing.
_Avoid_: campaign URL (ambiguous between the two forms), vanity link, permalink

**Campaign Root**:
A Custom Domain's third routing target, beside routing all team journeys and a Journey Collection: the Campaign whose landing page the domain serves at `/`. Independent of the other two, so one domain can serve a Campaign and the team's journeys together. Only a team manager sets or clears it. On that domain a region slug outranks a journey slug with the same spelling.
_Avoid_: home page, default campaign, primary campaign

**Campaign Theme**:
The one look-and-feel row every Campaign has: a light or dark **theme mode**, the three Journey Theme font roles (header, body, label), six base colours (primary, accent, background, surface, text, muted), two contrast-band colours, a corner radius and a button shape. Everything a section band or button shows is resolved from these columns plus the section's own overrides; text over a coloured band is computed for contrast, never stored.
_Avoid_: theme (bare — ambiguous with Journey Theme and theme mode), skin, style, brand

**Theme Preset**:
One of two named value sets, Light and Dark, that fill a Campaign Theme's mode and colours in one step; fonts and shapes are left alone. A fresh Campaign starts on Light. Nothing records which preset is active: the editor compares the current values to the presets and shows Custom when they differ.
_Avoid_: template, default theme, mode (that is the light/dark column a preset sets)

**Palette**:
A Campaign's list of the eight most recently used colours, shared by every colour picker in its editor, seeded from the Light preset and never read by the public page. Picker convenience, not content: it is outside undo and survives a preset change.
_Avoid_: swatches, theme colours (those live on the Campaign Theme), colour scheme

**Campaign Stats**:
The visitor numbers a Campaign shows: for each linked Journey, its unique visitors by country over the Campaign's lifetime (from first publish), read from that Journey's own **Plausible** site and summed by the Campaign's own region and language structure into landing, region and country totals. One sweep per Campaign, cached, served to anonymous visitors once the Campaign is published and to its team while a draft. A visitor who opens two linked Journeys counts in both.
_Avoid_: analytics (too broad; the section is the Analytics section, the data is Campaign Stats), views (the metric is visitors), per-region stats (there is one sweep, scoped on read)

**Share Link**:
The one link a Campaign Region hands out per language: a **short link** that redirects to the linked Journey's own public address (on that Journey's team domain, or the Root Domain) carrying the QR Code attribution parameters. The same link is what the region's **QR Code** encodes, so printing and copying give the same thing, and swapping the linked Journey redirects the existing link rather than minting a new one.
_Avoid_: journey link (the long address nobody hands out), campaign link (that is the Campaign Address), deep link

**Campaign QR Code**:
A **QR Code** row owned by the Campaign's Team and tied to one region language, created the moment a Journey is linked to that language and removed with it. It encodes the **Share Link**, is always black on white, and is drawn and downloaded in the visitor's browser.
_Avoid_: campaign code, region QR (the unit is the region language, not the region)

**Unlinked language**:
A region language whose Journey has not been picked yet, or whose Journey is no longer published. Visitors never see it; the editor shows it with a prompt to pick a Journey.
_Avoid_: empty language, missing journey, placeholder

**Campaign Video**:
The campaign media block: a reference to a Watch Video, a YouTube video or an uploaded Mux video, with optional title and description overrides. It is a card or an embedded player, never a journey-style player with trims and triggers. Watch text is read live in the campaign language; YouTube and Mux text is captured once when the video is picked.
_Avoid_: video block (bare, where the Journey VideoBlock could be meant), clip, media item

**Watch expansion**:
How a Campaign shows a Watch Video that has children: the Video Carousel (or a media slot) holding it displays its children as cards, one level deep, in Watch's own order, whatever the Video's label; a Video with no children is shown as itself. The join is done by the gateway at read, so the Campaign stores only the Video's id.
_Avoid_: collection mode (any Video expands, not only collections), playlist (that is YouTube's word)

**Media paste**:
The only way media and Journeys enter a Campaign: paste a Watch, YouTube or Journey link, or upload an image or video. There is no browsing or searching; the editor shows what a link resolved to before it is kept, and the server resolves it again on save.
_Avoid_: picker (implies browsing), library, search

**Page Language**:
The language a visitor reads a Campaign in: one of the Campaign's own languages, chosen once (link parameter, then saved choice, then browser, then the Campaign default) and carried across every page and region switch. A region never changes it.
_Avoid_: locale (that is the admin chrome's word), display language, UI language

**Share Language**:
A language a Campaign Region hands out a Journey in. An independent set from the Page Languages, with no link between them other than the Share section pre-selecting the visitor's Page Language when the region has it.
_Avoid_: region language (fine in conversation; the term is Share Language), journey language

**Translated Field**:
A visitor-facing text field of a Campaign. Its default-language value sits on the field itself; every other language sits beside it as a translation that records whether a person or a machine wrote it. Reading falls back from the requested language to the default, then to empty. The set of Translated Fields is one named list, used alike by the Translations view, machine translation and the default-language change.
_Avoid_: localised string, i18n key, label

**Campaign String**:
One of the Campaign's fixed interface phrases (such as "Copy link" or "All regions"): a Translated Field keyed by a fixed name, seeded with every Campaign, edited and translated like any other text, and shown in the Page Language. Distinct from the editor's own chrome, which is admin i18n.
_Avoid_: UI string, i18n string, interface key

**Machine Translation**:
The one-shot fill of a Campaign's missing or machine-made translations into one language, run over the whole Campaign with progress, through the same AI path journeys use. It never overwrites a translation a person wrote. "Needs review" is simply every translation still marked as machine-made.
_Avoid_: auto-translate (as a feature name), AI translate, sync

**Campaign Chrome**:
The header and footer every page of a Campaign shares: one Header and one Footer block per Campaign, owned by the Campaign rather than by a page, styled like any Campaign Section and holding the same text and button children, but never deletable, movable or duplicated. Campaign-owned, not fixed NextSteps chrome: the author edits it like a section.
_Avoid_: nav bar, site header/footer, layout, shell

**Brand Mark**:
The fixed leading element of the Campaign header: the logo image when one is set, otherwise the Campaign's title as text, always linking to the landing page in the visitor's Page Language. On a region page it is preceded by the "All regions" chip.
_Avoid_: logo (the logo is one of its two forms), home button, title

**Campaign Public Page**:
How a Campaign reaches visitors: the two pages served on the Root Domain and on a Campaign Root domain, rendered per request from one read of the published Campaign in the visitor's Page Language (the request's `lang` parameter, saved cookie and `Accept-Language` decide it, so the page cannot be pre-built; a response the link's `lang` parameter alone decided is shared-cacheable for a minute, every other one is private). A draft is never served. Empty text renders nothing and a section with nothing in it is skipped, so visitors never see editor hints or empty frames.
_Avoid_: viewer page (the viewer is the app), static page, preview (that is the editor's)

**Campaign Renderer**:
The shared viewer code that turns a published Campaign into a page: one component per Campaign Block typename behind a single switch, one band wrapper that paints a section's background and colours and orders its Extras around its Section Body, and one theme builder from the Campaign Theme. The editor canvas paints with its own components and shares only these pure helpers.
_Avoid_: block renderer (that is the Journey one), template, layout engine

**Campaign Seed**:
What every Campaign is born with, in one step: a draft Campaign with one language and a generated slug, the Light theme and a palette drawn from it, the landing and Region pages with their starter sections and copy, the header and footer with their starter links, and the seventeen Campaign Strings. No regions, media or Journeys: those are the author's first edits.
_Avoid_: template (that is a Journey concept), default campaign, blank campaign (it is not blank)

**Testing Seam**:
One of the three places the campaign builder is proven: the API resolver specs (the primary seam — every rule, seed, permission and write), the shared renderer specs (what a published Campaign looks like), and the admin command specs (what an edit and its undo do). Each build ticket's acceptance criteria name their seam and spec file, and a ticket is done when those specs pass in the automated gate.
_Avoid_: test level, layer (fine in conversation; the term is seam), coverage

**Human-verified criterion**:
A build-ticket criterion proven by the one Playwright scenario against a deployed preview rather than by the automated gate: listed apart from the rest and checked by a person before the integration PR merges.
_Avoid_: e2e criterion, manual test, smoke test

### Account deletion

**Journey deletion classification**:
When a user is deleted, each Journey/Team they touch is classified as **delete** (they were the sole accessor), **transfer** (they were owner/manager and others remain, so authority passes on), or **remove** (they were a plain collaborator, so only their membership goes). Pending `inviteRequested` access never keeps a Journey alive.
_Avoid_: cleanup, purge

**User Delete Journeys Check / Confirm**:
The two-phase deletion of this context's half of an account: `Check` is a dry run returning counts and a log; `Confirm` executes it and returns the removed journey/team/membership ids. Identity itself is removed by api-users (see the Context Map).
_Avoid_: hard delete, wipe
