import { prisma } from '@core/prisma/languages/client'

import {
  type WessRawRow,
  extractWessRowArray as extractWessRowArrayShared,
  parseWessResponseBody,
  readNumberField,
  readRequiredEnv,
  readStringField
} from './wess-import-utils'

/**
 * WESS QueryRunner settings (edit here). The API token must stay in env (`WESS_API_TOKEN`).
 *
 * QueryId 155 returns country-language rows keyed by WESS `GEO_NO` (a numeric country id),
 * not by the 2-char `COUNTRY_CODE` we use as `Country.id`. To translate, we first fetch
 * QueryId 156 (countries) to build a `GEO_NO -> COUNTRY_CODE` map, then apply it to 155.
 */
const WESS_API_BASE_URL = 'https://www.mydigitalwork.space'
const WESS_COUNTRY_LANGUAGES_QUERY_ID = '155'
const WESS_COUNTRIES_QUERY_ID = '156'
const WESS_ENDPOINT_PATH = '/QueryRunner/rest/QueryAPI/GetData'

/** Log upsert progress every N rows (plus first and last). */
const WESS_IMPORT_PROGRESS_LOG_EVERY = 2500

/**
 * Tiered sort-priority sentinels (`999_999_999`, `888_888_888`, …) are stored in
 * `speakers` so consumers like `getTopSpokenLanguages` can rank "official" languages
 * above real populations. The largest legitimate per-country value seen in the data
 * is India English at ~339M, so anything at or above 400M is a sentinel and must
 * never be overwritten by WESS.
 */
const SENTINEL_SPEAKERS_THRESHOLD = 400_000_000

const log = (message: string): void => {
  console.log(`[wess-country-languages-import] ${message}`)
}

interface WessCountryLanguageRow {
  languageId: string
  geoNo: number
  speakers: number
}

interface ResolvedCountryLanguageRow {
  languageId: string
  countryId: string
  speakers: number
}

const WESS_LANGUAGE_ID_KEYS: string[] = [
  'languageId',
  'LanguageId',
  'language_id',
  'LAN_NO',
  'LanNo',
  'lan_no'
]

const WESS_GEO_NO_KEYS: string[] = ['GEO_NO', 'GeoNo', 'geo_no', 'geoNo']

const WESS_COUNTRY_CODE_KEYS: string[] = [
  'COUNTRY_CODE',
  'CountryCode',
  'country_code',
  'countryId',
  'CountryId',
  'country_id'
]

/**
 * Normalizes one WESS QueryId 155 row into our raw import shape. Returns null when
 * the language id or `GEO_NO` is missing — both are required to resolve a country
 * code via the QueryId 156 map.
 */
export function normalizeWessCountryLanguageRow(
  row: WessRawRow
): WessCountryLanguageRow | null {
  const languageId = readStringField(row, WESS_LANGUAGE_ID_KEYS)
  if (languageId == null) {
    return null
  }
  const geoNo = readNumberField(row, WESS_GEO_NO_KEYS)
  if (geoNo == null) {
    return null
  }
  const speakers =
    readNumberField(row, ['speakers', 'Speakers', 'SPEAKERS']) ?? 0
  return { languageId, geoNo, speakers }
}

/**
 * WESS GetData often returns JSON wrapped in `{ data: … }` or a tabular
 * `[ [ "col", … ], [ … ] ]` grid. This flattens those shapes into an array of
 * row objects. A bare object counts as a single row only when it carries both a
 * language id and a `GEO_NO`.
 */
export function extractWessRowArray(payload: unknown): WessRawRow[] {
  return extractWessRowArrayShared(
    payload,
    (row) =>
      readStringField(row, WESS_LANGUAGE_ID_KEYS) != null &&
      readNumberField(row, WESS_GEO_NO_KEYS) != null
  )
}

async function fetchWessQuery(
  queryId: string,
  label: string
): Promise<unknown> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const url = new URL(WESS_ENDPOINT_PATH, WESS_API_BASE_URL)
  url.searchParams.set('QueryId', queryId)

  log(`Fetching ${label} (QueryId=${queryId})…`)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { token }
  })

  const bodyText = await response
    .text()
    .catch(() => 'No response body available')

  if (!response.ok) {
    throw new Error(
      `WESS request failed (${label}): ${response.status} ${response.statusText} - ${bodyText}`
    )
  }

  log(
    `${label}: HTTP ${response.status} (${bodyText.length.toLocaleString()} chars)`
  )
  return parseWessResponseBody(bodyText)
}

/**
 * Builds a `GEO_NO -> Country.id` lookup from QueryId 156 so we can translate
 * the QueryId 155 rows (which use `GEO_NO` rather than `COUNTRY_CODE`).
 */
async function fetchGeoNoToCountryIdMap(): Promise<Map<number, string>> {
  const payload = await fetchWessQuery(
    WESS_COUNTRIES_QUERY_ID,
    'countries (for GEO_NO map)'
  )
  const rows = extractWessRowArray(payload)
  const map = new Map<number, string>()

  for (const row of rows) {
    const geoNo = readNumberField(row, WESS_GEO_NO_KEYS)
    const countryCode = readStringField(row, WESS_COUNTRY_CODE_KEYS, {
      uppercase: true
    })
    if (geoNo == null || countryCode == null) {
      continue
    }
    map.set(geoNo, countryCode)
  }

  log(`Built GEO_NO map with ${map.size.toLocaleString()} entries`)
  return map
}

async function fetchWessCountryLanguages(): Promise<WessCountryLanguageRow[]> {
  const payload = await fetchWessQuery(
    WESS_COUNTRY_LANGUAGES_QUERY_ID,
    'country-languages'
  )
  const rawRows = extractWessRowArray(payload)
  const normalized = rawRows
    .map(normalizeWessCountryLanguageRow)
    .filter((row): row is WessCountryLanguageRow => row != null)

  log(
    `Normalized ${normalized.length.toLocaleString()} country-language row(s) from ${rawRows.length.toLocaleString()} raw row(s)`
  )

  return normalized
}

type UpsertOutcome =
  | 'created'
  | 'updated'
  | 'unchanged'
  | 'preserved-sentinel'
  | 'preserved-nonzero'

/**
 * WESS QueryId 155 returns ~439 duplicate `(LAN_NO, GEO_NO)` keys with differing
 * `SPEAKERS` (looks like competing population estimates from different sources for
 * the same language in the same country). Without dedup, the value that "wins" is
 * the last one to arrive, which is non-deterministic across runs. Collapsing by
 * MAX gives a stable result on every run and avoids double-counting.
 */
export function dedupeByMaxSpeakers(
  rows: WessCountryLanguageRow[]
): WessCountryLanguageRow[] {
  const byKey = new Map<string, WessCountryLanguageRow>()
  for (const row of rows) {
    const key = `${row.languageId}|${row.geoNo}`
    const existing = byKey.get(key)
    if (existing == null || row.speakers > existing.speakers) {
      byKey.set(key, row)
    }
  }
  return Array.from(byKey.values())
}

/**
 * Decides whether to overwrite an existing `speakers` value with WESS's value.
 * Keeps the function pure so the rules are easy to unit-test.
 */
export function shouldUpdateSpeakers(
  existing: number,
  incoming: number
): boolean {
  // Sentinel preservation: any value at or above the threshold is a sort-priority
  // marker (999_999_999, 888_888_888, …), not a real population.
  if (existing >= SENTINEL_SPEAKERS_THRESHOLD) return false
  // WESS often sends 0 to mean "unknown". Don't let it wipe an existing real value.
  if (incoming === 0 && existing > 0) return false
  return existing !== incoming
}

async function upsertCountryLanguage(
  row: ResolvedCountryLanguageRow
): Promise<UpsertOutcome> {
  // The unique key includes `suggested`; this import only writes the
  // `suggested=false` slot. `suggested=true` rows are managed elsewhere.
  const existing = await prisma.countryLanguage.findUnique({
    where: {
      languageId_countryId_suggested: {
        languageId: row.languageId,
        countryId: row.countryId,
        suggested: false
      }
    },
    select: { speakers: true }
  })

  if (existing == null) {
    await prisma.countryLanguage.create({
      data: {
        languageId: row.languageId,
        countryId: row.countryId,
        speakers: row.speakers,
        primary: false,
        suggested: false
      }
    })
    return 'created'
  }

  if (existing.speakers >= SENTINEL_SPEAKERS_THRESHOLD) {
    return 'preserved-sentinel'
  }
  if (row.speakers === 0 && existing.speakers > 0) {
    return 'preserved-nonzero'
  }
  if (existing.speakers === row.speakers) {
    return 'unchanged'
  }

  // WESS only owns `speakers`; `primary`, `displaySpeakers`, and `order`
  // are populated by other pipelines and must not be clobbered on update.
  await prisma.countryLanguage.update({
    where: {
      languageId_countryId_suggested: {
        languageId: row.languageId,
        countryId: row.countryId,
        suggested: false
      }
    },
    data: { speakers: row.speakers }
  })
  return 'updated'
}

/**
 * Runs the WESS country-languages import and returns the number of rows
 * upserted. Safe to call in-process (e.g. from a GraphQL resolver): it never
 * calls `process.exit` and throws on failure so the caller can handle the error.
 */
export async function runWessCountryLanguagesImport(): Promise<number> {
  log('Starting (this can take a while over HTTP and per-row DB upserts)…')

  const geoNoMap = await fetchGeoNoToCountryIdMap()
  const rawRows = await fetchWessCountryLanguages()

  const dedupedRows = dedupeByMaxSpeakers(rawRows)
  const dedupCollapsed = rawRows.length - dedupedRows.length
  if (dedupCollapsed > 0) {
    log(
      `Deduplicated ${rawRows.length.toLocaleString()} → ${dedupedRows.length.toLocaleString()} rows (${dedupCollapsed.toLocaleString()} duplicate (LAN_NO, GEO_NO) keys collapsed via MAX speakers)`
    )
  }

  const resolved: ResolvedCountryLanguageRow[] = []
  let unresolved = 0

  for (const row of dedupedRows) {
    const countryId = geoNoMap.get(row.geoNo)
    if (countryId == null) {
      unresolved += 1
      continue
    }
    resolved.push({
      languageId: row.languageId,
      countryId,
      speakers: row.speakers
    })
  }

  if (unresolved > 0) {
    log(
      `Skipped ${unresolved.toLocaleString()} row(s) with no matching GEO_NO in QueryId 156`
    )
  }

  const total = resolved.length
  log(
    `Database: upserting ${total.toLocaleString()} country-language(s) (progress every ${WESS_IMPORT_PROGRESS_LOG_EVERY.toLocaleString()} rows)…`
  )

  const outcomes: Record<UpsertOutcome, number> = {
    created: 0,
    updated: 0,
    unchanged: 0,
    'preserved-sentinel': 0,
    'preserved-nonzero': 0
  }
  let fkSkipped = 0

  for (let i = 0; i < total; i++) {
    const n = i + 1
    if (n === 1 || n === total || n % WESS_IMPORT_PROGRESS_LOG_EVERY === 0) {
      log(`Upsert ${n.toLocaleString()}/${total.toLocaleString()}…`)
    }
    try {
      const outcome = await upsertCountryLanguage(resolved[i])
      outcomes[outcome] += 1
    } catch (error) {
      // Foreign-key violation: language id not present in `Language` (e.g.
      // a brand-new WESS language not yet imported). Log and continue.
      fkSkipped += 1
      const reason = error instanceof Error ? error.message : String(error)
      log(
        `FK-skipped ${resolved[i].languageId}/${resolved[i].countryId}: ${reason}`
      )
    }
  }

  if (resolved.length > 0) {
    log('Updating ImportTimes (wessCountryLanguageImport)…')
    await prisma.importTimes.upsert({
      where: { modelName: 'wessCountryLanguageImport' },
      update: { lastImport: new Date() },
      create: {
        modelName: 'wessCountryLanguageImport',
        lastImport: new Date()
      }
    })
  }

  log(
    `Finished: ${outcomes.created.toLocaleString()} created, ${outcomes.updated.toLocaleString()} updated, ${outcomes.unchanged.toLocaleString()} unchanged, ${outcomes['preserved-sentinel'].toLocaleString()} sentinel-preserved, ${outcomes['preserved-nonzero'].toLocaleString()} nonzero-preserved, ${fkSkipped.toLocaleString()} FK-skipped, ${unresolved.toLocaleString()} GEO_NO-skipped of ${rawRows.length.toLocaleString()} raw row(s).`
  )
  return total
}

async function main(): Promise<void> {
  try {
    await runWessCountryLanguagesImport()
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}

export default main
