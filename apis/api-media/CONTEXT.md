# Media

The catalog of films and their translations. `api-media` owns the video catalog — what titles exist, how they relate, the language-specific renditions people actually watch, and the assets, subtitles, and metadata that go with them. It is the source of truth for media content; language definitions and user identity live in other contexts and are referenced here by id.

## Language

### The catalog

**Video**:
A single catalogued work — a film, a series, an episode, or a clip. It is language-agnostic: it holds no playable footage and no display text itself, only structure (its label, its parent/child relationships, its primary language). What you watch and read comes from its Variants and localized text.
_Avoid_: Film, title, asset (a Video is none of these on its own)

**Label**:
The kind of Video: `collection`, `series`, `episode`, `segment`, `featureFilm`, `shortFilm`, `trailer`, or `behindTheScenes`. Determines how a Video sits in the hierarchy and how it is presented.
_Avoid_: Type, category, kind

**Edition**:
A distinct cut of a Video — a specific edit of the footage, defaulting to `base`. An Edition owns its own set of Variants and Subtitles, so choosing an Edition selects which footage and timing you get. Alternate editions are different edits of the same work, not different translations of it.
_Avoid_: Version (reserved for the numeric revision counter), cut, release

**Primary Language**:
The Video's original, canonical language. Contrast with the many languages a Video is _available_ in via its Variants and translated text.
_Avoid_: Default language, source language

**Origin**:
The provenance of a Video — the producer or source organisation it came from. A curatorial fact about who made it.
_Avoid_: Source (reserved — see Stream Source), publisher

### What people watch

**Variant**:
The language-specific, playable rendition of a Video within an Edition — one per language. This is the thing that actually streams: it carries the HLS/DASH streams, duration, downloads, and its own shareable slug. When a user "watches a video in Spanish", they are watching a Variant.
_Avoid_: Rendition, version, stream (informally); never conflate with Video

**Download**:
A single downloadable file of a Variant at one Quality (e.g. `sd`, `high`, `distroLow`). A Variant may offer several Downloads at different qualities.
_Avoid_: File, render, asset

**Upload**:
An in-progress ingestion of new footage that will become a Variant — a source file moving through a status lifecycle (created → processing → ready/error) as it is transcoded. Distinct from the finished Variant it produces.
_Avoid_: Import, ingest job, upload (as a noun for the finished file)

**Subtitle**:
A timed-text track (VTT and/or SRT) for one Edition in one language. Includes both same-language captions and translated subtitles.
_Avoid_: Caption, closed caption, track

**Stream Source**:
Where a Variant's playable stream originates — `internal`, `mux`, `cloudflare`, or `youTube`. Exposed to clients as `VideoBlockSource`. This is the delivery origin of the bytes, not the catalog Origin of the work.
_Avoid_: Origin (that is a catalog concept), provider

### Localized text

**Localized Text**:
The umbrella for a Video's per-language display strings — its **Title**, **Description**, **Snippet** (a short summary), **Image Alt** (alt text for imagery), and **Study Question**. Each exists once per language and is edited independently of the footage.
_Avoid_: Metadata, translation (reserve "translation" for the act, not the record)

**Primary** (flag):
On any Localized Text or Subtitle, marks the value in the Video's original language — the canonical entry that others are translations of.
_Avoid_: Default, main, original (as a field name)

**Crowdin**:
The external translation platform that produces localized text. A `crowdInId` links a local text record back to its Crowdin entry.
_Avoid_: Translation service (be specific)

### Classification

**Keyword**:
A free-text, per-language search term attached to a Video. Uncontrolled — anyone can coin one — and used for discovery.
_Avoid_: Tag, label, term

**Tag**:
A hierarchical label shared across subgraphs, attached to any record (not just Videos) through a Tagging. Drawn from a controlled set with parent/child structure and localized names.
_Avoid_: Keyword, category, taxonomy

**Tagging**:
The link that attaches a Tag to a specific record, identified polymorphically by type and id. The join between a Tag and whatever it labels.
_Avoid_: Tag assignment, label link

**Taxonomy**:
A controlled vocabulary of `category` → `term` entries with localized labels — the fixed classification scheme (e.g. content types) that the catalog is organised against. Contrast Keyword (free) and Tag (labels applied to records).
_Avoid_: Category list, controlled tags

**Bible Citation**:
A scripture reference attached to a Video — a Bible Book plus an optional chapter/verse range (identified by OSIS id). Expresses which passage a Video covers.
_Avoid_: Reference, verse, scripture link

**Bible Book**:
A book of the Bible (with its OSIS id, Paratext abbreviation, testament, and localized names) that Citations point at.

### Distribution & access

**Platform**:
A consuming surface for media — `arclight`, `journeys`, or `watch`. A Video can restrict which Platforms may view or download it.
_Avoid_: Client, app, channel

**Playlist**:
A user-owned, ordered collection of Variants, with an optional shareable note. Curation belonging to a person, not part of the catalog structure.
_Avoid_: Collection (that is a Video Label), list

**Short Link**:
A short, redirecting URL owned by a Short Link Domain — mapping a path on a managed hostname to a destination, including legacy video redirects. The catalog's URL-shortening surface.
_Avoid_: Redirect, slug, permalink

**Arclight API Key**:
A credential granting access to the Arclight Platform, carrying a default platform for the caller.
_Avoid_: Token, secret

### People

**User Media Profile**:
A user's media-specific preferences — their interest in particular Videos, languages, and countries. Keyed by a user id owned by the user context; this holds only the media-facing part.
_Avoid_: Account, user (the identity lives elsewhere)

**Media Role**:
A media-scoped permission held by a user — `publisher` or `youtubeAdmin`. Governs what a user may do within this context specifically.
_Avoid_: Permission, access level

### External media services

**Mux**:
The transcoding and streaming provider that turns an uploaded master into playable renditions and generated subtitle tracks.

**Cloudflare Image / R2**:
The asset stores — Cloudflare **Images** for pictures, **R2** for video and subtitle files. An "asset" in this context is a stored file in one of these.
_Avoid_: Bucket, blob, file store (when the specific store matters, name it)

**YouTube Video**:
A record of a YouTube video an operator has _reviewed_ against the catalog, carrying a review state (`LINKED`, `DISMISSED`, `SKIPPED`). Absence of a record means "not yet reviewed"; it is a review artifact, not a mirror of a YouTube channel.
_Avoid_: Video (that is a catalog concept)
