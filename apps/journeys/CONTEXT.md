# Journeys Viewer

The audience-facing delivery surface (`apps/journeys`, the NextSteps viewer): it plays back published Journeys to anonymous Visitors, one Step at a time or as a website, on the root domain or a team's Custom Domain, standalone or embedded. It owns no content — the **Journey**, **Block**, **Step**, **Card**, and **Action** vocabulary is owned by [Journeys](../../apis/api-journeys/CONTEXT.md), and the events it reports belong to [Journey Analytics](../../apis/api-journeys/CONTEXT-analytics.md). What this context owns is the _playback experience_: navigation state, delivery modes, and the Visitor's session on the device.

## Language

### Playback

**Conductor**:
The playback engine for a standard (non-website) Journey: it orchestrates which Step is on screen, the navigation affordances, header/footer visibility, and the reporting of view/navigation events. The signature concept of this context.
_Avoid_: player, controller, carousel

**Website Mode**:
The alternate rendering of a Journey flagged `website` — a scrolling multi-page website experience instead of the Conductor's card-by-card flow. The component is named `WebView`, but say "website mode".
_Avoid_: WebView (collides with mobile in-app webviews), site mode

**Block History**:
The client-owned ordered trail of Steps the Visitor has visited this session. The last entry is the **Active Step**; navigating back pops it, navigating forward pushes the next Step. Exists only on the device — the backend never sees it as state, only as reported events.
_Avoid_: navigation stack, breadcrumbs

**Active Step**:
The Step currently on screen (the last entry of the Block History). Its neighbours are pre-rendered off-screen so navigation feels instant.
_Avoid_: current card (a Card is the Step's content, not the Step), current slide

**Step Navigation**:
The single act of moving to the next or previous Step, triggerable by three equivalent inputs — chevron buttons, swipe, and arrow keys (all direction-reversed under RTL). One navigation is reported to both analytics sinks; GTM's `step_next` and Plausible's `navigateNextStep` are two names for the same act, not two acts.
_Avoid_: paging, sliding

**Locked Step**:
A Step the Visitor cannot advance past manually — forward navigation is disabled until an Action (e.g. answering a poll) moves them on. The `locked` flag is authored upstream; the enforcement is playback behaviour owned here.
_Avoid_: gated step, blocked step

### Delivery

**Root Domain**:
The product's own hostname (e.g. `your.nextstep.is`), serving any published Journey by Slug plus the public landing and template gallery pages.
_Avoid_: default domain, main site

**Custom Domain** (consumed):
A team's vanity hostname, owned by the [Journeys](../../apis/api-journeys/CONTEXT.md) context. Here it is a _routing input_: the incoming hostname scopes which Journey a Slug resolves to.
_Avoid_: host (ambiguous — Host is a presenter identity upstream), hostname (fine in code, not in conversation)

**Embed**:
The iframe presentation of a Journey — shown as a clickable preview card that expands to fullscreen playback. A Journey page that detects it is inside an iframe redirects itself to its embed form; an oEmbed endpoint hands out the iframe HTML to third-party sites.
_Avoid_: preview (implies the admin's preview), widget

**Variant**:
The rendering mode a Journey is mounted in: `default` (live audience), `embed` (iframe audience), `admin` (editor preview), or `customize` (template personalisation preview). Only `default` and `embed` report analytics events; `admin`/`customize` play back silently.
_Avoid_: mode (overloaded with theme mode and website mode), environment

### Audience

**Visitor** (consumed):
The anonymous audience member, owned by [Journey Analytics](../../apis/api-journeys/CONTEXT-analytics.md). This context is where the Visitor _comes into being_: an anonymous Firebase sign-in on the device mints the identity, and the client enriches it with country and referrer. Never a creator/User.
_Avoid_: user, viewer

**AI Assistant (Apologist)**:
The optional in-card conversational assistant a Visitor can chat with while viewing a Journey. "Apologist" is the product/prompt name; `showAssistant` gates it per card, and a server-side per-card kill switch can disable it in emergencies.
_Avoid_: chatbot; don't mix "chat" (the Visitor's outbound Chat Button/Message Platform) with "assistant" (the AI)
