import { prisma } from '@core/prisma/languages/client'

import { withWessImportLock } from './wess-import-lock'
import {
  type WessRawRow,
  createWessImportLogger,
  extractWessRowArray as extractWessRowArrayShared,
  fetchWessWithTimeout,
  parseWessResponseBody,
  readNumberField,
  readRequiredEnv,
  readStringField
} from './wess-import-utils'

/**
 * WESS QueryRunner settings (edit here). The API token must stay in env (`WESS_API_TOKEN`).
 */
const WESS_API_BASE_URL = 'https://www.mydigitalwork.space'
const WESS_COUNTRIES_QUERY_ID = '156'
const WESS_ENDPOINT_PATH = '/QueryRunner/rest/QueryAPI/GetData'
/** Matches GraphQL default in `apis/api-languages/src/schema/language/language.ts` (`name` relation). */
const WESS_ENGLISH_LANGUAGE_ID = '529'

/** Log upsert progress every N rows (plus first and last). */
const WESS_IMPORT_PROGRESS_LOG_EVERY = 2500

const log = createWessImportLogger('countries')

interface WessCountryRow {
  id: string
  name: string | null
  population: number | null
}

/** WESS QueryRunner rows often use COUNTRY_CODE / COUNTRY_NAME instead of id / name. */
const WESS_COUNTRY_ID_KEYS: string[] = [
  'id',
  'ID',
  'countryId',
  'CountryId',
  'country_id',
  'COUNTRY_CODE',
  'CountryCode',
  'country_code'
]

/**
 * Normalizes one WESS row object into our import shape. Returns null when no country id is present.
 */
export function normalizeWessCountryRow(
  row: WessRawRow
): WessCountryRow | null {
  const id = readStringField(row, WESS_COUNTRY_ID_KEYS, { uppercase: true })
  if (id == null) {
    return null
  }

  const name = readStringField(row, [
    'name',
    'Name',
    'countryName',
    'CountryName',
    'COUNTRY_NAME',
    'country_name'
  ])
  const population = readNumberField(row, [
    'population',
    'Population',
    'POPULATION',
    'COUNTRY_POPULATION'
  ])

  return {
    id,
    name,
    population
  }
}

/**
 * WESS GetData often returns JSON wrapped in `{ data: … }` or a tabular
 * `[ [ "col", … ], [ … ] ]` grid. This flattens those shapes into an array of
 * row objects. A bare object counts as a single row when it carries a country id.
 */
export function extractWessRowArray(payload: unknown): WessRawRow[] {
  return extractWessRowArrayShared(
    payload,
    (row) => readStringField(row, WESS_COUNTRY_ID_KEYS) != null
  )
}

async function fetchWessCountries(): Promise<WessCountryRow[]> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const url = new URL(WESS_ENDPOINT_PATH, WESS_API_BASE_URL)
  url.searchParams.set('QueryId', WESS_COUNTRIES_QUERY_ID)

  log.info(
    `Step 1/4: requesting WESS GetData (${url.origin}${url.pathname}?QueryId=…)`
  )

  const response = await fetchWessWithTimeout(url.toString(), {
    method: 'GET',
    headers: {
      token
    }
  })

  log.info(
    `Step 2/4: HTTP ${response.status} ${response.statusText} — reading response body…`
  )

  const bodyText = await response
    .text()
    .catch(() => 'No response body available')

  if (!response.ok) {
    throw new Error(
      `WESS request failed: ${response.status} ${response.statusText} - ${bodyText}`
    )
  }

  log.info(
    `Step 3/4: body received (${bodyText.length.toLocaleString()} chars), parsing JSON and rows…`
  )

  const payload = parseWessResponseBody(bodyText)
  const rawRows = extractWessRowArray(payload)
  const normalized = rawRows
    .map(normalizeWessCountryRow)
    .filter((row): row is WessCountryRow => row != null)

  log.info(
    `Step 4/4: normalized ${normalized.length.toLocaleString()} country row(s) from ${rawRows.length.toLocaleString()} raw row(s)`
  )

  return normalized
}

async function upsertCountryNameEntry(params: {
  countryId: string
  languageId: string
  value: string
  primary: boolean
}): Promise<void> {
  const { countryId, languageId, value, primary } = params
  await prisma.countryName.upsert({
    where: {
      languageId_countryId: {
        languageId,
        countryId
      }
    },
    create: {
      countryId,
      languageId,
      value,
      primary
    },
    update: {
      value,
      primary
    }
  })
}

/**
 * Updates an existing country only. WESS rows carry no continent, and a
 * `Country` without one errors the non-null GraphQL `Country.continent` field
 * for the whole `countries` query (arclight /v2/media-countries 500s), so new
 * countries must be created by hand with a continent before WESS can sync them.
 */
async function updateCountry(row: WessCountryRow): Promise<void> {
  await prisma.country.update({
    where: { id: row.id },
    data: {
      ...(row.population != null ? { population: row.population } : {})
    }
  })

  if (row.name == null) {
    return
  }

  // WESS only gives one label per row; store it as the English `CountryName` (GraphQL default uses `languageId` 529).
  await upsertCountryNameEntry({
    countryId: row.id,
    languageId: WESS_ENGLISH_LANGUAGE_ID,
    value: row.name,
    primary: true
  })
}

/**
 * Runs the WESS countries import and returns the number of countries updated.
 * Countries not already in the database are skipped (see `updateCountry`).
 * Safe to call in-process (e.g. from a GraphQL resolver): it never calls
 * `process.exit` and throws on failure so the caller can handle the error.
 */
export async function runWessCountriesImport(): Promise<number> {
  log.info('Starting (this can take a while over HTTP and per-row DB upserts)…')
  const fetchedRows = await fetchWessCountries()

  const existingCountryIds = new Set(
    (await prisma.country.findMany({ select: { id: true } })).map(
      ({ id }) => id
    )
  )
  const rows = fetchedRows.filter((row) => existingCountryIds.has(row.id))
  const unknownCountryIds = fetchedRows
    .filter((row) => !existingCountryIds.has(row.id))
    .map((row) => row.id)
  if (unknownCountryIds.length > 0) {
    log.warn(
      { countryIds: unknownCountryIds },
      `Skipped ${unknownCountryIds.length.toLocaleString()} country(ies) not in the database — create them with a continent first`
    )
  }

  const total = rows.length
  log.info(
    `Database: updating ${total.toLocaleString()} country(ies) (progress every ${WESS_IMPORT_PROGRESS_LOG_EVERY.toLocaleString()} rows)…`
  )

  for (let i = 0; i < total; i++) {
    const n = i + 1
    if (n === 1 || n === total || n % WESS_IMPORT_PROGRESS_LOG_EVERY === 0) {
      log.info(`Update ${n.toLocaleString()}/${total.toLocaleString()}…`)
    }
    await updateCountry(rows[i])
  }

  if (rows.length > 0) {
    log.info('Updating ImportTimes (wessCountryImport)…')
    await prisma.importTimes.upsert({
      where: { modelName: 'wessCountryImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'wessCountryImport', lastImport: new Date() }
    })
  }

  log.info(`Finished successfully (${total.toLocaleString()} row(s)).`)
  return total
}

async function main(): Promise<void> {
  try {
    await withWessImportLock(runWessCountriesImport)
    process.exit(0)
  } catch (error) {
    log.error({ err: error }, 'WESS countries import failed')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    log.error({ err: error }, 'WESS countries import failed')
    process.exit(1)
  })
}

export default main
