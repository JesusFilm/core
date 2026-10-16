# FGE-2: internal-style slugs/titles leaking into public display

**Status:** inventory only — no data changed, no PR opened, per the original ask.

**Update (2026-09-01):** the [full-catalog production pass](#2026-09-01-full-catalog-production-pass) below superseded the scope limits noted in the original pass — production DB access became available and the exhaustive multi-language sweep the SQL below describes was actually run. That section is now authoritative for "what's live"; keep reading for methodology and the original API-only pass for how the two were cross-checked.

**Scope achieved (original pass, 2026-08-31):** a verified, reproducible confirmation of both example bugs (with live evidence they currently 404 in production), a full scan of the 1,182-video English-title catalog, and a documented, tested methodology for the exhaustive multi-language pass this sandbox could not complete at the time.

## Where this data lives (Core data model)

Catalog data lives in `apis/api-media`, schema at `libs/prisma/media/db/schema.prisma`. Relevant models (read the file for full field lists):

- `Video` (`libs/prisma/media/db/schema.prisma:158`) — `id` (the canonical video id, also the legacy Arclight `mediaComponentId` — confirmed below), `slug` (unique, public URL segment), `label`.
- `VideoTitle` (`:201`) — `value` (the display title text), `languageId`, `videoId`, unique per `[videoId, languageId]`. This is where a bad title like `Brand_Video` or `Tümlükden Nura` actually lives.
- `VideoVariant` (`:252`) — per-language playable rendition, own unique `slug`, `share` URL field.
- `ShortLink` (`apis/api-media`, `:651`) — `pathname`/`to`, used for `arc.gt` short links.

`Video.slug` is derived from the title text by `slugify()` (`apis/api-media/src/lib/slugify/slugify.ts`): it lower-cases, replaces whitespace/punctuation runs with `-`, strips leading/trailing junk, and de-dupes on collision — but it does **not** strip diacritics and has no way to know a title string contains two languages' names concatenated. So a bad `VideoTitle.value` (e.g. an untranslated production filename with two names in it) turns directly into a bad, still-broken `Video.slug`. **Root cause is upstream, in the title text, not in the slugifier.**

### The public URL path (how a bad slug becomes a public 404 risk)

`apps/resources` is the public `jesusfilm.org/watch` site (confirmed via `apps/resources/CONTEXT.md:26`: `/watch/{video-slug}/{language-slug}`, and via `apps/docs/docs/01-welcome.md:63`). Old numeric-id links go through a **Legacy Watch Redirect** that looks up the current `Video.slug`/language slug and 302s to the modern path — this is exactly the mechanism that turns a stale short link into a live 404, demonstrated below.

## Confirmed findings (live-verified)

These three were followed end-to-end against **live production** (`api.arclight.org`, `arc.gt`, `jesusfilm.org`) on 2026-08-31. `mediaComponentId` returned by the public Arclight API is the same value as `Video.id` — confirmed by reading `apps/arclight/src/app/v2/[...route]/_media-components/[mediaComponentId]/index.ts:16-30`, which passes `mediaComponentId` straight into `video(id: $id)`, and `.../languages/index.ts:100-104`, which does `mediaPrisma.video.findUnique({ where: { id: mediaComponentId } })`.

### 1. `2_0-Tumlukden` — the user's own example, and it currently 404s

- **Field:** `VideoTitle.value` (English/default metadata slot) → propagates into `Video.slug`.
- **Current bad value:** `Tümlükden Nura`
- **Evidence:**
  - `GET https://api.arclight.org/v2/media-components?apiKey=test&limit=100&page=…` → item `{"mediaComponentId":"2_0-Tumlukden","title":"Tümlükden Nura", …}`.
  - Live redirect chain, followed with `curl -A "Mozilla/5.0" -D -`:
    ```
    arc.gt/hil3v
      → 302 https://jesusfilm.org/bin/jf/watch.html/2_0-Tumlukden/184566
      → 301 https://www.jesusfilm.org/bin/jf/watch.html/2_0-Tumlukden/184566
      → 302 /watch/t%C3%BCml%C3%BCkden-nura.html/indonesian-isa.html
      → 404
    ```
  - So the live `Video.slug` for this video **is** `tümlükden-nura` (the raw bad title, slugified as-is), the site's own redirect resolves to it, and **the destination page is currently broken (404)** for anyone following the official share link.
- **Public exposure:** confirmed reachable / currently broken. Highest priority — this isn't a "cosmetic ugly slug," it's an active 404 on a live share link today.
- **Proposed correction:** needs a content-team decision on the single correct title (this looks like a Turkmen title with a second word — `Nura` — appended that shouldn't be there, going by the pattern of the other example). Do **not** auto-strip a token here without human review of the actual language content; flagging only.

### 2. `2_0-La_Busqueda_The_Search` — matches the user's second example pattern, also 404s

- **Field:** `VideoTitle.value` → `Video.slug`.
- **Current bad value:** `La Búsqueda - The Search` (title), `id`/legacy id contains the underscored form `La_Busqueda_The_Search`.
- **Evidence:** same method —
  ```
  arc.gt/c78hb
    → 302 https://jesusfilm.org/bin/jf/watch.html/2_0-La_Busqueda_The_Search/1269
    → 301 https://www.jesusfilm.org/bin/jf/watch.html/2_0-La_Busqueda_The_Search/1269
    → 302 /watch/la-b%C3%BAsqueda-the-search.html/dutch.html
    → 404
  ```
- **Public exposure:** confirmed reachable / currently broken.
- **Proposed correction:** same caveat — this is a bilingual title (`La Búsqueda` Spanish + `The Search` English) concatenated with a hyphen into one field; needs a content decision on which language's title belongs in which language's `VideoTitle` record (Spanish variant should read `La Búsqueda`, English variant `The Search`, not both crammed together in either).

Note: the user's example string was `'La_Busqueda_La Recherche'` (implying a French pairing); the live data found under this id is the English pairing (`La Búsqueda - The Search`). Same bug class, but I could not find a `La Recherche` variant in the English-metadata scan — it may exist only in a French-language `VideoTitle` record, which requires the per-language pass this sandbox couldn't complete (see below).

### 3. `2_0-Brand_Video` — live, not 404, but a raw internal filename as the public title

- **Field:** `VideoTitle.value` (English).
- **Current bad value:** `Brand_Video`
- **Evidence:** `arc.gt/gmw0a → …→ /watch/brand-video.html/english.html → 200`. Slugify happens to turn `Brand_Video` into a clean `brand-video` slug (underscore → hyphen), so the **slug is fine**, but the **display title still literally reads "Brand_Video"** on the live page — a raw internal/production-style name shown to end users.
- **Public exposure:** confirmed reachable and live (200), title bug only (not a 404 risk).
- **Proposed correction:** `Brand Video` at minimum (underscore → space), pending a real content title from whoever owns this asset — `Brand_Video` reads like a placeholder filename, not a finished title.

## Full-catalog scan (English metadata only)

Pulled all 1,182 media components via `GET https://api.arclight.org/v2/media-components?apiKey=test&limit=100&page={1..12}` (public, no real key needed — any non-empty `apiKey` value works). Regex-scanned every English `title` and `mediaComponentId` for: underscores, leading/trailing whitespace, file-extension remnants (`.mp4`/`.mov`/etc.), version-tag remnants (`_v1`/`_final`/etc.), ALL-CAPS tokens, and exact-duplicated word runs.

113 raw hits, all but the 3 above were **false positives** after checking each by hand — legitimate branding/terminology that happens to be ALL-CAPS or contain an acronym:

- `LUMO` — a real film series name ("The Lumo Project"), appears ~90 times (`6_GOLuke…`, `6_GOMark…`, `6_GOMatt…`, etc.) — not a bug.
- `YHWH`, `LORD`, `JESUS` — legitimate biblical/theological terms, expected to be capitalized.
- `NUA`, `NUR` (`7_0-Easter`, `7_0-EasterTrailer`, `7_0-ncs`, `7_0-nur`, `7_Origins`, `Nua`) — appears to be a real branded short-film series name ("Nua"), not an internal code; left out of the CSV as not-a-bug, but flagged here in case a reviewer disagrees — I did not verify a public URL for these the way I did for the top 3, given time budget.
- `JFM1` ("JFM Collection"), `THE FOUR`, `MENA` — plausible legitimate branding/regional acronyms, not internal-style leakage.

**Only `2_0-Brand_Video` survived as a genuine underscore-in-title hit** in the English-only scan. The other two confirmed findings (`Tumlukden`, `La_Busqueda_The_Search`) were **not** caught by the mechanical regex — they read as plausible prose ("Tümlükden Nura", "La Búsqueda - The Search") and only stood out because they were named explicitly in the task. This is the key methodological finding: **regex pattern-matching on the English metadata slot alone is not sufficient** to find this bug class. The two known real examples are concatenated-multilingual titles, which by construction look like ordinary well-formed phrases in isolation — they're only detectable by (a) knowing what the video's actual single-language title should be, or (b) comparing a video's titles _across_ its available languages and flagging near-duplicate-but-different-script/language pairs crammed into one record.

## Limits of this pass, and what a complete pass needs

This sandbox has **no production database credentials** and **no working internal GraphQL gateway endpoint** (tried a few guessed hostnames for `api-gateway`'s production URL — all failed; the real one isn't documented in `apis/api-gateway/CONTEXT.md` or checked-in env-example files). The local dev Postgres (`PGHOST=db`) is unmigrated/empty. Everything above was obtained through the **public** Arclight REST API and the **public** production `jesusfilm.org` site — which is why "record id" here is the (real, matching) `Video.id`/`mediaComponentId`, not a separately-verified internal cuid, and why only the English metadata slot was checked at scale: the public API requires a per-language-tag request per video to see a non-English title, and there was no time budget in this pass to make ~1,182 × (number of that video's `availableLanguages`) requests.

**What someone with real DB/GraphQL access should run** to get the authoritative, complete inventory:

```sql
-- Every title with an underscore, ALL-CAPS run, leading/trailing whitespace,
-- a file-extension remnant, or a same-word-run duplication, joined to the
-- video's slug and its variant slugs, so exposure can be judged in one query.
SELECT
  v.id            AS video_id,
  v.slug          AS video_slug,
  v.published,
  vt."languageId",
  vt.value        AS title,
  vt.primary
FROM "VideoTitle" vt
JOIN "Video" v ON v.id = vt."videoId"
WHERE vt.value ~ '_'                                   -- underscore-joined
   OR vt.value ~ '\.(mp4|mov|mxf|wav|mp3|avi|mkv)$'     -- file-extension remnant
   OR vt.value ~ '_v[0-9]+$|_final$|_draft$|_master$'   -- version-tag remnant
   OR vt.value ~ '^\s|\s$'                              -- leading/trailing whitespace
   OR vt.value ~ '([A-Za-z][A-Za-z''-]{2,})\s+\1'       -- crude duplicated-word check (needs a real fuzzy/near-dup pass, see below)
ORDER BY v.published DESC, v.slug NULLS LAST;

-- Same shape for the slug fields directly (Video.slug, VideoVariant.slug),
-- since slugify() only fixes whitespace/case/punctuation, not concatenation:
SELECT id AS video_id, slug FROM "Video"
WHERE slug ~ '_' OR slug ~ '\.(mp4|mov|mxf)' OR slug ~ '^\s|\s$';

SELECT id AS variant_id, "videoId", "languageId", slug FROM "VideoVariant"
WHERE slug ~ '_' OR slug ~ '\.(mp4|mov|mxf)' OR slug ~ '^\s|\s$';
```

The regex for "doubled-up multilingual names concatenated into one field" (the actual bug in both of the user's examples) **cannot be a simple SQL pattern** — neither example contains an underscore or a recognizable marker once you're inside the value. The only reliable check is: for each `Video`, pull all its `VideoTitle` rows, and for each row, run a language-detection / cross-reference against the _other_ rows' values (if a `de` row's value contains substantial overlapping text with the `fr` row's value, or contains a second capitalized phrase that doesn't belong to the row's own `languageId`, flag it). That's a script, not a query — happy to write it as a follow-up if someone confirms DB or admin-GraphQL access first.

To resolve "is it reachable on a public URL" for every hit from the SQL query above, for each `(video.slug, languageId)` pair, resolve the language's own slug (via `api-languages`) and `curl -o /dev/null -w '%{http_code}' https://www.jesusfilm.org/watch/{video.slug}.html/{language-slug}.html` — exactly the manual check done above for the three confirmed findings, but automatable once you have the full row set.

## Files

- `docs/research/2026-08-31-fge2-slug-title-audit.csv` — machine-readable list of every hit from the original API-only pass (3 confirmed + the 8 reviewed-and-cleared false positives, kept for audit-trail transparency), ordered by public exposure.

## 2026-09-01: full-catalog production pass

Run via `nx run api-media:audit-slug-title-hygiene` (`apis/api-media/src/scripts/audit-slug-title-hygiene.ts` + `run-slug-title-hygiene-audit.ts`) against the real production `media` database, using the SQL-equivalent logic sketched above instead of the public Arclight API sample. Read-only — no data changed. Output: `docs/research/2026-09-01-fge2-slug-title-audit-prod.{json,csv}`.

**Scale:** scanned every `Video.slug`, `VideoTitle.value` (all languages), and `VideoVariant.slug` in the catalog — 2,761 raw pattern hits. Of those, 687 are high-confidence (mechanical: underscore, whitespace, file-extension/version-tag remnants) and eligible for a proposed auto-fix; 2,074 are low-confidence heuristic hits (all-caps tokens, dash-separated titles) reported but **not** live-checked by default, since the earlier pass already established a ~97% false-positive rate for those two heuristics on this catalog's real branding (LUMO, YHWH, MENA, and the legitimate "La Búsqueda - {language}" bilingual-title convention documented below).

**Reachability, of the 687 high-confidence hits (rate-limited, capped at 500 live checks — the remaining 118 are marked `SKIPPED_CHECK_LIMIT` in the CSV, re-run with `SLUG_TITLE_AUDIT_MAX_CHECKS` raised to clear them):**

| category                                | count |
| --------------------------------------- | ----- |
| LIVE (200 — renaming risks a fresh 404) | 498   |
| BROKEN (already 404 — nothing to lose)  | 71    |
| NO_SLUG                                 | 3     |

**The two example bugs, now with real internal ids and confirming/correcting the original pass's guesses:**

- `2_0-La_Busqueda_The_Search`, `VideoTitle.value` for **French** (`languageId 496`): the actual stored value is `"La_Busqueda_La Recherche\n"` — an exact match for the user's cited example, down to the trailing whitespace. **Confirmed BROKEN (404)** at `https://www.jesusfilm.org/watch/la-búsqueda-the-search/french`. This video's _other_ ten language rows all correctly follow a `"La Búsqueda - {The Search, translated}"` convention (Dutch, German, Filipino, Mongolian, Indonesian, Turkish, Kazakh, Vietnamese, Russian, English all present and well-formed) — the French row is the one place that convention broke, using underscores instead of `" - "` and picking up a trailing newline. **Proposed fix:** `La Búsqueda - La Recherche`, matching the established per-video pattern (not the earlier pass's generic underscore→space guess).
- `2_0-Brand_Video`, `VideoTitle.value` (English, `languageId 529`): confirmed still `Brand_Video`, still **LIVE (200)**. Unchanged from the original pass.
- `2_0-Tumlukden` ("Tümlükden Nura"): **zero findings**, confirming the documented limitation — an unseparated two-word concatenation has no mechanical signature. It still needs the same live-verified 404 flagged in the original pass; this run doesn't supersede that finding, it just couldn't independently rediscover it.

**New, previously-unknown findings — 10 more videos with underscore-joined internal-style `Video.slug` values, all propagating into every one of that video's `VideoVariant.slug` rows too:**

| video id                         | current slug               | proposed                   | published           | reachability   |
| -------------------------------- | -------------------------- | -------------------------- | ------------------- | -------------- |
| `2_PrayingHandsVert`             | `praying_hands_vert`       | `praying hands vert`       | true                | **LIVE (200)** |
| `global_soccer_event_collection` | `soccer_event_collection`  | `soccer event collection`  | true                | **LIVE (200)** |
| `16_ShineFilmColl`               | `shine_films_collection`   | `shine films collection`   | false (unpublished) | BROKEN (404)   |
| `2_2026AppUpdate`                | `April2026_app_update`     | `April2026 app update`     | true                | BROKEN (404)   |
| `2_DamtewStormsofLifeVert`       | `Damtew_StormsofLife_Vert` | `Damtew StormsofLife Vert` | true                | BROKEN (404)   |
| `2_harsh_vibe_explanation`       | `2_Rescue_Explanation`     | `2 Rescue Explanation`     | true                | BROKEN (404)   |
| `Rescue`                         | `2_Rescue`                 | `2 Rescue`                 | true                | BROKEN (404)   |
| `7_KnowGod`                      | `Nua_Know_God`             | `Nua Know God`             | true                | BROKEN (404)   |
| `7_KnowGod0401`                  | `Know_God_1_Created`       | `Know God 1 Created`       | true                | BROKEN (404)   |
| `7_KnowGod0402`                  | `Know_God_2_Sin`           | `Know God 2 Sin`           | true                | BROKEN (404)   |
| `7_KnowGod0403`                  | `Know_God_3_Jesus`         | `Know God 3 Jesus`         | true                | BROKEN (404)   |
| `7_KnowGod0404`                  | `Know_God_4_Invited`       | `Know God 4 Invited`       | true                | BROKEN (404)   |

The proposed values are mechanical (underscore → space, trimmed) and safe as a _starting point_, but a human should confirm word casing/spacing against the video's actual title before applying — the script deliberately never auto-applies these.

**The two LIVE ones (`praying_hands_vert`, `soccer_event_collection`) are the actual priority items**: they're the only underscore-slug bugs where a careless rename risks turning a working page into a fresh 404. Everything else in the underscore-slug table is already broken, so fixing it is pure upside.

**523 additional lower-severity hits**, all on `VideoTitle.value` only (never on a slug, so never URL-breaking): leading/trailing whitespace across 271 distinct videos' localized titles, spread across many languages — reads as a systemic quirk in how titles get imported/edited (Crowdin export, copy-paste, etc.) rather than one-off internal-name leakage. Full list in the CSV; not reproduced here for length.

**Heuristic false positives worth noting**, so the CSV's `needsContentReview: true` / `false` fields aren't taken as gospel:

- The `version-tag-remnant` regex flagged `6-being-made-new` / `"6. Being Made New"` (ends in `-new`) and `"Sacrifício final"` (Portuguese for "final sacrifice", ends in `final`) — both false positives, not production-file remnants. Only 3 hits total, but illustrates the regex is a blunt instrument at the word-boundary.
- The `possible-multilingual-concatenation` (dash-separated) heuristic matches `La Búsqueda`'s _entire_ legitimate naming convention (10 of 11 language rows) — confirming the original pass's conclusion that this heuristic needs per-video context, not a standalone regex, to be trustworthy. Left low-confidence and un-auto-checked by design.

**Files:** `docs/research/2026-09-01-fge2-slug-title-audit-prod.json` and `.csv` — the full 2,761-row output, ordered LIVE → BROKEN → NO_SLUG → SKIPPED_CHECK_LIMIT → SKIPPED_LOW_CONFIDENCE. Treat as a snapshot of real production content as of 2026-09-01; re-run the script for a fresh pass before acting on it.

## 2026-09-02: fixes applied to production

Verified against staging first (`nx run api-media:fix-*` pointed at the `stg` Doppler config), then run for real against `prd`. All three scripts are idempotent (safe to re-run) and call `videoCacheReset`/`videoVariantCacheReset` after every write, matching FGE-97/98's established pattern.

- **`fix-underscore-video-slugs`**: all 11 remaining underscore-slugged videos renamed successfully — `7_KnowGod0401`–`0404`, `16_ShineFilmColl`, `2_2026AppUpdate`, `2_DamtewStormsofLifeVert`, `2_harsh_vibe_explanation`, `Rescue`, `2_PrayingHandsVert`, `global_soccer_event_collection`. Every cascading `VideoVariant.slug` renamed too (`Rescue` alone had 31 language variants). One transient `ConnectionClosed` (P1017) on the first attempt, before any write — retried cleanly with zero partial state, consistent with the idempotent design.
- **`fix-underscore-video-titles`**: both applied — `Brand_Video` → `Brand Video`, and the French `La_Busqueda_La Recherche` → `La Búsqueda - La Recherche`.
- **`fix-whitespace-video-titles`**: 522 of 27,488 scanned `VideoTitle` rows trimmed across ~264 videos (close to, but not identical to, the 2026-09-01 audit's 523/271 — the catalog moves).

**Important caveat, discovered post-fix:** the two previously-**LIVE** renames (`praying_hands_vert` → `praying-hands-vertical`, `soccer_event_collection` → `global-football-soccer-event`) now 404 on their _new_ slug — `WATCH_URL`/`WATCH_REVALIDATE_SECRET` were present, so the cache-invalidation call almost certainly fired for the new URL, meaning this isn't a caching miss on our end. Their _old_ slugs still return 200, serving a stale cached page that was never explicitly invalidated (`videoCacheReset` only revalidates the _current_ — now new — slug, not the one being replaced). This is the same forge-repo gap already diagnosed for `know-god` in PR #9559 (`know-god` itself still 404s despite being correctly fixed), now confirmed on two more videos. **Nothing further to do from Core** — the data is correct, matches the established fix pattern exactly, and the remaining public-facing 404s are blocked on the `JesusFilm/forge` work PR #9559 already flags. The stale old-slug pages will likely also 404 once their cache naturally expires, independent of anything in this repo.

- All 4 Know God episode slugs and the other 5 previously-already-broken renames remain 404 on their new slugs too — expected, no regression (they were already 404 before the fix).
