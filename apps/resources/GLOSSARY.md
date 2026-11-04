# Resources

The public-facing `jesusfilm.org` content surface: a next-generation rebuild of the Watch product (video library in 2,000+ languages) plus two newer sections — Resources (ministry assets authored in WordPress) and a Journeys template gallery. Owns no entities — Video, Variant, Language, and Journey vocabulary belong to the media, languages, and journeys contexts; the app owns only its viewing/browsing surfaces and the Resource framing.

## Language

### Watch surface

**Watch Home**:
The `/watch` landing page — the app's primary product surface; the site root redirects here. Browsing and search are served from the Algolia video index.
_Avoid_: Home page (the root is a redirect, not a page), VideoHomePage (an import alias)

**Container Video**:
A Video that groups children (its label is `collection`, `series`, or `featureFilm`) and renders as a browse page of its children rather than a playback page.
_Avoid_: Playlist, category

**Content Video**:
A leaf Video with no children — the playable detail page (hero player, Bible citations, discussion questions, related carousel).
_Avoid_: Episode (that is one specific label, not the general concept)

**Video Label**:
The media context's classification of a Video (`collection`, `series`, `episode`, `featureFilm`, `segment`, `shortFilm`, `behindTheScenes`, `trailer`). Decides container-vs-content rendering and the display badge; a container's label also names its children (a series has Episodes, a feature film has Chapters).
_Avoid_: Type, genre

**Watch Path**:
The `/watch/{video-slug}/{language-slug}` URL scheme. The first segment is a Video slug and the second a Language slug — except on the language home (`/watch/{language-slug}`), where the single segment is a language. Old numeric-id `watch.html` URLs are honored via the Legacy Watch Redirect.
_Avoid_: part1/part2 (route-parameter jargon; say which slug you mean)

**Legacy Watch Redirect**:
The compatibility shim that resolves an old CGI-style `/bin/jf/watch.html/{videoId}/{languageId}` URL (numeric ids) to the modern slug-based Watch Path.

### Language preferences

**Audio Language**:
The viewer's preferred spoken-audio language for playback, applied when the Video has a Variant in it. Defaults to English.
_Avoid_: Locale (that is the UI language of the site chrome, chosen separately)

**Subtitle Preference**:
The viewer's chosen subtitle language plus an on/off switch, persisted on the device and carried across videos.
_Avoid_: Captions setting

### Resources surface

**Resource**:
A ministry asset authored in WordPress and surfaced on `/resources` via search indexes — not a Video and not owned by any API context. Grouped into Resource Sections (equipment, training strategies, outreach, digital strategies, prayer).
_Avoid_: Post, article, asset

### Campaign pages

**Easter Collection Page**:
A hand-curated, per-language SEO campaign landing page (`/watch/easter.html/{language}.html`) presenting a fixed set of Easter videos with quotes, quiz, and campaign-year metadata. Its content is editorially fixed per campaign, not driven by the video catalog.
_Avoid_: Collection (see trap below), easter.html (a URL detail, not a name)

### Terminology traps

**Collection (overloaded)**:
Three unrelated meanings collide here: (1) the Video Label `collection` — a container type in the media catalog; (2) the `CollectionsPage` component — the Easter Collection Page, a marketing artifact; (3) the journeys context's Journey Collection. Always qualify which one you mean.

**Journeys section**:
The `/journeys` pages render the journeys context's Template Gallery and template detail views — Journey, Template, and Tag vocabulary is entirely upstream (shared with `journeys-admin` via `libs/journeys/ui`). Nothing journey-shaped is owned here.
