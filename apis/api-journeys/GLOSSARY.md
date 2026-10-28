# Journeys

The authoring-and-delivery context. `api-journeys` owns the **Journey** — an interactive, multi-step experience built from a tree of visual blocks — from the editor that composes it to the public page that serves it. It is the source of truth for journeys, their block content, the teams that own them, and the templates they are cloned from. The audience-facing measurement side — who visits a published journey and what they do — is a separate bounded context that shares the same deployable and database: see [Journey Analytics](./GLOSSARY-analytics.md). Journeys references users, languages, media, and short links by id only; those identities are owned elsewhere.

> **Product framing.** Journeys are typically **gospel-presentation / evangelism funnels** (the NextSteps product). This is not incidental branding — it is baked into the domain vocabulary: the goal labels a creator tracks are `decisionForChrist`, `gospelPresentationStart/Complete`, `prayerRequest`, and `rsvp` (see **Event Label** in the sibling [Journey Analytics](./GLOSSARY-analytics.md) context). Treat "ministry funnel" as the mental model for what a Journey is _for_.

## Language

### Journey & structure

**Journey**:
The aggregate root and central entity — one interactive experience, addressable by **Slug**, owned by a **Team**, rendered from an ordered tree of **Blocks**. Moves through a **Journey Status** lifecycle and may itself be a **Template**.
_Avoid_: flow, funnel, page, site (each means something narrower here)

**Slug**:
A Journey's URL-safe public address (the path segment at `<base>/<slug>`), unique across all journeys. Generated from the title on create/duplicate; on collision the Journey's UUID is appended. A slug the viewer reserves for its own paths (`isReservedJourneySlug`) is treated the same way: create and duplicate append the id, while update refuses it with `BAD_USER_INPUT` on `slug`.
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
The messaging channel a **Chat Button** or **ChatAction** points to (`facebook`, `telegram`, `whatsApp`, `instagram`, `line`, and many more, plus icon-only values). Shared vocabulary — the [Journey Analytics](./GLOSSARY-analytics.md) context reuses it for a Visitor's reachable channel and `ChatOpenEvent`.
_Avoid_: channel, social network

### Distribution & routing

**Custom Domain**:
A team's vanity hostname for serving journeys. `apexName` is the registrable root used for DNS verification. `routeAllTeamJourneys` fans the domain out to every team journey by slug; when false it resolves to a linked **Journey Collection** instead. A Custom Domain is either a team domain (route-all or collection, listed on the Team) or a **Campaign Domain**, never both: a Campaign Domain belongs to one Campaign and serves no team journey.
_Avoid_: domain, host (Host is the presenter), vanity url

**QR Code**:
A scannable code that deep-links into a Journey (`toJourneyId`, optionally `toBlockId` for a specific Step), styled with colours and backed by a federated **short link** (`shortLinkId`). Its redirect goes to the Journey's own public address: the route-all Custom Domain of the Journey's own team, else a Journey Collection's domain, else the Root Domain.
_Avoid_: qr, link code

### Campaigns

**Campaign**:
A team-owned seasonal campaign site: a landing page plus one page per **Campaign Region**, built from **Campaign Blocks**, pointing visitors at published Journeys. Has a draft/published status like a Template Gallery Page.
_Avoid_: site, microsite, landing page (that is one of its pages)

**Campaign Page**:
One of the two pages a Campaign has: the landing page, or the **Region Page** that every Campaign Region renders. A Campaign never has more pages than these two.
_Avoid_: screen, view, region's page (a region has no page of its own)

**Campaign Status**:
Whether a Campaign is `draft` or `published`, the only public gate: a draft is never served, and nothing on a Campaign is locked by its status. `publishedAt` records the first publish and unpublishing never clears it, so it means "first went live"; publish and unpublish are explicit actions any member or manager of the Team takes, never undo steps.
_Avoid_: live/offline (use published/draft), visibility, state

**Live Editing**:
How a Campaign is edited: every edit saves in place as its own change, with no working copy, snapshot or Save step, so a published Campaign changes under its visitors as the author works. Undo is the Editor's in-memory **Command** history, not a saved version.
_Avoid_: autosave (as a feature name — it is the only mode), draft mode, preview mode, versioning

**Campaign Settings**:
The parts of a Campaign that are not content: the default-language title, the slug, the default language (changed by a **Default-language swap**) and the **Palette**, all saved outside the Editor's Command history. The slug never follows a title change.
_Avoid_: metadata, properties, campaign info

**Default-language swap**:
Changing a Campaign's default language: one transaction moves every Translated Field's text in the new language onto the field and the old default text into a person-written translation, refused while any text has no translation in the new language yet.
_Avoid_: language change, re-translate

**Campaign access**:
Who may do what to a Campaign, decided by the caller's **Team Role** on the owning Team, plus journey Update to link a Share Language Journey: any member or manager creates, reads, edits, publishes and unpublishes it, while only a manager deletes it or adds, checks or removes its Campaign Domain. Linking a Journey to a Share Language needs the right to see that Journey's stats (journey Update: a member or manager of its Team, or its owner or editor; for a Template, also any **Publisher**, who can already read every Template's stats), because its visitors feed the public Campaign Stats. The check is made at link time only: a link stays if its linker later loses access. Journey cards feed no stats and need no rights on their Journey. Neither kind of link grants any rights on the Journey. QR codes and short links about linked Journeys are the Campaign's Team's own; the traffic the Campaign Stats show is the Share Language Journeys', each one its linker could see when linking it.
_Avoid_: campaign role (there is no such role; reuse Team Role), owner (a journey role), publisher (gates Templates; here it only lets a Publisher link a Template, whose stats it can already read)

**Campaign Seed**:
What every Campaign is born with, in one step: a draft Campaign with one language and a generated slug, the Light theme and a Palette drawn from it, the landing and Region pages with their starter sections and copy, the header and footer with their starter links, and the eighteen Campaign Strings. No regions, media or Journeys: those are the author's first edits.
_Avoid_: template (that is a Journey concept), default campaign, blank campaign (it is not blank)

### Campaign content

**Campaign Block**:
A node in a Campaign's content tree — the counterpart of **Block**: nested by parent and sibling order, and scoped to its Campaign and to at most one Campaign Page or Campaign Region. Typenames carry a `Campaign` prefix (`CampaignHeroBlock`, `CampaignVideoBlock`, …) so they never collide with Journey block types.
_Avoid_: block (bare, where a Journey Block could be meant), element, widget

**Campaign Section**:
A top-level Campaign Block on a Campaign Page: one full-width band of one of eleven kinds (Hero, Region Switcher, Region Header, Region Share, Featured Media, Journey List, Video Carousel, Analytics, Rich Text, Columns, Image). Each has a **Section Background** and optional colour overrides and may hold **Extras**, but never a built-in call to action — a button is always an Extra.
_Avoid_: block (for a section), row, band, panel, module

**Section Body**:
The typed, fixed part of a Campaign Section that lives on the section's own row (its eyebrow, title, description, media slot, and so on) rather than as child blocks. Extras render above or below it.
_Avoid_: content, fields, inner blocks

**Section Background**:
What a Campaign Section sits on: nothing, the theme surface, the contrast band, the primary colour, a custom colour, or an image. An image background is an owned cover block with a light / medium / heavy overlay, as a Card owns its **Cover**.
_Avoid_: backdrop, cover (reserve for the owned image itself)

**Column Slot**:
One of exactly two fixed cells of a Columns section, each holding at most one Campaign Section other than a Columns or Region Share section; an Image section never lands in a slot either, because its create addresses a page or an owner block, never a slot. Deleting the section in a slot empties the slot and never removes the slot itself; mirrors GridContainer → GridItem.
_Avoid_: column (ambiguous with the Columns section), cell, pane

**Extra**:
A **Campaign Typography** or **Campaign Button** block added as a child of a Campaign Section, placed above or below the **Section Body** by its **Placement** and ordered among its siblings like any Block. Extras are the only children an author adds around the Section Body, but not the only children a section has: a Video Carousel's `CampaignVideoBlock` cards, a Journey List's **Journey cards** and a Columns section's **Column Slots** are children too, and an **Owned block** carries its host's id as `parentBlockId`. The code's `CAMPAIGN_CHILD_TYPENAMES` and `CampaignChildPlacement` mean Extras.
_Avoid_: addon, child block (too broad), inline block

**Owned block**:
A Campaign Block held by a slot on its host rather than placed among its children: a **Section Background** cover, the header's logo, or a **Media Slot** block. It has `parentOrder: null`, is replaced or brought back only through its owner's slot, and is never deleted, restored, reordered or duplicated on its own.
_Avoid_: child block, Extra, attachment

**Journey card**:
The `CampaignJourneyBlock` row under a Journey List section: one linked Journey with its snapshotted title and description, ordered among the list's other cards.
_Avoid_: journey block (bare, where a Journey's own Blocks could be meant), journey link, item

**Placement**:
Which side of the Section Body an Extra renders on: `above` or `below`. Sibling order is still one sequence across both sides.
_Avoid_: position, slot, side

**Protected Block**:
One of the protected rows, edited and styled like any other but never deleted or duplicated: the header, the footer (one of each per Campaign), the **Column Slots** and the two Campaign Pages. A page id is not a block id, but `authorizeStructuralBlock` refuses it the same way. Only the header, footer and pages never move; the two Column Slots may swap.
_Avoid_: locked, fixed block, system block

**Campaign Typography**:
The campaign text block. Size, display-versus-body font and weight are not separate settings: the typography **variant** (core's h1 … overline ladder) decides all three through the theme, with an optional alignment and hex colour.
_Avoid_: text block (bare), heading, paragraph, label

**Campaign Button**:
The campaign call-to-action block: a translated label, core's button variant and size, optional alignment and two hex colours (fill or border, and label), and a Campaign Action. Corner shape belongs to the theme.
_Avoid_: CTA, link button, action button

**Campaign Action**:
What a Campaign Button does when pressed: open a web link, scroll to a block on the same page, or navigate to a Campaign Region.
_Avoid_: link (bare), href, navigation

**Campaign Chrome**:
The header and footer every page of a Campaign shares: one Header and one Footer block per Campaign, owned by the Campaign rather than by a page, styled like any Campaign Section, but never deletable, movable or duplicated. Campaign-owned, not fixed NextSteps chrome: the author edits it like a section. Both take the same Extras as any section; the header's nav links are Button Extras.
_Avoid_: nav bar, site header/footer, layout, shell

**Brand Mark**:
The fixed leading element of the Campaign header: the logo image when one is set, otherwise the Campaign's title as text, always linking to the landing page in the visitor's Page Language. On a region page it is preceded by the "All regions" chip.
_Avoid_: logo (the logo is one of its two forms), home button, title

**Campaign Image**:
The campaign picture block, in two roles: an Image section, or an owned block (a **Section Background** cover or the header's **Brand Mark** logo) that is replaced, never edited in place. Every picture is stored on Cloudflare Images under the Campaign's Team, so the stored address is always a Cloudflare one, except the seeded header logo, which the admin app serves (`seed/sections.ts`).
_Avoid_: image block (bare, where the Journey ImageBlock could be meant), photo, asset, media (that includes video)

**Campaign Video**:
The campaign media block: a reference to a Watch Video, a YouTube video or an uploaded Mux video, with optional title and description overrides. It is a card or an embedded player, never a journey-style player with trims and triggers.
_Avoid_: video block (bare, where the Journey VideoBlock could be meant), clip, media item

**Media Slot**:
The one owned **Campaign Video** or **Campaign Image** a Hero or Featured Media section shows beside its text, held apart from the section's Extras the way a Card holds its Cover. Filling it replaces the block it held, and pointing it back at that block restores it, which is how undo works.
_Avoid_: hero video, featured video (the slot may hold an image), poster

**Video Carousel**:
The section that shows a shelf of video cards in one of two modes, decided by whether it names a Video: a **Watch expansion** of that Video, or its own explicit **Campaign Video** cards. A YouTube playlist paste imports the playlist's first twelve videos as explicit cards.
_Avoid_: collection carousel, playlist carousel, YouTube carousel (one typename takes every source)

**Watch expansion**:
How a Campaign shows a Watch Video that has children: the Video Carousel (or a **Media Slot**) holding it displays its children as cards, one level deep, in Watch's own order, whatever the Video's label; a Video with no children is shown as itself. The Campaign stores only the Video's id.
_Avoid_: collection mode (any Video expands, not only collections), playlist (that is YouTube's word)

**Media paste**:
The only way media and Journeys enter a Campaign: paste a Watch, YouTube or Journey link, or upload an image or video. There is no browsing or searching; the editor shows what a link resolved to before it is kept, and the server resolves it again on save.
_Avoid_: picker (implies browsing), library, search

### Campaign theme

**Campaign Theme**:
The one look-and-feel row every Campaign has: a light or dark **theme mode**, the three Journey Theme font roles (header, body, label), six base colours (primary, accent, background, surface, text, muted), two contrast-band colours, a corner radius and a button-corners radius with the same four values. Everything a section band or button shows is resolved from these plus the section's own overrides; text over a coloured band is computed for contrast, never stored.
_Avoid_: theme (bare — ambiguous with Journey Theme and theme mode), skin, style, brand, button shape (there is none)

**Theme Preset**:
One of two named value sets, Light and Dark, that fill a Campaign Theme's mode and colours in one step, leaving fonts and the corner radius alone; button corners follow the preset. Nothing records which preset is active: the editor compares the current values to the presets and shows Custom when they differ.
_Avoid_: template, default theme, mode (that is the light/dark column a preset sets)

**Palette**:
A Campaign's list of its most recently used colours (at most eight, newest first), shared by every colour picker in its editor and never read by the public page. It is seeded with the Light preset's distinct colours, which is six because the preset repeats two; picker convenience, not content, so it is outside undo and survives a preset change.
_Avoid_: swatches, theme colours (those live on the Campaign Theme), colour scheme

### Campaign regions & sharing

**Campaign Region**:
A Campaign's regional subdivision (for example AFR, EUR), shown on the shared **Region Page** at its own address, with a required translated **name**, a slug unique within the Campaign, an ordered set of **Region Countries**, and per language a linked Journey to share. The name is its identity everywhere (page list, breadcrumbs, translations, share copy, analytics scope); the slug is only its address, and a region is **listed** when it appears on the Region Switcher, otherwise it keeps an **Orphan Page**.
_Avoid_: country, market, locale, key (for the slug)

**Region Country**:
One country shown as a chip on a Campaign Region's card, referenced by its `api-languages` Country id so flag and translated name come from the owner. Presentation and a future country-to-region lookup; not identity.
_Avoid_: flag, chip (as the data name), territory

**Orphan Page**:
The address of a Campaign Region that has been unlisted from the Region Switcher: the shared Region Page is still served there and the region is still editable, just unreachable from the switcher. Deleting a region is offered only from its Orphan Page.
_Avoid_: hidden page, archived page, draft page

**Region Line**:
An optional, purely presentational text line (a short code, a tagline) shown under a Campaign Region's name on its switcher card and region header. A line is an ordinary **Campaign Typography** block scoped to the region rather than to a page; it never names the region.
_Avoid_: label, caption, subtitle, name

**Region Page**:
The Campaign's single region-page layout, rendered once per Campaign Region. Every region shows the same sections and the same text; what differs is the region's own rows — its name, lines, countries, and the linked Journey per language — so an edit to the page reaches every region at once. The Prisma and GraphQL enum value is `CampaignPageKind.regionTemplate` for historical reasons; the term stays Region Page.
_Avoid_: region template, shared layout, customised page (there is none), per-region page

**Share Language**:
A language a Campaign Region hands out a Journey in. An independent set from the Page Languages, with no link between them other than the Share section pre-selecting the visitor's Page Language when the region has it. The Prisma and GraphQL names are `CampaignRegionLanguage` (`campaignRegionLanguage*`, `schema/campaign/regionLanguage/`) for historical reasons; the term stays Share Language.
_Avoid_: region language (fine in conversation; the term is Share Language), journey language

**Share Link**:
The one link a Campaign Region hands out per language: a **short link** that redirects to the linked Journey's own public address, carrying the QR Code attribution parameters. The same link is what the region's **QR Code** encodes, so printing and copying give the same thing, and swapping the linked Journey redirects the existing link rather than minting a new one. Unlinking keeps the link (it goes on redirecting to the last linked Journey), and a later link retargets it.
_Avoid_: journey link (the long address nobody hands out), campaign link (that is the Campaign Address), deep link

**Campaign QR Code**:
A **QR Code** owned by the Campaign's Team and tied to one Share Language, created the moment a Journey is linked to that language. It survives an unlink, so printed codes keep working; a Share Language that holds one cannot be removed. It is deleted with its Campaign Region or Campaign, with its target Journey (`QrCode.journey` cascades), or with its Team when an account deletion removes the Team; after an account deletion its short link is deleted by the `shortlinkDelete` worker. It encodes the **Share Link**, is always black on white, and is drawn and downloaded in the visitor's browser.
_Avoid_: campaign code, region QR (the unit is the region language, not the region)

**Snapshot refresh**:
Re-reading a Share Language's or a Journey List card's title and description from its linked Journey on request, replacing both; never automatic. The editor runs it as a Command whose undo writes the previous wording back together with the edited flag, and asks first only when the row's `snapshotEdited` says an author changed the wording by hand; a Journey renamed since linking does not count, and refreshing or linking clears the flag.
_Avoid_: sync (nothing runs on its own), re-link (the Journey stays the same)

**Unlinked language**:
A Share Language whose Journey has not been picked yet, or whose Journey is no longer published or no longer exists. Visitors never see it; the editor shows it with a prompt to pick a Journey.
_Avoid_: empty language, missing journey, placeholder

### Campaign language & translation

**Page Language**:
The language a visitor reads a Campaign in: one of the Campaign's own languages, chosen once (link parameter, then saved choice, then browser, then the Campaign default) and carried across every page and region switch. A region never changes it.
_Avoid_: locale (that is the admin chrome's word), display language, UI language

**Translated Field**:
A visitor-facing text field of a Campaign. Its default-language value sits on the field itself; every other language sits beside it as a translation that records whether a person or a machine wrote it, and on a machine one whether the model flagged it `uncertain`; reading falls back from the requested language to the default, then to empty.
_Avoid_: localised string, i18n key, label

**Campaign String**:
One of the Campaign's fixed interface phrases (such as "Copy link" or "All regions"): a Translated Field keyed by a fixed name, seeded with every Campaign, edited and translated like any other text, and shown in the Page Language. Distinct from the editor's own chrome, which is admin i18n.
_Avoid_: UI string, i18n string, interface key

**Machine Translation**:
The one-shot fill of a Campaign's missing or machine-made translations into one language, run over the whole Campaign with progress, through the same AI path journeys use. It never overwrites a translation a person wrote, even one written while the run is going, and "Needs review" is a machine line the model flagged `uncertain`; a person's rewrite clears it. Only one run into a given language of a Campaign is in flight at a time; a second is refused until the first ends.
_Avoid_: auto-translate (as a feature name), AI translate, sync

**Campaign Translations**:
The per-language review list behind the Translations View: one row per Translated Field that has default-language text, with the default wording, the wording in the chosen language and who wrote it. A row is Missing (no translation), Edited (person-written) or machine-written, and a machine-written row the model flagged `uncertain` also Needs review; the default language has no list, its text being the field.
_Avoid_: translation report, review queue

### Campaign delivery & stats

**Campaign Address**:
Where a Campaign is served: its permanent address on the **Root Domain** (`/campaign/<slug>`, region pages one segment deeper) until it has a **Campaign Domain**, and from then on that domain's root and `/<region slug>` only — the root-domain address is not found, as a journey on a route-all team domain is. Its linked Journeys keep opening on their team's domain or the Root Domain, never on the Campaign Domain.
_Avoid_: campaign URL (ambiguous between the two forms), vanity link, permalink

**Campaign Domain**:
A Custom Domain that belongs to one Campaign (`campaignId` in code), added and removed from the Campaign's Settings by a team manager. It serves only that Campaign's landing page at `/` and its Region Pages at `/<region slug>`; `/<journey slug>` on it is not found, and team journey URLs, QR short links and stats links never use it. One per Campaign, never route-all and never a Journey Collection's; it may be added to a draft (serving nothing until published), and deleting the Campaign deletes it and its Vercel registration. To move one, remove it and add it again.
_Avoid_: Campaign Root (the retired name), home page, default campaign, primary campaign

**Campaign Public**:
The narrowed read of a published Campaign served to anonymous visitors, like the public Template Gallery Page: status is the only gate and nothing on it leads to the Team, its members or linked-Journey internals. It is read by Campaign slug (only while it has no Campaign Domain) or by the hostname of its Campaign Domain, a draft or unknown key is not found, and every Translated Field arrives already resolved to the requested language.
_Avoid_: public campaign (as a status), published view, visitor API

**Campaign Public Page**:
How a Campaign reaches visitors: the two pages served on the Root Domain or, once it has one, on its Campaign Domain, built from the published Campaign in the visitor's Page Language and refreshed within a minute of an edit, sooner when the author publishes or unpublishes. A draft is never served, and empty text or an empty section renders nothing.
_Avoid_: viewer page (the viewer is the app), preview (that is the editor's)

**Campaign Renderer**:
The shared viewer code that turns a published Campaign into a page, one component per Campaign Block typename; defined in the [Journeys UI](../../libs/journeys/ui/GLOSSARY.md) kernel.
_Avoid_: block renderer (that is the Journey one), template, layout engine

**Campaign Stats**:
The visitor numbers a Campaign shows: for each Share Language Journey that is not trashed (published, archived and draft alike), its unique visitors by country over all time (the sweep starts at a fixed early date, and the public tile says "all time"), read from that Journey's own **Plausible** site and summed along the Campaign's region and language structure into landing, region and country totals. One cached sweep serves anyone once the Campaign is published and its team while a draft, and a visitor who opens two Share Language Journeys counts in both.
_Avoid_: analytics (too broad; the section is the Analytics section, the data is Campaign Stats), views (the metric is visitors), per-region stats (there is one sweep, scoped on read), site traffic (that is the Campaign's own Plausible site)

**Campaign Plausible site**:
The Plausible site a Campaign reports to on its own, `api-journeys-campaign-<campaignId>`, created by the plausible worker once `campaignCreate` commits (the startup backfill creates any that are missing) with the four `campaign*` goals and `Outbound Link: Click`; its shared-link token is `Campaign.plausibleToken`, readable with campaign Read and never on Campaign Public. The Campaign Public Page reports every view and event to it and to its Team's site; the admin's Campaign Report embeds its dashboard, so no query of this API reads its numbers. It counts from its creation and outlives the Campaign, as a Journey's site does.
_Avoid_: campaign stats (those are the Share Language Journeys' visitors), team site (the Team's own roll-up site, which also gets these views)

### Account deletion

**Journey deletion classification**:
When a user is deleted, each Journey/Team they touch is classified as **delete** (they were the sole accessor), **transfer** (they were owner/manager and others remain, so authority passes on), or **remove** (they were a plain collaborator, so only their membership goes). Pending `inviteRequested` access never keeps a Journey alive.
_Avoid_: cleanup, purge

**User Delete Journeys Check / Confirm**:
The two-phase deletion of this context's half of an account: `Check` is a dry run returning counts and a log; `Confirm` executes it and returns the removed journey/team/membership ids. Confirm also deletes the QR Code rows of the deleted Journeys (whichever Team owns them) and of the deleted Teams, then queues their short links on the `shortlinkDelete` queue once the transaction commits. Identity itself is removed by api-users (see the Context Map).
_Avoid_: hard delete, wipe

### Terminology traps

**Campaign (three meanings)**:
Here a **Campaign** is the seasonal campaign site. The short-links admin uses Campaign for a named group of Short Links read together ([Short Links Admin](../../apps/short-links-admin/GLOSSARY.md)), and every QR Code redirect carries a `utm_campaign` parameter (written by `getTo`) whose value is the QR Code's short link id, not a Campaign. Say which one you mean.
