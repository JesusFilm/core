import { prismaMock } from '../../test/prismaMock'

import { fetchWessWithTimeout } from './wess-import-utils'
import {
  extractWessRowArray,
  normalizeLanguageSlugBase,
  normalizeWessLanguageRow
} from './wess-language-parsers'
import { runWessLanguagesImport } from './wess-languages-import'

vi.mock('./wess-import-utils', async () => ({
  ...(await vi.importActual('./wess-import-utils')),
  fetchWessWithTimeout: vi.fn()
}))

describe('extractWessRowArray', () => {
  const row = { id: '529', name: 'English' }

  it('returns a top-level object array as row objects', () => {
    expect(extractWessRowArray([row])).toEqual([row])
  })

  it('unwraps { data: [...] }', () => {
    expect(extractWessRowArray({ data: [row] })).toEqual([row])
  })

  it('unwraps { rows: [...] }', () => {
    expect(extractWessRowArray({ rows: [row] })).toEqual([row])
  })

  it('unwraps stringified JSON array', () => {
    expect(extractWessRowArray(JSON.stringify([row]))).toEqual([row])
  })

  it('converts tabular [header, ...data] to objects', () => {
    expect(
      extractWessRowArray([
        ['id', 'name'],
        ['529', 'English']
      ])
    ).toEqual([{ id: '529', name: 'English' }])
  })

  it('treats a single object with an id as one row', () => {
    expect(extractWessRowArray({ id: '1', name: 'A' })).toEqual([
      { id: '1', name: 'A' }
    ])
  })

  it('treats a single WESS row with LAN_NO as one row', () => {
    expect(extractWessRowArray({ LAN_NO: 185035, LAN_NAME: 'Wekais' })).toEqual(
      [{ LAN_NO: 185035, LAN_NAME: 'Wekais' }]
    )
  })

  it('throws on unsupported object shapes', () => {
    expect(() => extractWessRowArray({ foo: 1, bar: 2 })).toThrow(
      'Unexpected WESS response: unsupported object shape'
    )
  })
})

describe('normalizeLanguageSlugBase', () => {
  it('lowercases and turns spaces into hyphens', () => {
    expect(normalizeLanguageSlugBase('Albarradas Sign Language')).toBe(
      'albarradas-sign-language'
    )
  })

  it('turns commas and spaces into single hyphens and trims', () => {
    expect(normalizeLanguageSlugBase('  Foo ,  Bar  ')).toBe('foo-bar')
  })

  it('turns underscores and punctuation into hyphens', () => {
    expect(normalizeLanguageSlugBase('Sign_Language (draft)')).toBe(
      'sign-language-draft'
    )
  })

  it('returns empty string for blank input', () => {
    expect(normalizeLanguageSlugBase('   ')).toBe('')
  })
})

describe('normalizeWessLanguageRow', () => {
  it('maps WESS LAN_NO / LAN_NAME / ISO_CODE fields', () => {
    const normalized = normalizeWessLanguageRow({
      LAN_NO: 185035,
      LAN_NAME: 'Wekais',
      ISO_CODE: null,
      COUNTRY_CODE: 'TL'
    })
    expect(normalized).toEqual({
      id: '185035',
      name: 'Wekais',
      nativeName: null,
      bcp47: null,
      iso3: null,
      slug: null,
      hasVideos: null
    })
  })

  it('prefers id over languageId when both exist', () => {
    const normalized = normalizeWessLanguageRow({
      languageId: 'L',
      id: 'I'
    })
    expect(normalized?.id).toBe('I')
  })

  it('lower-cases bcp47 and iso3', () => {
    const normalized = normalizeWessLanguageRow({
      id: '1',
      bcp47: 'EN-US',
      iso3: 'ENG'
    })
    expect(normalized?.bcp47).toBe('en-us')
    expect(normalized?.iso3).toBe('eng')
  })

  it('returns null when id is missing', () => {
    expect(normalizeWessLanguageRow({ name: 'x' })).toBeNull()
  })

  it('maps NATIVE_LAN_NAME to nativeName', () => {
    const normalized = normalizeWessLanguageRow({
      id: '1',
      NATIVE_LAN_NAME: 'English'
    })
    expect(normalized?.nativeName).toBe('English')
  })

  it('falls back through the nativeName alias keys', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', nativeName: 'Français' })?.nativeName
    ).toBe('Français')
    expect(
      normalizeWessLanguageRow({ id: '1', NativeName: 'Deutsch' })?.nativeName
    ).toBe('Deutsch')
  })

  it('trims a trailing-space nativeName', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: 'Golin ' })
        ?.nativeName
    ).toBe('Golin')
  })

  it('normalizes a blank or whitespace-only nativeName to null', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: '' })?.nativeName
    ).toBeNull()
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: '   ' })?.nativeName
    ).toBeNull()
  })

  it('returns null nativeName when no alias key is present', () => {
    expect(normalizeWessLanguageRow({ id: '1' })?.nativeName).toBeNull()
  })
})

interface LanguageNameRecord {
  parentLanguageId: string
  languageId: string
  value: string
  primary: boolean
}

/**
 * Backs `prisma.languageName` with an in-memory table that honours the real
 * `@@unique([parentLanguageId, languageId])` upsert semantics, so a test can
 * assert on the rows a run actually leaves behind rather than on call arguments.
 * Returns the table, which the run mutates in place.
 */
function stubLanguageNameTable(
  seed: LanguageNameRecord[]
): LanguageNameRecord[] {
  const table = seed.map((record) => ({ ...record }))

  prismaMock.languageName.upsert.mockImplementation((async (args: {
    where: {
      parentLanguageId_languageId: {
        parentLanguageId: string
        languageId: string
      }
    }
    create: LanguageNameRecord
    update: Partial<LanguageNameRecord>
  }) => {
    const { parentLanguageId, languageId } =
      args.where.parentLanguageId_languageId
    const existing = table.find(
      (record) =>
        record.parentLanguageId === parentLanguageId &&
        record.languageId === languageId
    )
    if (existing == null) {
      const created = { ...args.create }
      table.push(created)
      return created
    }
    Object.assign(existing, args.update)
    return existing
  }) as never)

  prismaMock.languageName.updateMany.mockImplementation((async (args: {
    where: {
      parentLanguageId: string
      languageId?: { not: string }
      primary?: boolean
    }
    data: Partial<LanguageNameRecord>
  }) => {
    const matched = table.filter(
      (record) =>
        record.parentLanguageId === args.where.parentLanguageId &&
        (args.where.languageId == null ||
          record.languageId !== args.where.languageId.not) &&
        (args.where.primary == null || record.primary === args.where.primary)
    )
    for (const record of matched) {
      Object.assign(record, args.data)
    }
    return { count: matched.length }
  }) as never)

  return table
}

/** Makes the run see exactly `rows` coming back from WESS. */
function stubWessResponse(rows: Array<Record<string, unknown>>): void {
  vi.mocked(fetchWessWithTimeout).mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify(rows)
  } as Response)
}

describe('runWessLanguagesImport native-name primary invariant', () => {
  const ENGLISH_LANGUAGE_ID = '529'

  beforeEach(() => {
    process.env.WESS_API_TOKEN = 'test-token'
    // The language already exists with a slug, so no slug resolution is needed.
    prismaMock.language.findUnique.mockResolvedValue({
      id: '1',
      slug: 'french'
    } as never)
    prismaMock.language.upsert.mockResolvedValue({} as never)
    prismaMock.importTimes.upsert.mockResolvedValue({} as never)
  })

  it('leaves exactly one primary name when WESS omits the English gloss', async () => {
    // A previous run stored the English label as the language's Primary Name.
    const table = stubLanguageNameTable([
      {
        parentLanguageId: '1',
        languageId: ENGLISH_LANGUAGE_ID,
        value: 'French',
        primary: true
      }
    ])

    // This run carries an autonym but no English gloss (`LAN_NAME` absent).
    stubWessResponse([{ LAN_NO: '1', NATIVE_LAN_NAME: 'Français' }])

    await runWessLanguagesImport()

    const primaryRows = table.filter((record) => record.primary)
    expect(primaryRows).toHaveLength(1)
    expect(primaryRows[0]).toMatchObject({
      parentLanguageId: '1',
      languageId: '1',
      value: 'Français'
    })
    // The English gloss is kept, just no longer primary.
    expect(
      table.find((record) => record.languageId === ENGLISH_LANGUAGE_ID)
    ).toMatchObject({ value: 'French', primary: false })
  })

  it('leaves exactly one primary name when WESS supplies both names', async () => {
    const table = stubLanguageNameTable([
      {
        parentLanguageId: '1',
        languageId: ENGLISH_LANGUAGE_ID,
        value: 'French',
        primary: true
      }
    ])

    stubWessResponse([
      { LAN_NO: '1', LAN_NAME: 'French', NATIVE_LAN_NAME: 'Français' }
    ])

    await runWessLanguagesImport()

    expect(table.filter((record) => record.primary)).toHaveLength(1)
    expect(table.find((record) => record.languageId === '1')).toMatchObject({
      value: 'Français',
      primary: true
    })
  })

  it('demotes a stale primary held by a third language', async () => {
    // A name written in Spanish was left flagged primary by older data.
    const table = stubLanguageNameTable([
      {
        parentLanguageId: '1',
        languageId: '21046',
        value: 'Francés',
        primary: true
      }
    ])

    stubWessResponse([{ LAN_NO: '1', NATIVE_LAN_NAME: 'Français' }])

    await runWessLanguagesImport()

    const primaryRows = table.filter((record) => record.primary)
    expect(primaryRows).toHaveLength(1)
    expect(primaryRows[0].languageId).toBe('1')
  })

  it('leaves the stored primary alone when WESS omits the autonym', async () => {
    // "Absence is a no-op": a run without NATIVE_LAN_NAME must not retract a
    // previously imported autonym, nor promote the English gloss back.
    const table = stubLanguageNameTable([
      {
        parentLanguageId: '1',
        languageId: '1',
        value: 'Français',
        primary: true
      },
      {
        parentLanguageId: '1',
        languageId: ENGLISH_LANGUAGE_ID,
        value: 'French',
        primary: false
      }
    ])

    stubWessResponse([{ LAN_NO: '1', LAN_NAME: 'French' }])

    await runWessLanguagesImport()

    const primaryRows = table.filter((record) => record.primary)
    expect(primaryRows).toHaveLength(1)
    expect(primaryRows[0].languageId).toBe('1')
  })
})
