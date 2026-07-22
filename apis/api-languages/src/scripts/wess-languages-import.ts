import { prisma } from '@core/prisma/languages/client'

import {
  type WessRawRow,
  extractWessRowArray as extractWessRowArrayShared,
  parseWessResponseBody,
  readBooleanField,
  readRequiredEnv,
  readStringField
} from './wess-import-utils'

/**
 * WESS QueryRunner settings (edit here). The API token must stay in env (`WESS_API_TOKEN`).
 */
const WESS_API_BASE_URL = 'https://www.mydigitalwork.space'
const WESS_LANGUAGES_QUERY_ID = '154'
const WESS_ENDPOINT_PATH = '/QueryRunner/rest/QueryAPI/GetData'
/** Matches GraphQL default in `apis/api-languages/src/schema/language/language.ts` (`name` relation). */
const WESS_ENGLISH_LANGUAGE_ID = '529'

/** Log upsert progress every N rows (plus first and last). */
const WESS_IMPORT_PROGRESS_LOG_EVERY = 2500

const log = (message: string): void => {
  console.log(`[wess-import] ${message}`)
}

interface WessLanguageRow {
  id: string
  name: string | null
  bcp47: string | null
  iso3: string | null
  slug: string | null
  hasVideos: boolean | null
}

/** WESS QueryRunner rows often use LAN_NO / LAN_NAME / ISO_CODE instead of id / name / iso3. */
const WESS_LANGUAGE_ID_KEYS: string[] = [
  'id',
  'ID',
  'languageId',
  'LanguageId',
  'LAN_NO',
  'LanNo',
  'lan_no'
]

/**
 * Normalizes one WESS row object into our import shape. Returns null when no language id is present.
 */
export function normalizeWessLanguageRow(
  row: WessRawRow
): WessLanguageRow | null {
  const id = readStringField(row, WESS_LANGUAGE_ID_KEYS)
  if (id == null) {
    return null
  }

  const name = readStringField(row, [
    'name',
    'Name',
    'languageName',
    'Language',
    'LAN_NAME',
    'LanName',
    'lan_name'
  ])
  const bcp47 = readStringField(
    row,
    ['bcp47', 'BCP47', 'languageTag', 'LanguageTag', 'ietf'],
    { lowercase: true }
  )
  const iso3 = readStringField(
    row,
    ['iso3', 'ISO3', 'iso_639_3', 'iso6393', 'ISO_CODE', 'IsoCode', 'iso_code'],
    {
      lowercase: true
    }
  )
  const slug = readStringField(row, ['slug', 'Slug'])
  const hasVideos = readBooleanField(row, ['hasVideos', 'HasVideos'])

  return {
    id,
    name,
    bcp47,
    iso3,
    slug,
    hasVideos
  }
}

/**
 * WESS GetData often returns JSON wrapped in `{ data: … }` or a tabular
 * `[ [ "col", … ], [ … ] ]` grid. This flattens those shapes into an array of
 * row objects. A bare object counts as a single row when it carries a language id.
 */
export function extractWessRowArray(payload: unknown): WessRawRow[] {
  return extractWessRowArrayShared(
    payload,
    (row) => readStringField(row, WESS_LANGUAGE_ID_KEYS) != null
  )
}

async function fetchWessLanguages(): Promise<WessLanguageRow[]> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const url = new URL(WESS_ENDPOINT_PATH, WESS_API_BASE_URL)
  url.searchParams.set('QueryId', WESS_LANGUAGES_QUERY_ID)

  log(
    `Step 1/4: requesting WESS GetData (${url.origin}${url.pathname}?QueryId=…)`
  )

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      token
    }
  })

  log(
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

  log(
    `Step 3/4: body received (${bodyText.length.toLocaleString()} chars), parsing JSON and rows…`
  )

  const payload = parseWessResponseBody(bodyText)
  const rawRows = extractWessRowArray(payload)
  const normalized = rawRows
    .map(normalizeWessLanguageRow)
    .filter((row): row is WessLanguageRow => row != null)

  log(
    `Step 4/4: normalized ${normalized.length.toLocaleString()} language row(s) from ${rawRows.length.toLocaleString()} raw row(s)`
  )

  return normalized
}

/**
 * Lowercase; spaces, commas, underscores → `-`; other non `[a-z0-9]` runs → `-`;
 * collapse repeated hyphens; trim `-` from ends.
 */
export function normalizeLanguageSlugBase(raw: string): string {
  let s = raw.trim().toLowerCase()
  if (s === '') {
    return ''
  }
  s = s.replace(/[\s,_]+/g, '-')
  s = s.replace(/[^a-z0-9-]+/g, '-')
  s = s.replace(/-+/g, '-')
  return s.replace(/^-+|-+$/g, '')
}

function pickSlugSourceText(row: WessLanguageRow): string {
  if (row.slug != null && row.slug.trim() !== '') {
    return row.slug.trim()
  }
  if (row.name != null && row.name.trim() !== '') {
    return row.name.trim()
  }
  return row.id
}

/** Resolves a unique `slug` for `owningLanguageId` (excludes that id from collision checks). */
async function resolveUniqueSlug(
  row: WessLanguageRow,
  owningLanguageId: string
): Promise<string> {
  const baseRaw = pickSlugSourceText(row)
  let base = normalizeLanguageSlugBase(baseRaw)
  if (base === '') {
    base = normalizeLanguageSlugBase(owningLanguageId)
  }
  if (base === '') {
    base = 'language'
  }

  let candidate = base
  let suffix = 2
  const maxAttempts = 100_000

  for (let i = 0; i < maxAttempts; i++) {
    const taken = await prisma.language.findFirst({
      where: {
        slug: candidate,
        id: { not: owningLanguageId }
      },
      select: { id: true }
    })
    if (taken == null) {
      return candidate
    }
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  throw new Error(
    `Could not allocate a unique slug for language id ${owningLanguageId} after ${maxAttempts} attempts (base: ${base})`
  )
}

async function upsertLanguageNameEntry(params: {
  parentLanguageId: string
  languageId: string
  value: string
  primary: boolean
}): Promise<void> {
  const { parentLanguageId, languageId, value, primary } = params
  await prisma.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        parentLanguageId,
        languageId
      }
    },
    create: {
      parentLanguageId,
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

async function upsertLanguage(row: WessLanguageRow): Promise<void> {
  const existing = await prisma.language.findUnique({
    where: { id: row.id },
    select: { id: true, slug: true }
  })

  const slugMissing =
    existing == null || existing.slug == null || existing.slug.trim() === ''

  const computedSlug = slugMissing
    ? await resolveUniqueSlug(row, row.id)
    : undefined

  const hasVideosForCreate = row.hasVideos ?? false

  await prisma.language.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      ...(row.bcp47 != null ? { bcp47: row.bcp47 } : {}),
      ...(row.iso3 != null ? { iso3: row.iso3 } : {}),
      ...(computedSlug != null ? { slug: computedSlug } : {}),
      hasVideos: hasVideosForCreate
    },
    update: {
      ...(row.bcp47 != null ? { bcp47: row.bcp47 } : {}),
      ...(row.iso3 != null ? { iso3: row.iso3 } : {}),
      ...(row.hasVideos != null ? { hasVideos: row.hasVideos } : {}),
      ...(computedSlug != null && existing != null
        ? { slug: computedSlug }
        : {})
    }
  })

  if (row.name == null) {
    return
  }

  const englishLanguageId = WESS_ENGLISH_LANGUAGE_ID

  if (row.id === englishLanguageId) {
    return
  }

  // WESS only gives one label per row; store it as the English `LanguageName` (GraphQL default uses `languageId` 529).
  await upsertLanguageNameEntry({
    parentLanguageId: row.id,
    languageId: englishLanguageId,
    value: row.name,
    primary: true
  })
}

/**
 * Runs the WESS languages import and returns the number of rows upserted.
 * Safe to call in-process (e.g. from a GraphQL resolver): it never calls
 * `process.exit` and throws on failure so the caller can handle the error.
 */
export async function runWessLanguagesImport(): Promise<number> {
  log('Starting (this can take a while over HTTP and per-row DB upserts)…')
  const rows = await fetchWessLanguages()

  const total = rows.length
  log(
    `Database: upserting ${total.toLocaleString()} language(s) (progress every ${WESS_IMPORT_PROGRESS_LOG_EVERY.toLocaleString()} rows)…`
  )

  for (let i = 0; i < total; i++) {
    const n = i + 1
    if (n === 1 || n === total || n % WESS_IMPORT_PROGRESS_LOG_EVERY === 0) {
      log(`Upsert ${n.toLocaleString()}/${total.toLocaleString()}…`)
    }
    await upsertLanguage(rows[i])
  }

  if (rows.length > 0) {
    log('Updating ImportTimes (wessLanguageImport)…')
    await prisma.importTimes.upsert({
      where: { modelName: 'wessLanguageImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'wessLanguageImport', lastImport: new Date() }
    })
  }

  log(`Finished successfully (${total.toLocaleString()} row(s)).`)
  return total
}

async function main(): Promise<void> {
  try {
    await runWessLanguagesImport()
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
