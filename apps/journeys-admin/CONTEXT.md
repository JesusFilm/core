# Journeys Admin

The creator-facing authoring surface (`apps/journeys-admin`): where a signed-in creator builds, manages, shares, and measures Journeys, and where Publishers curate the template library. It owns no content or measurement entities — **Journey**, **Block**, **Step**, **Card**, **Team**, **Template**, and the role vocabularies belong to [Journeys](../../apis/api-journeys/CONTEXT.md), and **Visitor**/**Event** data belongs to [Journey Analytics](../../apis/api-journeys/CONTEXT-analytics.md). What this context owns is the _authoring experience_: the Editor's spatial model, the journey-list lifecycle actions, the sharing/adoption flows, and the report surfaces.

## Language

### The Editor

**Editor**:
The visual journey builder — the signature surface of this context. One Editor session edits one Journey; its state (which Slide, which Step/Block is selected, whether Analytics Mode is on) is UI state only and never persists.
_Avoid_: builder, studio, designer

**Slide**:
One of the three top-level panes the Editor pages between horizontally: **JourneyFlow**, **Content**, and the Settings **Drawer** (a standalone Slide only on mobile). A Slide is an Editor pane — never a Step or Card of the Journey itself.
_Avoid_: using "slide" for a Step or Card (that collision is exactly why this term needs care)

**JourneyFlow**:
The flow-diagram Slide: the whole Journey as a node graph — Steps as nodes, navigation as edges, plus Social Preview, Referrer, and link-out (chat/link/phone) nodes. Where Steps are arranged, chained, and (in Analytics Mode) measured.
_Avoid_: map, graph, diagram, canvas (Canvas is the other Slide)

**Canvas**:
The WYSIWYG rendering of the selected Step's Card where blocks are added, dragged, and edited inline. One of three contents of the Content Slide, alongside **Social Preview** and **Goals**.
_Avoid_: preview (that's the published-journey preview), WYSIWYG editor

**Properties**:
The panel editing the selected block's settings as collapsible accordions, inside the Settings Drawer. Editor state calls the expanded accordion an "attribute", but the canonical name for the panel and its contents is Properties.
_Avoid_: attributes, inspector, block settings

**Drawer**:
The sliding side panel hosting detail editors (Properties, Journey Appearance, Add Block, media libraries). Say "Drawer" only for this panel; the mobile pane it occupies is a Slide, and "which drawer is open" is just the Drawer's content.
_Avoid_: sidebar, side panel

**Add Block**:
The palette in the Drawer for inserting a new block into the selected Card, one entry per block type.
_Avoid_: block picker, toolbox

**Card Templates**:
Pre-built Card layouts offered when a Step's Card is empty, as a faster start than composing blocks one by one. Unrelated to journey **Templates**.
_Avoid_: layouts, presets; never shorten to "templates"

**Journey Appearance**:
The journey-wide look-and-feel panel in the Drawer: chat buttons, display title, Host, logo, menu, and reactions. Journey-scoped, unlike Properties (block-scoped).
_Avoid_: theme (reserved for Journey Theme/theme mode upstream), journey settings

**Toolbar**:
The Editor's top action bar: preview, share, access, analytics, undo/redo, template actions, and the Journey's title/details.
_Avoid_: app bar, header

**Command**:
One undoable editing act. Every edit in the Editor is dispatched as a Command onto an undo/redo history; undo/redo operate on Commands, not raw mutations.
_Avoid_: mutation (the transport, not the concept), action (an Action is a block behaviour upstream)

**Social Preview**:
The mock-up of how the Journey appears when shared on social media (message and post forms), edited alongside the Canvas.
_Avoid_: social (alone), share preview

**Analytics Mode**:
The Editor mode that locks the view to the JourneyFlow and overlays Visitor stats — per-Step visitors and drop-off, per-link clicks, chats started — over a chosen date range. The opposite of edit mode; the numbers come from Journey Analytics (Plausible).
_Avoid_: insights, stats view, analytics overlay (the overlay is what the mode shows)

**Referrer**:
A traffic-source node shown in the JourneyFlow during Analytics Mode: where Visitors arrived from, feeding into the first Step.
_Avoid_: source, channel

### Journey management

**Status Tabs**:
The three lifecycle views of the journey list: **Active** (working journeys, drafts and published alike — publish state is a property, not a tab), **Archived**, and **Trash**.
_Avoid_: draft tab / published tab (no such tabs exist)

**Archive**:
Reversibly tuck a journey out of the Active list without deleting anything. Undone by **Unarchive**.
_Avoid_: hide, deactivate

**Trash**:
Reversibly discard a journey into the Trash tab. Undone by **Restore**. (The status enum says `trashed`; the tab says "Trash".)
_Avoid_: delete (ambiguous — see Delete Forever), remove

**Delete Forever**:
Permanently destroy a trashed journey. The only irreversible act in the lifecycle; only available from Trash.
_Avoid_: delete (unqualified), purge

**Copy to Another Team**:
Duplicate a journey into a different Team the user belongs to. One of three copy flavours alongside plain **Duplicate** (same team, owned upstream) and **Create Translated Copy** (duplicate into another language via machine translation).
_Avoid_: move (the original stays), transfer

**Quick Settings**:
A lightweight, tabbed post-creation setup surface for configuring a new journey's chat links and Goals without entering the full Editor.
_Avoid_: setup wizard, mini editor

### Templates & publishing

**Use This Template**:
The adoption flow: pick a Template from the gallery and duplicate it into one of your Teams as an editable Journey. Also reachable via a deep link that triggers the flow on arrival.
_Avoid_: install, import, clone

**Quick-Start Customization**:
The simplified, step-by-step guided editing flow offered after adopting a customizable Template — filling in chat links, language, and titles — as the mobile-friendly alternative to the full Editor.
_Avoid_: wizard, onboarding (that's the new-user flow)

**Publisher Pages**:
The internal surface (under `/publisher`) where users holding the platform-wide **Publisher** role manage the template library. Non-publishers are shown the **Publisher Invite** — an access-explanation screen, _not_ an actual invitation.
_Avoid_: admin pages; don't count Publisher Invite as a third invite type alongside team and journey invites

**Collection**:
The admin's name for a curated, publishable, drag-orderable grouping of templates in the public template gallery — the same entity Journeys calls a **Template Gallery Page**. **Featured Templates** is the highlighted default section.
_Avoid_: confusing with **Journey Collection** (upstream: a team's own journeys wired to a Custom Domain — a different entity entirely)

### Sharing

**Share**:
The umbrella Toolbar flow for distributing a published journey: copy the link (or **Short Link** on the team's Custom Domain), edit the **Slug**, generate a **QR Code**, or grab the **Embed** snippet.
_Avoid_: publish (a lifecycle state), export

**Manage Editors**:
The access dialog for one journey: who has access (owner/editor, plus pending "Requested Access"), inviting editors by email or shareable link, and promoting/removing them. The roles themselves are the upstream **UserJourney** vocabulary.
_Avoid_: share (that's distribution to audiences), permissions dialog

### Reports & visitors

**Reports**:
The measurement area, split into two destinations: **Journeys Analytics** (aggregate performance, an embedded Power BI report) and **Visitors Analytics** (the per-Visitor grid). Per-journey variants of both exist.
_Avoid_: dashboard (ambiguous between the Power BI and Plausible surfaces)

**Power BI Report**:
The embedded business-intelligence dashboard behind Journeys Analytics, in four variants: multiple/single journey × full/summary detail.
_Avoid_: report (unqualified)

**Plausible Embed Dashboard**:
The other embedded analytics surface: a single journey's Plausible dashboard iframe, authorized by the journey's `plausibleToken`. Event-level stats, distinct backend from Power BI.
_Avoid_: conflating with the Power BI Report

**Visitor Timeline**:
The per-Visitor interaction history shown on a visitor card, built from upstream Events and labeled in admin terms: **Chat Started** (a ChatOpenEvent), **Submitted Text** (a text response), **Poll Answers** and **Multiselect Answers** (question submissions).
_Avoid_: event log, activity feed

**Visitor Status**:
The emoji-style marker (star, thumbs up/down, warning, …) a team member assigns to a Visitor to triage follow-up. Assigned here; stored upstream.
_Avoid_: rating, flag

**Template Breakdown Analytics**:
Aggregate stats for a template _family_ — every journey duplicated from a template — sorted by the tracked goal events (views, responses, decisions, prayer requests, gospel start/complete, RSVP).
_Avoid_: template stats (unqualified)

### Integrations

**Integration**:
A team-scoped connection to an external system, managed under the team's Integrations pages. Two kinds exist here: **Growth Spaces** (an accessId/accessSecret credential pair whose **Routes** are the destinations a TextResponseBlock can post responses to) and **Google** (an OAuth connection enabling **Google Sheets Sync** — pushing visitor event data into a spreadsheet).
_Avoid_: plugin, connector, app

### Onboarding & account

**Onboarding**:
The first-run experience: the starter-template panel on an empty dashboard, the create-your-first-team flow, and the terms-and-conditions gate. Distinct from Quick-Start Customization (template-scoped) and Quick Settings (journey-scoped).
_Avoid_: welcome flow, setup

**Email Preferences**:
The per-recipient page (keyed by email address) for notification opt-ins, including **Unsubscribe All**. Distinct from the per-journey **Email Notifications** toggle inside Manage Editors.
_Avoid_: notification settings (ambiguous between the two)
