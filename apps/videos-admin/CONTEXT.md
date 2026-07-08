# Videos Admin

The publisher-facing curation surface for the media and languages catalogs: managing Videos (metadata, children, variants, editions, subtitles, images, restrictions) and Language reference data (names, codes, country links). Owns no entities — Video, Variant, Edition, Subtitle, and Language are media/languages vocabulary; the admin's own domain is the publishing workflow, the upload lifecycle, and its display language.

## Language

### Access

**Publisher**:
The only role this app knows. It comes in two independent dimensions — a *media* publisher (may use the Video Library and Settings) and a *language* publisher (may use the Language Admin). A user can hold either, both, or neither; with neither they land on the Unauthorized page.
_Avoid_: Admin, mediaUserRole (no such role name exists — the role value is literally `publisher` in each dimension)

**Video Library**:
The GraphQL-backed admin list of all Videos, published or not (the `adminVideos` read model). Distinct from the **Algolia List**, an experimental read-only browse over the public Algolia search index — same videos, different (eventually-consistent) source.

### Publishing workflow

**Draft**:
A Video whose `published` flag is off. The UI status word for unpublished; a Draft that has *never* been published is the only kind of Video that may be deleted.
_Avoid_: Unpublished (as a UI label — the enum value is `unpublished`, the label is "Draft")

**Publishing Validation**:
The gate on publishing a Video: it must have a Title, Short Description, Description, Image Alt Text, and Banner Image — and, unless it is a container (collection/series), at least one playable Variant.

**Publish All**:
The bulk operation that publishes a container Video's children (optionally their Variants too), with a dry-run mode and a per-video validation-failure report. Video `published`, Variant `published`, and the Algolia record's `published` are three distinct publish states — say which one you mean.

**Locked**:
A Video the admin refuses to open or edit at all. Orthogonal to published/Draft.
_Avoid_: Read-only, archived

**Restricted (Downloads / Views)**:
Per-Video block-lists of consuming Platforms: a platform listed under Restricted Downloads or Restricted Views is *denied*, not allowed. The single most inverted term in this context.
_Avoid_: Allowed platforms, availability

### The video and its parts

**Audio Language**:
The UI's name for a media-context **Variant** — one language rendition of a Video. The Audio Languages tab, its add/publish/delete dialogs, and Downloads all operate on Variants.
_Avoid_: Translation, dub

**Child**:
A Video referenced by a container Video; ordering is the position in the parent's `childIds` list (drag to reorder). The children collection is renamed by the parent's Label: a Collection has **Items**, a Feature Film has **Clips**, a Series has **Episodes**.

**Label**:
The Video's type (collection, series, featureFilm, episode, segment, shortFilm, trailer, behindTheScenes). It decides whether a Children tab exists and which child Labels are valid. Trap: the value `segment` displays as **"Clip"**, and `trailer` as "Trailer/Preview".
_Avoid_: Type, category

**Short Description**:
The UI name for the media context's **snippet** (`videoSnippet*` mutations). Distinct from the (long) Description.
_Avoid_: Snippet (in UI copy), summary

**Video URL**:
The Information form's name for the Video's **slug**, shown as `jesusfilm.org/watch/{slug}` and immutable after creation. The create form still says "Slug".

**Origin**:
The media-context provenance of a Video, required at creation; a child defaults to its parent's Origin.

**Base Edition**:
The `base` Edition auto-created with every Video; its name cannot be edited. Subtitles attach to Editions.

**Placeholder Variant**:
The unpublished, non-downloadable English (`529`) Variant auto-created when a series or collection is created — required only so the container is visible on the frontends; it carries no media.

**Download Quality `auto`**:
A UI-only pseudo-value: "auto" asks Mux to generate the real qualities (high/sd/low) instead of uploading a file. `auto` never reaches the API as a quality.

### The upload

**Variant Upload**:
The multi-step lifecycle for getting a video file into a Variant: start → R2 prepared → R2 complete → Mux enqueued. It is resumable, and "complete" means *accepted by Mux*, not playable — encoding finishes in the background.
_Avoid_: Upload = playable

**Asset Upload**:
The separate single-shot R2 upload used for subtitles and download files. Not the Variant Upload lifecycle.

### Language Admin

**Language Name vs Native Name**:
Two editable names per Language: the Language Name is the English (`529`)-localized name; the Native Name is the language's own name for itself. English `529` is the default display-localization language everywhere in this app.

**Country Link**:
A languages-context `CountryLanguage` row edited here per Language: which countries the language is spoken in, with speaker counts and the `primary`/`suggested`/`order` flags that drive downstream sort order.

**Has Videos**:
The denormalized per-Language flag (set upstream, read-only here) used as a list filter; it gates public visibility of the Language.
