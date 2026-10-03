import { prisma } from '@core/prisma/languages/client'

import { withWessImportLock } from './wess-import-lock'
import {
  createWessImportLogger,
  fetchWessWithTimeout,
  parseWessResponseBody,
  readRequiredEnv
} from './wess-import-utils'
import {
  type WessLanguageRow,
  extractWessRowArray,
  normalizeLanguageSlugBase,
  normalizeWessLanguageRow
} from './wess-language-parsers'

export {
  extractWessRowArray,
  normalizeLanguageSlugBase,
  normalizeWessLanguageRow
} from './wess-language-parsers'

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

const log = createWessImportLogger('languages')

async function fetchWessLanguages(): Promise<WessLanguageRow[]> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const url = new URL(WESS_ENDPOINT_PATH, WESS_API_BASE_URL)
  url.searchParams.set('QueryId', WESS_LANGUAGES_QUERY_ID)

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
    .map(normalizeWessLanguageRow)
    .filter((row): row is WessLanguageRow => row != null)

  log.info(
    `Step 4/4: normalized ${normalized.length.toLocaleString()} language row(s) from ${rawRows.length.toLocaleString()} raw row(s)`
  )

  return normalized
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
  /**
   * Omitted leaves an existing row's `primary` flag untouched (defaults to `true` only
   * when the row is newly created) — used for the English gloss, whose primary status is
   * decided by the caller's unconditional demotion rather than by this write.
   */
  primary?: boolean
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
      primary: primary ?? true
    },
    update: {
      value,
      ...(primary != null ? { primary } : {})
    }
  })
}

/**
 * Upserts one WESS row into `Language` and its `LanguageName` rows. Returns
 * `true` when an autonym (native-name) row was written for this language, so
 * the caller can tally `nativeNamesImported`.
 */
async function upsertLanguage(row: WessLanguageRow): Promise<boolean> {
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

  const englishLanguageId = WESS_ENGLISH_LANGUAGE_ID
  const hasNativeName = row.nativeName != null

  // WESS only gives one English-gloss label per row; store it as the English `LanguageName`
  // (GraphQL default uses `languageId` 529). English's own row (id 529) never gets one of
  // these via this branch — it would just redundantly overwrite the identical autonym row
  // written below with the same value.
  //
  // `primary` is deliberately not passed: a brand-new row defaults to primary, and the
  // autonym branch below demotes it when this run has an autonym to promote in its place.
  // Deciding the flag here instead would tie the demotion to WESS having supplied a
  // `name` this run, which it need not have.
  if (row.name != null && row.id !== englishLanguageId) {
    await upsertLanguageNameEntry({
      parentLanguageId: row.id,
      languageId: englishLanguageId,
      value: row.name
    })
  }

  if (row.nativeName != null) {
    // The autonym becomes the language's sole Primary Name, so demote every other name
    // row for this language first — unconditionally, before the insert below.
    //
    // Demoting only the English row written above would be wrong: that branch is skipped
    // whenever WESS supplies no `name` for the row, yet a previously stored English row
    // can still be flagged primary. The insert would then add a second primary: true row
    // and the language would have two Primary Names. The same applies to a primary row
    // left behind in some third language by older data.
    //
    // Absence of an autonym stays a no-op: no demotion and no write, so a previously
    // imported autonym keeps its primary flag when a later run omits NATIVE_LAN_NAME.
    await prisma.languageName.updateMany({
      where: {
        parentLanguageId: row.id,
        languageId: { not: row.id },
        primary: true
      },
      data: { primary: false }
    })

    // Autonym: the language's own name for itself, written in itself. Flows through the
    // same branch for every language, including English (id 529 → 529, value "English") —
    // no special case.
    await upsertLanguageNameEntry({
      parentLanguageId: row.id,
      languageId: row.id,
      value: row.nativeName,
      primary: true
    })
  }

  return hasNativeName
}

export interface WessLanguagesImportResult {
  languagesImported: number
  nativeNamesImported: number
}

/**
 * Runs the WESS languages import and returns the number of rows upserted,
 * plus how many autonym (native-name) `LanguageName` rows were created or
 * updated along the way. Safe to call in-process (e.g. from a GraphQL
 * resolver): it never calls `process.exit` and throws on failure so the
 * caller can handle the error.
 */
export async function runWessLanguagesImport(): Promise<WessLanguagesImportResult> {
  log.info('Starting (this can take a while over HTTP and per-row DB upserts)…')
  const rows = await fetchWessLanguages()

  const total = rows.length
  log.info(
    `Database: upserting ${total.toLocaleString()} language(s) (progress every ${WESS_IMPORT_PROGRESS_LOG_EVERY.toLocaleString()} rows)…`
  )

  let nativeNamesImported = 0
  for (let i = 0; i < total; i++) {
    const n = i + 1
    if (n === 1 || n === total || n % WESS_IMPORT_PROGRESS_LOG_EVERY === 0) {
      log.info(`Upsert ${n.toLocaleString()}/${total.toLocaleString()}…`)
    }
    const wroteNativeName = await upsertLanguage(rows[i])
    if (wroteNativeName) {
      nativeNamesImported++
    }
  }

  if (rows.length > 0) {
    log.info('Updating ImportTimes (wessLanguageImport)…')
    await prisma.importTimes.upsert({
      where: { modelName: 'wessLanguageImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'wessLanguageImport', lastImport: new Date() }
    })
  }

  log.info(
    `Finished successfully (${total.toLocaleString()} row(s), ${nativeNamesImported.toLocaleString()} native name(s)).`
  )
  return { languagesImported: total, nativeNamesImported }
}

async function main(): Promise<void> {
  try {
    await withWessImportLock(runWessLanguagesImport)
    process.exit(0)
  } catch (error) {
    log.error({ err: error }, 'WESS languages import failed')
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    log.error({ err: error }, 'WESS languages import failed')
    process.exit(1)
  })
}

export default main
