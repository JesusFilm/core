# Languages

The reference-data context. `api-languages` owns the catalog of **Languages**, the **Countries** and **Continents** they are spoken in, and the localized **names** of all three — served to the rest of the graph by federated `@key`. Production is the source of truth: its database is dumped to object storage and that dump seeds every lower and local environment via a full restore, so publisher edits made in production are permanent, while edits made downstream are overwritten on the next import.

## Language

### Catalog

**Language**:
A spoken language in the catalog, identified by a stable external id (a numeric string such as `529` for English — _not_ a UUID). Carries its `bcp47` tag, `iso3` code, `slug`, and `hasVideos`. The federated anchor other contexts reference by `languageId`.
_Avoid_: locale, tongue, dialect

**has videos**:
Whether the Language has at least one published video in the media catalog. A denormalized flag set upstream (never written by this API); it is the **public-visibility gate** — the public `languages`/`languagesCount` queries force `hasVideos: true`, while `adminLanguages` sees every Language.
_Avoid_: published, active, visible, enabled

**bcp47**:
The Language's IETF BCP-47 tag (e.g. `en`, `zh-Hans`). One of the few fields editable here (`languageUpdate`).
_Avoid_: locale code, ietf tag

**iso3**:
The Language's ISO 639-3 three-letter code. Editable here alongside `bcp47`.
_Avoid_: iso code, iso639

### Geography

**Country**:
A nation in the catalog, identified by a stable external id (e.g. `US`). Carries population, latitude/longitude, and flag image sources, and belongs to exactly one Continent.
_Avoid_: nation, region, territory

**Continent**:
The top-level grouping a Country belongs to. Has localized names and a set of Countries; the coarsest geographic bucket.
_Avoid_: region, area

**Country Language**:
The association of one Language with one Country — the fact that a Language is spoken in, or offered for, that Country. Carries `speakers`, `displaySpeakers`, `primary`, `suggested`, and `order`. A Language may appear **twice** for a Country: once as the spoken-fact row and once as a suggested row (unique key is `(languageId, countryId, suggested)`).
_Avoid_: locale, country-locale, spoken language

**primary (Country Language)**:
Marks the Country's main spoken Language. A property of the factual association, not of the Language itself.
_Avoid_: default, official, main language

**suggested**:
Marks a **curated recommendation** — "offer this Language for this Country" — rather than a spoken-fact. A suggested row may coexist with the factual (`suggested: false`) row for the same Country/Language. Not a machine-generated candidate awaiting approval.
_Avoid_: recommended (in code), proposed, candidate, auto-suggested

**speakers**:
The actual number of people who speak the Language in the Country.
_Avoid_: population, count

**display speakers**:
The curated speaker count shown in the UI (rounded or overridden), distinct from the true `speakers` figure. Optional.
_Avoid_: shown speakers, rounded speakers

### Localized names

**Localized Name**:
A rendering of an entity's name in a particular language. The shared pattern behind **Language Name**, **Country Name**, and **Continent Name** — each is `(value, primary, the language it is written in)`.
_Avoid_: translation, label, title, i18n name

**Primary Name**:
The Localized Name flagged `primary: true` — the entity's canonical/native rendering (e.g. a Language's autonym). Name resolution returns the name in the requested language, else the name in the **fallback name language**, else the Primary Name.
_Avoid_: default name, native name, canonical name (in code)

**fallback name language**:
The default language names resolve to when no language is requested — English, hardcoded as Language id `529`. The `name(languageId:)` argument overrides it.
_Avoid_: default locale, base language

**Named Language** vs **Name Language** (Language Name only):
A **Language Name** relates two Languages: the **Named Language** (the Language the name is _about_ — `parentLanguageId`) and the **Name Language** (the Language the name is _written in_ — `languageId`). Distinguish them explicitly; see the hazard below.
_Avoid_: parent/child language, source/target language

> **The `languageId` overload (hazard).** On the `LanguageName` type, `languageId` is the **Name Language** (the language the text is written in), and `parentLanguageId` is the **Named Language**. But the `languageNameUpdate` mutation flips it: its `languageId` argument is the **Named Language**, and `nameLanguageId` is the Name Language. Same word, opposite referent depending on where you are. Always say which Language you mean — the one being named, or the one the name is written in.

### Access

**Publisher**:
The sole role in this context (`LanguageRole.publisher`); the single gate on every admin query and mutation (`adminLanguages`, `languageUpdate`, `countryLanguage*`, `audioPreview*`). Held via a User's `UserLanguageRole`.
_Avoid_: admin, editor, curator

**Audio Preview**:
A short spoken audio sample for a Language (`value` URL plus `duration`, `size`, `bitrate`, `codec`), one per Language. Used to preview how a language sounds.
_Avoid_: sample, clip, voiceover
