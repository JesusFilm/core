import { prismaMock } from '../../test/prismaMock'

import {
  extractWessRowArray,
  normalizeLanguageSlugBase,
  normalizeWessLanguageRow
} from './wess-language-parsers'
import { runWessLanguagesImport } from './wess-languages-import'

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

  it('maps NATIVE_LAN_NAME to nativeName', () => {
    const normalized = normalizeWessLanguageRow({
      id: '1',
      NATIVE_LAN_NAME: 'Español'
    })
    expect(normalized?.nativeName).toBe('Español')
  })

  it('falls back to the nativeName/NativeName aliases', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', nativeName: 'Deutsch' })?.nativeName
    ).toBe('Deutsch')
    expect(
      normalizeWessLanguageRow({ id: '1', NativeName: 'Français' })?.nativeName
    ).toBe('Français')
  })

  it('normalizes a blank or whitespace-only NATIVE_LAN_NAME to null', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: '' })?.nativeName
    ).toBeNull()
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: '   ' })?.nativeName
    ).toBeNull()
  })

  it('trims a trailing-space NATIVE_LAN_NAME (e.g. WESS "Golin ")', () => {
    expect(
      normalizeWessLanguageRow({ id: '1', NATIVE_LAN_NAME: 'Golin ' })
        ?.nativeName
    ).toBe('Golin')
  })

  it('leaves nativeName null when absent', () => {
    expect(normalizeWessLanguageRow({ id: '1' })?.nativeName).toBeNull()
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
})

/**
 * Backs the invariant that a language has at most one `LanguageName` row
 * with `primary: true`, against a fake `languageName` table that honours
 * the real `@@unique([parentLanguageId, languageId])` upsert semantics —
 * so these tests assert on the rows a run leaves behind, not call arguments.
 */
describe('runWessLanguagesImport', () => {
  interface FakeLanguageNameRow {
    parentLanguageId: string
    languageId: string
    value: string
    primary: boolean
  }

  let languageNames: FakeLanguageNameRow[]
  let languages: Map<string, { id: string; slug: string | null }>

  function seedLanguageName(row: FakeLanguageNameRow): void {
    languageNames.push({ ...row })
  }

  function mockFetchRows(rows: unknown[]): void {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify(rows)
      })
    )
  }

  beforeEach(() => {
    languageNames = []
    languages = new Map()
    process.env.WESS_API_TOKEN = 'test-token'

    prismaMock.language.findUnique.mockImplementation(
      (async ({ where }: any) => languages.get(where.id) ?? null) as never
    )
    prismaMock.language.findFirst.mockImplementation((async ({
      where
    }: any) => {
      for (const lang of languages.values()) {
        if (lang.slug === where.slug && lang.id !== where.id.not) {
          return lang
        }
      }
      return null
    }) as never)
    prismaMock.language.upsert.mockImplementation((async ({
      where,
      create,
      update
    }: any) => {
      const existing = languages.get(where.id)
      if (existing == null) {
        const row = { slug: null, ...create }
        languages.set(where.id, row)
        return row
      }
      Object.assign(existing, update)
      return existing
    }) as never)
    prismaMock.languageName.findUnique.mockImplementation((async ({
      where
    }: any) => {
      const key = where.parentLanguageId_languageId
      return (
        languageNames.find(
          (n) =>
            n.parentLanguageId === key.parentLanguageId &&
            n.languageId === key.languageId
        ) ?? null
      )
    }) as never)
    prismaMock.languageName.upsert.mockImplementation((async ({
      where,
      create,
      update
    }: any) => {
      const key = where.parentLanguageId_languageId
      const existing = languageNames.find(
        (n) =>
          n.parentLanguageId === key.parentLanguageId &&
          n.languageId === key.languageId
      )
      if (existing == null) {
        const row = { ...create }
        languageNames.push(row)
        return row
      }
      Object.assign(existing, update)
      return existing
    }) as never)
    prismaMock.languageName.updateMany.mockImplementation((async ({
      where,
      data
    }: any) => {
      let count = 0
      for (const row of languageNames) {
        if (
          row.parentLanguageId === where.parentLanguageId &&
          row.languageId !== where.languageId.not
        ) {
          Object.assign(row, data)
          count++
        }
      }
      return { count }
    }) as never)
    prismaMock.importTimes.upsert.mockResolvedValue({} as any)
  })

  afterEach(() => {
    delete process.env.WESS_API_TOKEN
    vi.unstubAllGlobals()
  })

  function primaryRowsFor(languageId: string): FakeLanguageNameRow[] {
    return languageNames.filter(
      (n) => n.parentLanguageId === languageId && n.primary
    )
  }

  it('writes only an English row when NATIVE_LAN_NAME is absent (fresh language)', async () => {
    mockFetchRows([{ id: '2', name: 'Spanish' }])

    const result = await runWessLanguagesImport()

    expect(result).toEqual({ languagesImported: 1, nativeNamesImported: 0 })
    expect(languageNames).toEqual([
      {
        parentLanguageId: '2',
        languageId: '529',
        value: 'Spanish',
        primary: true
      }
    ])
  })

  it('writes only an autonym row when LAN_NAME is absent (fresh language)', async () => {
    mockFetchRows([{ id: '2', nativeName: 'Español' }])

    const result = await runWessLanguagesImport()

    expect(result).toEqual({ languagesImported: 1, nativeNamesImported: 1 })
    expect(languageNames).toEqual([
      {
        parentLanguageId: '2',
        languageId: '2',
        value: 'Español',
        primary: true
      }
    ])
  })

  it('makes the autonym primary and demotes English when both are present (fresh language)', async () => {
    mockFetchRows([{ id: '2', name: 'Spanish', nativeName: 'Español' }])

    const result = await runWessLanguagesImport()

    expect(result).toEqual({ languagesImported: 1, nativeNamesImported: 1 })
    expect(languageNames).toEqual(
      expect.arrayContaining([
        {
          parentLanguageId: '2',
          languageId: '529',
          value: 'Spanish',
          primary: false
        },
        {
          parentLanguageId: '2',
          languageId: '2',
          value: 'Español',
          primary: true
        }
      ])
    )
    expect(primaryRowsFor('2')).toHaveLength(1)
  })

  it('produces exactly one row for English itself (id 529), not two', async () => {
    mockFetchRows([{ id: '529', name: 'English', nativeName: 'English' }])

    await runWessLanguagesImport()

    expect(languageNames).toEqual([
      {
        parentLanguageId: '529',
        languageId: '529',
        value: 'English',
        primary: true
      }
    ])
  })

  it('promotes a later-arriving autonym to primary and demotes the stored English row', async () => {
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '529',
      value: 'Spanish',
      primary: true
    })
    mockFetchRows([{ id: '2', name: 'Spanish', nativeName: 'Español' }])

    await runWessLanguagesImport()

    expect(languageNames).toEqual(
      expect.arrayContaining([
        {
          parentLanguageId: '2',
          languageId: '529',
          value: 'Spanish',
          primary: false
        },
        {
          parentLanguageId: '2',
          languageId: '2',
          value: 'Español',
          primary: true
        }
      ])
    )
    expect(primaryRowsFor('2')).toHaveLength(1)
  })

  it('demotes the stored English row even when the run supplies no LAN_NAME (autonym-only mirror case)', async () => {
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '529',
      value: 'Spanish',
      primary: true
    })
    mockFetchRows([{ id: '2', nativeName: 'Español' }])

    await runWessLanguagesImport()

    expect(languageNames).toEqual(
      expect.arrayContaining([
        {
          parentLanguageId: '2',
          languageId: '529',
          value: 'Spanish',
          primary: false
        },
        {
          parentLanguageId: '2',
          languageId: '2',
          value: 'Español',
          primary: true
        }
      ])
    )
    expect(primaryRowsFor('2')).toHaveLength(1)
  })

  it('preserves a stored autonym as primary when a later run omits NATIVE_LAN_NAME (no-op, not a retraction)', async () => {
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '529',
      value: 'Spanish',
      primary: false
    })
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '2',
      value: 'Español',
      primary: true
    })
    mockFetchRows([{ id: '2', name: 'Spanish' }])

    const result = await runWessLanguagesImport()

    expect(result.nativeNamesImported).toBe(0)
    expect(languageNames).toEqual(
      expect.arrayContaining([
        {
          parentLanguageId: '2',
          languageId: '529',
          value: 'Spanish',
          primary: false
        },
        {
          parentLanguageId: '2',
          languageId: '2',
          value: 'Español',
          primary: true
        }
      ])
    )
    expect(primaryRowsFor('2')).toHaveLength(1)
  })

  it('does not promote a brand-new English row to primary when a stored autonym already exists', async () => {
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '2',
      value: 'Español',
      primary: true
    })
    mockFetchRows([{ id: '2', name: 'Spanish' }])

    await runWessLanguagesImport()

    expect(languageNames).toEqual(
      expect.arrayContaining([
        {
          parentLanguageId: '2',
          languageId: '529',
          value: 'Spanish',
          primary: false
        },
        {
          parentLanguageId: '2',
          languageId: '2',
          value: 'Español',
          primary: true
        }
      ])
    )
    expect(primaryRowsFor('2')).toHaveLength(1)
  })

  it('treats a blank NATIVE_LAN_NAME as absent and does not disturb the stored autonym', async () => {
    seedLanguageName({
      parentLanguageId: '2',
      languageId: '2',
      value: 'Español',
      primary: true
    })
    mockFetchRows([{ id: '2', name: 'Spanish', nativeName: '   ' }])

    const result = await runWessLanguagesImport()

    expect(result.nativeNamesImported).toBe(0)
    expect(primaryRowsFor('2')).toEqual([
      {
        parentLanguageId: '2',
        languageId: '2',
        value: 'Español',
        primary: true
      }
    ])
  })

  it('reports nativeNamesImported across multiple rows', async () => {
    mockFetchRows([
      { id: '2', name: 'Spanish', nativeName: 'Español' },
      { id: '3', name: 'French' },
      { id: '4', nativeName: 'Deutsch' }
    ])

    const result = await runWessLanguagesImport()

    expect(result).toEqual({ languagesImported: 3, nativeNamesImported: 2 })
  })
})
