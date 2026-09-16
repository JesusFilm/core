import {
  type WessRawRow,
  extractWessRowArray as extractWessRowArrayShared,
  readBooleanField,
  readStringField
} from './wess-import-utils'

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

export interface WessLanguageRow {
  id: string
  name: string | null
  nativeName: string | null
  bcp47: string | null
  iso3: string | null
  slug: string | null
  hasVideos: boolean | null
}

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
  const nativeName = readStringField(row, [
    'nativeName',
    'NativeName',
    'NATIVE_LAN_NAME'
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
    nativeName,
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
