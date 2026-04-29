import { prisma } from '../../../../libs/prisma/languages/src/client'

const DEFAULT_WESS_BASE_URL = 'https://www.mydigitalwork.space'
const DEFAULT_LANGUAGES_QUERY_ID = '154'
const WESS_ENDPOINT_PATH = '/QueryRunner/rest/QueryAPI/GetData'

type WessRawRow = Record<string, unknown>

interface WessLanguageRow {
  id: string
  name: string | null
  bcp47: string | null
  iso3: string | null
  slug: string | null
  hasVideos: boolean | null
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    throw new Error(`${name} environment variable is not set`)
  }
  return value
}

function readOptionalEnv(name: string, fallback: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    return fallback
  }
  return value.trim()
}

function readStringField(
  row: WessRawRow,
  keys: string[],
  options: { lowercase?: boolean } = {}
): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized !== '') {
        return options.lowercase === true
          ? normalized.toLowerCase()
          : normalized
      }
    }
    if (typeof value === 'number') {
      return String(value)
    }
  }
  return null
}

function readBooleanField(row: WessRawRow, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number') {
      return value !== 0
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
        return true
      }
      if (normalized === 'false' || normalized === '0' || normalized === 'no') {
        return false
      }
    }
  }
  return null
}

function normalizeWessLanguageRow(row: WessRawRow): WessLanguageRow | null {
  const id = readStringField(row, ['id', 'ID', 'languageId', 'LanguageId'])
  if (id == null) {
    return null
  }

  const name = readStringField(row, ['name', 'Name', 'languageName', 'Language'])
  const bcp47 = readStringField(
    row,
    ['bcp47', 'BCP47', 'languageTag', 'LanguageTag', 'ietf'],
    { lowercase: true }
  )
  const iso3 = readStringField(row, ['iso3', 'ISO3', 'iso_639_3', 'iso6393'], {
    lowercase: true
  })
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

async function fetchWessLanguages(): Promise<WessLanguageRow[]> {
  const token = readRequiredEnv('WESS_API_TOKEN')
  const baseUrl = readOptionalEnv('WESS_API_BASE_URL', DEFAULT_WESS_BASE_URL)
  const queryId = readOptionalEnv(
    'WESS_LANGUAGES_QUERY_ID',
    DEFAULT_LANGUAGES_QUERY_ID
  )

  const url = new URL(WESS_ENDPOINT_PATH, baseUrl)
  url.searchParams.set('QueryId', queryId)

  console.log(`Fetching WESS languages from ${url.toString()}`)
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      token
    }
  })

  if (!response.ok) {
    const responseText = await response
      .text()
      .catch(() => 'No error text available')
    throw new Error(
      `WESS request failed: ${response.status} ${response.statusText} - ${responseText}`
    )
  }

  const payload = (await response.json()) as unknown
  if (!Array.isArray(payload)) {
    throw new Error('Unexpected WESS response: expected an array payload')
  }

  return payload
    .filter((row): row is WessRawRow => row != null && typeof row === 'object')
    .map(normalizeWessLanguageRow)
    .filter((row): row is WessLanguageRow => row != null)
}

async function upsertLanguage(row: WessLanguageRow): Promise<void> {
  await prisma.language.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      ...(row.bcp47 != null ? { bcp47: row.bcp47 } : {}),
      ...(row.iso3 != null ? { iso3: row.iso3 } : {}),
      ...(row.slug != null ? { slug: row.slug } : {}),
      ...(row.hasVideos != null ? { hasVideos: row.hasVideos } : {})
    },
    update: {
      ...(row.bcp47 != null ? { bcp47: row.bcp47 } : {}),
      ...(row.iso3 != null ? { iso3: row.iso3 } : {}),
      ...(row.slug != null ? { slug: row.slug } : {}),
      ...(row.hasVideos != null ? { hasVideos: row.hasVideos } : {})
    }
  })

  if (row.name == null) {
    return
  }

  await prisma.languageName.upsert({
    where: {
      parentLanguageId_languageId: {
        parentLanguageId: row.id,
        languageId: row.id
      }
    },
    create: {
      parentLanguageId: row.id,
      languageId: row.id,
      value: row.name,
      primary: true
    },
    update: {
      value: row.name,
      primary: true
    }
  })
}

async function main(): Promise<void> {
  try {
    console.log('Starting WESS language import')
    const rows = await fetchWessLanguages()
    console.log(`Received ${rows.length} row(s) from WESS`)

    for (const row of rows) {
      await upsertLanguage(row)
    }

    await prisma.importTimes.upsert({
      where: { modelName: 'wessLanguageImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'wessLanguageImport', lastImport: new Date() }
    })

    console.log(`WESS language import complete (${rows.length} row(s) processed)`)
    process.exit(0)
  } catch (error) {
    console.error('WESS language import failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled WESS language import error:', error)
    process.exit(1)
  })
}

export default main
