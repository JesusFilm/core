# Arclight

The legacy-compatibility surface of the platform: a read-only REST API that preserves the vocabulary and response shapes of the original Arclight Media API (`api.arclight.org`) for external consumers, while sourcing everything from the modern media and languages contexts. It owns no entities — every noun here is a renamed projection of another context's entity.

## Language

### Catalog

**Media Component**:
A piece of catalog content exposed to API consumers — the Arclight name for the media context's Video. Identified by `mediaComponentId` (the Video id).
_Avoid_: video (in this context's API surface), asset

**Component Type**:
Whether a Media Component is directly playable (`content`) or a grouping of other components (`container`/`collection`). Derived from playability, not stored — the stored classification is the Sub Type.
_Avoid_: conflating with Sub Type

**Sub Type**:
The stored editorial classification of a Media Component (featureFilm, shortFilm, episode, series, collection, segment, …) — the Arclight name for the media context's video label.
_Avoid_: label (in this context's API surface), genre

**Media Component Link**:
The containment relationship between Media Components — which components a container `contains`, and which containers a component is `containedBy`.

**Media Component Language**:
A playable rendition of a Media Component in a specific language — the Arclight name for the media context's Variant. Carries streaming, download, subtitle, and share URLs; identified by `refId` (the Variant id).
_Avoid_: variant (in this context's API surface)

**Taxonomy**:
A controlled vocabulary of terms (e.g. OSIS Bible books, content types, genres) grouped by category, with labels localized per Metadata Language Tag.

### Languages & Countries

**Media Language**:
A language that has media available, with speaker/country/content counts — the Arclight projection of the languages context's Language, identified by numeric `languageId`.

**Media Country**:
A country with population, language counts, and flag assets — the Arclight projection of the languages context's Country.

**Metadata Language Tag**:
A BCP-47 tag (from a fixed whitelist) that a consumer requests metadata text in. Distinct from `languageId`: tags select the language of _descriptive text_; numeric ids select the language of _media renditions_. Responses report the tag actually used after fallback (default English).
_Avoid_: locale, using tag and languageId interchangeably

### Consumers & Delivery

**API Key**:
The query-string credential identifying an external consumer application. It is an identity/configuration handle (e.g. it determines the consumer's default Platform and, for some distribution partners, download-quality behavior), not an enforced secret.
_Avoid_: token, session

**API Session Id**:
An opaque value echoed back to the consumer for legacy compatibility. Not a real session.

**Platform**:
The consumer surface a response is shaped for — `ios`, `android`, or `web`. Resolved from the request, else the API Key's default, else `ios`; controls the shape of streaming URLs.

**Redirect Endpoint**:
A legacy by-convention short URL (`/hls`, `/dl`, `/dh`, `/s`) that resolves a Media Component + language to the actual stream/download/share URL via 302.

**Keyword Short Link**:
An `arc.gt` short keyword that resolves to a media target — the id-only reference to the Short Link entity owned by the media context.
