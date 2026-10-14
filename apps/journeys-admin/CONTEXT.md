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
Pre-built Card layouts offered when a Step's Card is empty, as a faster start than composing blocks one by one. Unrelated to journey **Templates** — the inner directory of layout components is named `Layouts/` to avoid that collision.
_Avoid_: presets; never shorten to "templates"

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

**Campaign Editor**:
The full-screen `/campaigns/[id]` editor for a **Campaign** (the Journeys context's seasonal site), behind the LaunchDarkly flag `campaignBuilder` together with the Campaigns nav item and the `/campaigns` list. Desktop only: below 1280 px it shows an "open this on a larger screen" message and no canvas. One **CommandProvider** spans both Campaign Pages so the undo history survives the **Page Selector**; nothing replaces Save — no Save button, Unsaved chip or save indicator — because every edit is its own mutation (Live Editing) with an optimistic response, and a failed one surfaces as the error snackbar and rolls back.
_Avoid_: campaign builder (the feature name, not the surface), site editor

**Campaign Canvas**:
The Campaign Editor's rendering of the selected Campaign Page inside a FramePortal iframe, painted with the editor's own section components under the campaign theme (shared with the public viewer are pure helpers only). **Desktop/Phone** is a view toggle that sets the frame to full width or 390 px; it is never a Command.
_Avoid_: preview (the public page is the preview), the Canvas (that is the journey Editor's)

**Inspector**:
The persistent right panel (328 px, the journey editor's drawer width) of the Campaign Editor that shows the selection: a header with the element-type icon and the block's label, the breadcrumb (each earlier crumb selects that level) and an actions row (move, duplicate, delete, confirming for sections, columns and regions only), then a **Style** and a **Settings** tab switched on the selection kind (S and D switch tab, never while a field has focus). With nothing selected it holds the campaign Theme (Style) and the campaign settings (Settings). It replaces the seven modal drawers of the first Campaign Editor and never dims or blocks the canvas; the active tab and the open Left Rail panel are editor view state, never a Command. **Settings** holds the title, the slug with its address hint (the permanent root-domain address and the current public address), the status copy and, for team managers, Delete campaign; title and slug save through `campaignUpdate` and are not Commands. **Theme** opens the Theme panel: the Light and Dark Theme Preset swatches, the eight Campaign Theme colours as swatch plus hex, the three font selects over the journeys theme dialog's curated lists, the four corner radii and the two button shapes; every change, and each preset application, is one Command through `campaignThemeUpdate`, and the Light / Dark / Custom label is derived by comparing the nine values to the preset constants, never stored. The Style tab shows a text Extra's Size, Align and Colour and a button Extra's variant, size, Align and two colours as inline rows (one Command each), and a Columns section's Ratio (equal, wide left, wide right; one Command through the columns update). Every colour row carries an indicator: an **orange** dot for a value inherited from the band or theme, a **blue** dot for a value set on the block; Reset (v1's Inherit) writes null and the dot returns to orange. A theme colour is always set, so its dot is blue. An Extra's tab does not embed its host's controls: its header says "Inherits from <host>" with a link that selects the host, and a column slot, carousel card, journey card or region card says "Styled by its section" with the same link.
_Avoid_: properties (the journey editor's Drawer), details panel, side panel

**Left Rail**:
The Campaign Editor's 56 px column of icon buttons to the left of the Campaign Canvas: at the top the back button to the campaigns list and the panel toggles **Pages** (P), **Add** (A) and **Localize** (each toggles its panel; opening one closes another); at the bottom Undo, Redo, the Desktop / Phone toggle and the **Publish button**. It replaces the first editor's top bar.
_Avoid_: toolbar, sidebar, top bar

**Add Panel**:
The 300 px Left Rail panel listing the section, Extra and Region Line types that can be added, in three groups: **Sections** (the page kind's types; region-page-only types on the Region Page only, slot-disallowed types hidden when the target is a Column Slot), **Extras** (Text, Button) and **Region** (Add line, while a region card is selected). Clicking a type adds it in place relative to the selection: nothing selected → the end of the page; a section → below it; an empty Column Slot → into it; an Extra → after it, same host and placement; a region card → a new Region Line. A section or chrome block selected also offers the Extra's side of the text (above or below). Each add is the same create Command as before, through one shared add hook whose insertion rule is a pure function of the selection. A toggles it, in the shell and in the canvas frame, never while an input has focus. Drag from the panel onto the canvas is not part of v2.
_Avoid_: element library, palette (the colour one), bottom bar (retired with the Campaign Row)

**Pages Panel**:
The 300 px Left Rail panel that decides what the Campaign Canvas shows: the campaign title as its header, the page list (the landing page, then each region's Region Page in switcher order, with " · not listed" for an orphan and the "Needs journey" chip) and the **Preview Language** select. Choosing a page or a language is a view choice, never a Command. One left panel is open at a time; below 1440 px it overlays the canvas, from 1440 px it pushes it, and Escape closes it before it steps the selection up.
_Avoid_: page selector (the first editor's control), navigation

**Localize Panel**:
The Left Rail panel with two tabs, **Languages** (the Languages Panel body) and **Translations** (the Translations View body). Changing the default language opens it on Translations with the promotion notice.
_Avoid_: languages panel, translations view (now its tabs)

**Publish button**:
The Left Rail's status-dot button (grey draft, green published) whose popover holds the status copy, **Publish** (no confirmation) or **Unpublish** (confirms, stating that the linked journeys and their QR codes keep working) and **Open page** (the root-domain `/campaign/<slug>` in a new tab). Publish and Unpublish are for team managers only and are explicit actions, never Commands.
_Avoid_: status chip

**Canvas banner**:
The floating slot at the top of the canvas area, taking no layout height, for the **First-run Hint** and the orphan page bar when the rendered region is unlisted.
_Avoid_: bar

**Languages Panel**:
The Localize Panel's first tab: the campaign's Page Languages in selector order (autonym, with the English name beside it, the default marked) with Remove on each, and the shared language autocomplete to add one. Add and remove go straight to the API and are never Commands; the default or last language cannot be removed and the API's refusal is shown verbatim. The machine-translation run for a new language belongs to the Translations tab.
_Avoid_: language settings, locale picker

**Preview Language**:
The Pages Panel select that decides which campaign language the Campaign Canvas renders in: translations where they exist, the default-language text as a marked fallback where they do not, text direction from the language's bcp47. Editing any text, including a Campaign String, while the Preview Language is not the default writes a human translation for that language as one Command; in the default language the same edit writes the field itself.
_Avoid_: canvas language, view language, locale

**Translations View**:
The Localize Panel's second tab: one non-default campaign language at a time, every Translated Field grouped Interface, Landing page, Region page and Regions, filtered All, Needs review, Machine-translated, Missing or Edited (Needs review and Machine-translated list the same lines). Each line shows what the text is, the default wording and an editable field with its character counter; leaving the field writes a human translation (an emptied field clears it) and the line turns Edited at once, in the list and in the editor's own copy. It is not a Command: undo belongs to the canvas.
_Avoid_: translation manager, review queue

**First-run Hint**:
The one dismissible hint floating in the **Canvas banner** the first time a campaign opens — "Pick anything on the page or in the Navigator, then change it in the Inspector." — recorded per campaign in `localStorage` like the Editor's other one-time tours. No wizard, no modal.
_Avoid_: tour, onboarding (that is the dashboard flow), tooltip

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
