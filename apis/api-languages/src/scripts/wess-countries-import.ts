import { prisma } from '../../../../libs/prisma/languages/src/client'

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

const log = (message: string): void => {
  console.log(`[wess-countries-import] ${message}`)
}

type WessRawRow = Record<string, unknown>

interface WessCountryRow {
  id: string
  name: string | null
  population: number | null
}

const WESS_ARRAY_WRAPPER_KEYS = [
  'data',
  'rows',
  'Data',
  'Rows',
  'result',
  'Result',
  'value',
  'Value',
  'items',
  'Items',
  'values',
  'Values',
  'GetDataResult',
  'getDataResult'
] as const

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

function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    throw new Error(`${name} environment variable is not set`)
  }
  return value
}

function readStringField(
  row: WessRawRow,
  keys: string[],
  options: { lowercase?: boolean; uppercase?: boolean } = {}
): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized !== '') {
        if (options.lowercase === true) return normalized.toLowerCase()
        if (options.uppercase === true) return normalized.toUpperCase()
        return normalized
      }
    }
    if (typeof value === 'number') {
      return String(value)
    }
  }
  return null
}

function readNumberField(row: WessRawRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized === '') {
        continue
      }
      const parsed = Number(normalized)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return null
}

function isTabularPayload(payload: unknown[]): boolean {
  if (payload.length === 0) {
    return false
  }
  return payload.every((row) => Array.isArray(row))
}

function tabularRowsToObjects(matrix: unknown[][]): WessRawRow[] {
  if (matrix.length < 2) {
    return []
  }

  const headerCells = matrix[0]
  const headers = headerCells.map((cell) => String(cell).trim())
  const objectRows: WessRawRow[] = []

  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r]
    const record: WessRawRow = {}
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c]
      if (key === '') {
        continue
      }
      record[key] = cells[c]
    }
    objectRows.push(record)
  }

  return objectRows
}

/**
 * Normalizes one WESS row object into our import shape. Returns null when no country id is present.
 */
export function normalizeWessCountryRow(row: WessRawRow): WessCountryRow | null {
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
 * WESS GetData often returns JSON wrapped in `{ data: … }` or a tabular `[ [ "col", … ], [ … ] ]` grid.
 * This flattens those shapes into an array of row objects.
 */
export function extractWessRowArray(payload: unknown): WessRawRow[] {
  if (payload == null) {
    return []
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (trimmed === '') {
      return []
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed) as unknown
    } catch {
      throw new Error('Unexpected WESS response: payload string is not valid JSON')
    }
    return extractWessRowArray(parsed)
  }

  if (Array.isArray(payload)) {
    if (isTabularPayload(payload)) {
      return tabularRowsToObjects(payload as unknown[][])
    }

    return payload.filter(
      (row): row is WessRawRow =>
        row != null && typeof row === 'object' && !Array.isArray(row)
    )
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    for (const key of WESS_ARRAY_WRAPPER_KEYS) {
      if (!(key in record)) {
        continue
      }
      const inner = record[key]
      if (inner == null) {
        continue
      }
      return extractWessRowArray(inner)
    }

    if (readStringField(record as WessRawRow, WESS_COUNTRY_ID_KEYS) != null) {
      return [record as WessRawRow]
    }

    const keys = Object.keys(record).slice(0, 25).join(', ')
    throw new Error(
      `Unexpected WESS response: unsupported object shape (sample keys: ${keys || '(none)'})`
    )
  }

  throw new Error(`Unexpected WESS response: expected array or object, got ${typeof payload}`)
}

function parseWessResponseBody(bodyText: string): unknown {
  const trimmed = bodyText.trim()
  if (trimmed === '') {
    return null
  }
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    throw new Error(
      `WESS response is not valid JSON (first 400 chars): ${bodyText.slice(0, 400)}`
    )
  }
}

async function fetchWessCountries(): Promise<WessCountryRow[]> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const url = new URL(WESS_ENDPOINT_PATH, WESS_API_BASE_URL)
  url.searchParams.set('QueryId', WESS_COUNTRIES_QUERY_ID)

  log(`Step 1/4: requesting WESS GetData (${url.origin}${url.pathname}?QueryId=…)`)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      token
    }
  })

  log(`Step 2/4: HTTP ${response.status} ${response.statusText} — reading response body…`)

  const bodyText = await response.text().catch(() => 'No response body available')

  if (!response.ok) {
    throw new Error(
      `WESS request failed: ${response.status} ${response.statusText} - ${bodyText}`
    )
  }

  log(`Step 3/4: body received (${bodyText.length.toLocaleString()} chars), parsing JSON and rows…`)

  const payload = parseWessResponseBody(bodyText)
  const rawRows = extractWessRowArray(payload)
  const normalized = rawRows
    .map(normalizeWessCountryRow)
    .filter((row): row is WessCountryRow => row != null)

  log(
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

async function upsertCountry(row: WessCountryRow): Promise<void> {
  await prisma.country.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      ...(row.population != null ? { population: row.population } : {})
    },
    update: {
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

async function main(): Promise<void> {
  try {
    log('Starting (this can take a while over HTTP and per-row DB upserts)…')
    const rows = await fetchWessCountries()

    const total = rows.length
    log(
      `Database: upserting ${total.toLocaleString()} country(ies) (progress every ${WESS_IMPORT_PROGRESS_LOG_EVERY.toLocaleString()} rows)…`
    )

    for (let i = 0; i < total; i++) {
      const n = i + 1
      if (
        n === 1 ||
        n === total ||
        n % WESS_IMPORT_PROGRESS_LOG_EVERY === 0
      ) {
        log(`Upsert ${n.toLocaleString()}/${total.toLocaleString()}…`)
      }
      await upsertCountry(rows[i])
    }

    if (rows.length > 0) {
      log('Updating ImportTimes (wessCountryImport)…')
      await prisma.importTimes.upsert({
        where: { modelName: 'wessCountryImport' },
        update: { lastImport: new Date() },
        create: { modelName: 'wessCountryImport', lastImport: new Date() }
      })
    }

    log(`Finished successfully (${total.toLocaleString()} row(s)).`)
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
