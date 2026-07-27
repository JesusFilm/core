# Watch (legacy)

The current production `jesusfilm.org/watch` surface: the video library in 2,000+ languages, browsed via Algolia and played back per-language. Owns no entities — Video, Variant, Language, and Label vocabulary belong to the media and languages contexts; this app owns only its URL scheme, viewer preferences, and campaign pages. `apps/resources` is its next-generation rebuild (see the succession note in CONTEXT-MAP.md).

## Language

### URL scheme

**Watch Path**:
The `/watch/{video-slug}.html/{language-slug}.html` URL scheme (three segments when the video sits inside a container: container/content/language). The `.html` suffix is mandatory on video and language slugs; suffix-less or old-slug URLs redirect to the canonical form.
_Avoid_: part1/part2/part3 (route-parameter jargon — say which slug you mean)

**Localized Home**:
The single-segment path `/watch/{language-slug}.html` — the Watch home scoped to one language, not a video page. The same first segment is a _video_ slug when a second segment follows; which it is depends on arity.

**Slug Map**:
The old→new video/language slug dictionary that keeps years of external links alive; a mapped slug redirects rather than 404s.

### Playback

**Content vs Container**:
The video being watched is the _content_; its parent series/collection (present only on three-segment paths) is the _container_. Whether a page plays or browses is decided by the Variant having a stream — not by the Video's Label.

**Audio Language / Subtitle Preference**:
The viewer's device-persisted playback languages: preferred audio language, preferred subtitle language, and a subtitles on/off switch. Distinct from the **Locale** (the UI language of the site chrome) — four representations of "language" coexist (language id, language slug, locale, BCP-47); say which one you mean. English id `529` is the universal default.
_Avoid_: Locale (for the video languages), captions

**Available vs Preferred**:
Per video, the languages its Variants and subtitles actually offer (_available_) versus what the viewer wants (_preferred_). Language pickers show the intersection; a preference the video can't satisfy is kept for the next video.

**Mux Insert**:
A config-driven promotional interstitial slotted into the home hero carousel (triggered at sequence start or after N slides). "Mux" in this app otherwise means playback _analytics_ and download URL detection — the player itself is video.js, and Inserts are the only Mux-hosted media.
_Avoid_: Ad (there is no ad system), Mux player

**Download Quality**:
The Variant's download renditions, `highest`/`high`/`low`. Downloading requires accepting the Terms of Use in-dialog.

**Embed Code**:
The shareable iframe snippet — it points at the _Arclight_ player (`videoPlayerUrl` with the Variant id as `refId`), not at this app. Offered only when the Variant has a stream.

### Discovery

**Trending vs Popular Searches**:
The empty-state search suggestions: live trending terms when available, a static popular list as fallback — the title changes with the source.

**Category Tile**:
One of the six hardcoded search-seed tiles on the search overlay (Bible Stories, Parables, Animated, Study, Family, Christmas); each is just a canned search term, not a taxonomy.

**Showcase Rail**:
A home-page row of videos driven by a hand-maintained list of video ids (Gospels, Advent, NUA, New Believer Course, LUMO...). Editorial curation in code, not a catalog concept.
_Avoid_: Collection (see trap below)

### Campaign & experiment

**Easter Collection Page**:
The hand-authored per-language Easter campaign landing (`/watch/easter.html/{language}.html`) — inline copy, Bible quotes, a Quiz, computed Easter/Passover dates. Editorially fixed per campaign year; not driven by the catalog.

**Experimental Cookie**:
The device flag that gates the new Watch experience versus the classic one; the Beta Banner advertises the experiment and "Switch to classic" clears the cookie. (The "beta tester" mailing-list CTA on the home page is unrelated.)

### Terminology traps

**Collection (overloaded)**:
Four colliding meanings in this app alone: (1) the media Video Label `collection`; (2) `PageCollection` — the browse page for _any_ container video, whatever its label; (3) `PageCollections` (plural) — the Easter Collection Page; (4) the Showcase Rails on home. Always qualify.

**Variant (two grains)**:
In the media context a Variant is one language rendition of a Video; in this app's Algolia index each _record_ is a variant, and a "variant slug" is the `{video}/{language}` pair addressing it. Same concept, but the search grain is per-language, not per-video.

**VideoHero**:
A folder of carousel/insert plumbing, not a visible component — the on-screen heroes have other names. Don't reach for "the VideoHero" when discussing UI.
