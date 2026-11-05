import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import {
  buildAlgoliaLanguageRecord,
  reindexLanguagesWithVideosInAlgolia,
  removeLanguagesFromAlgolia,
  updateLanguageInAlgoliaFromMedia
} from './updateLanguageInAlgolia'

const saveObjectsSpy = vi.fn()
const deleteObjectSpy = vi.fn()
const deleteObjectsSpy = vi.fn()

vi.mock('algoliasearch', () => ({
  algoliasearch: () => ({
    saveObjects: saveObjectsSpy,
    deleteObject: deleteObjectSpy,
    deleteObjects: deleteObjectsSpy
  })
}))

vi.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<LanguagesPrismaClient>()
}))

const languagesPrismaMock =
  languagesPrisma as unknown as DeepMockProxy<LanguagesPrismaClient>

// The exact selected-payload shape buildAlgoliaLanguageRecord consumes, so the
// fixtures stay checked against the Algolia record contract.
type AlgoliaLanguageInput = Parameters<typeof buildAlgoliaLanguageRecord>[0]

// The prisma mock is typed against the full Language model, but every call
// under test passes `select: languageAlgoliaSelect`, so the value that actually
// comes back is the narrower AlgoliaLanguageInput. These two helpers keep that
// one unavoidable widening in a single named place instead of `any` at every
// fixture.
// updateLanguageInAlgoliaFromMedia additionally selects the two visibility
// flags, both of which default to true in the schema, so fixtures opt out
// rather than opt in.
function mockFindUnique(
  language: AlgoliaLanguageInput | null,
  visibility: { hasVideos?: boolean; searchable?: boolean } = {}
): void {
  const { hasVideos = true, searchable = true } = visibility
  languagesPrismaMock.language.findUnique.mockResolvedValue(
    (language == null ? null : { ...language, hasVideos, searchable }) as never
  )
}

function mockFindManyOnce(languages: AlgoliaLanguageInput[]): void {
  languagesPrismaMock.language.findMany.mockResolvedValueOnce(
    languages as never
  )
}

function createLanguage(
  overrides: Partial<AlgoliaLanguageInput> = {}
): AlgoliaLanguageInput {
  return {
    id: '1234',
    bcp47: 'plu',
    iso3: 'plu',
    name: [
      {
        value: 'Palikur',
        primary: false,
        language: { id: '529', bcp47: 'en' }
      },
      {
        value: 'Parikwaki',
        primary: true,
        language: { id: '1234', bcp47: 'plu' }
      }
    ],
    countryLanguages: [
      {
        speakers: 100,
        suggested: false,
        primary: true,
        country: { id: 'BR' }
      },
      {
        speakers: 50,
        suggested: true,
        primary: false,
        country: { id: 'GF' }
      }
    ],
    ...overrides
  }
}

describe('updateLanguageInAlgolia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // clearAllMocks leaves queued mockResolvedValueOnce values in place, so
    // reset the prisma methods to isolate each test.
    languagesPrismaMock.language.findUnique.mockReset()
    languagesPrismaMock.language.findMany.mockReset()
    process.env.ALGOLIA_APPLICATION_ID = 'app-id'
    process.env.ALGOLIA_API_KEY = 'api-key'
    process.env.ALGOLIA_INDEX_LANGUAGES = 'languages-index'
    saveObjectsSpy.mockResolvedValue([{ taskID: 'task-1' }])
    deleteObjectSpy.mockResolvedValue({ taskID: 'task-2' })
    deleteObjectsSpy.mockResolvedValue([{ taskID: 'task-3' }])
  })

  describe('buildAlgoliaLanguageRecord', () => {
    it('includes the English name in the searchable names array', () => {
      const record = buildAlgoliaLanguageRecord(createLanguage())

      expect(record).toEqual({
        objectID: '1234',
        languageId: 1234,
        bcp47: 'plu',
        iso3: 'plu',
        nameNative: 'Parikwaki',
        speakersCount: 100,
        primaryCountryId: 'BR',
        names: [
          { value: 'Palikur', languageId: '529', bcp47: 'en' },
          { value: 'Parikwaki', languageId: '1234', bcp47: 'plu' }
        ]
      })
    })

    it('emits languageId as a number while objectID stays a string', () => {
      const record = buildAlgoliaLanguageRecord(
        createLanguage({ id: '143846' })
      )

      // The rest of the index stores languageId numerically and arclight's
      // AlgoliaLanguageHit types it as a number, so a string here would make
      // the index heterogeneous.
      expect(record.languageId).toBe(143846)
      expect(record.objectID).toBe('143846')
    })

    it('only counts speakers from non-suggested country languages', () => {
      const record = buildAlgoliaLanguageRecord(createLanguage())

      expect(record.speakersCount).toBe(100)
    })

    it('falls back to US when no country languages exist', () => {
      const record = buildAlgoliaLanguageRecord(
        createLanguage({ countryLanguages: [] })
      )

      expect(record.primaryCountryId).toBe('US')
    })
  })

  describe('updateLanguageInAlgoliaFromMedia', () => {
    it('saves the language record to the languages index', async () => {
      mockFindUnique(createLanguage())

      await updateLanguageInAlgoliaFromMedia('1234')

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objects: [expect.objectContaining({ objectID: '1234' })],
        waitForTasks: true
      })
    })

    it('removes the record instead of saving when the language is not found', async () => {
      mockFindUnique(null)

      await updateLanguageInAlgoliaFromMedia('missing')

      expect(saveObjectsSpy).not.toHaveBeenCalled()
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objectID: 'missing'
      })
    })

    it('removes the record when hasVideos is false', async () => {
      // The sync is otherwise upsert-only, so skipping the write here would
      // leave an already-indexed language searchable forever.
      mockFindUnique(createLanguage(), { hasVideos: false })

      await updateLanguageInAlgoliaFromMedia('1234')

      expect(saveObjectsSpy).not.toHaveBeenCalled()
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objectID: '1234'
      })
    })

    it('removes the record when an operator has hidden the language', async () => {
      // searchable: false is the operator's decision and outranks content:
      // the language has videos, but must not be publicly visible.
      mockFindUnique(createLanguage(), { searchable: false })

      await updateLanguageInAlgoliaFromMedia('1234')

      expect(saveObjectsSpy).not.toHaveBeenCalled()
      expect(deleteObjectSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objectID: '1234'
      })
    })

    it('saves when both flags are true', async () => {
      mockFindUnique(createLanguage(), { hasVideos: true, searchable: true })

      await updateLanguageInAlgoliaFromMedia('1234')

      expect(deleteObjectSpy).not.toHaveBeenCalled()
      expect(saveObjectsSpy).toHaveBeenCalled()
    })
  })

  describe('reindexLanguagesWithVideosInAlgolia', () => {
    it('paginates full batches by cursor and saves each batch', async () => {
      const fullBatch = Array.from({ length: 1000 }, (_, index) =>
        createLanguage({ id: `id-${index}` })
      )
      mockFindManyOnce(fullBatch)
      mockFindManyOnce([createLanguage({ id: 'last' })])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 1001 })
      expect(languagesPrismaMock.language.findMany).toHaveBeenCalledTimes(2)
      // first page: no cursor
      expect(languagesPrismaMock.language.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { hasVideos: true, searchable: true },
          take: 1000
        })
      )
      // second page: continues from the last id of the previous batch
      expect(languagesPrismaMock.language.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ skip: 1, cursor: { id: 'id-999' } })
      )
      expect(saveObjectsSpy).toHaveBeenCalledTimes(2)
      expect(saveObjectsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          indexName: 'languages-index',
          waitForTasks: true
        })
      )
    })

    it('stops after a partial batch without an extra query', async () => {
      mockFindManyOnce([createLanguage({ id: 'a' })])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 1 })
      expect(languagesPrismaMock.language.findMany).toHaveBeenCalledTimes(1)
      expect(saveObjectsSpy).toHaveBeenCalledTimes(1)
    })

    it('returns zero and does not save when no languages have videos', async () => {
      mockFindManyOnce([])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 0 })
      expect(saveObjectsSpy).not.toHaveBeenCalled()
    })

    it('propagates a batch failure so the caller exits non-zero', async () => {
      mockFindManyOnce([createLanguage({ id: 'a' })])
      saveObjectsSpy.mockRejectedValueOnce(new Error('algolia unavailable'))

      await expect(reindexLanguagesWithVideosInAlgolia()).rejects.toThrow(
        'algolia unavailable'
      )
    })
  })

  describe('removeLanguagesFromAlgolia', () => {
    it('deletes the given object ids from the languages index', async () => {
      const result = await removeLanguagesFromAlgolia(['20525', '117014'])

      expect(result).toEqual({ removed: 2 })
      expect(deleteObjectsSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objectIDs: ['20525', '117014'],
        waitForTasks: true
      })
    })

    it('does nothing and touches no client when there is nothing to remove', async () => {
      const result = await removeLanguagesFromAlgolia([])

      expect(result).toEqual({ removed: 0 })
      expect(deleteObjectsSpy).not.toHaveBeenCalled()
    })

    it('splits removals into batches', async () => {
      const ids = Array.from({ length: 1001 }, (_, index) => `id-${index}`)

      const result = await removeLanguagesFromAlgolia(ids)

      expect(result).toEqual({ removed: 1001 })
      expect(deleteObjectsSpy).toHaveBeenCalledTimes(2)
      expect(deleteObjectsSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ objectIDs: ['id-1000'] })
      )
    })

    it('propagates a delete failure so the caller exits non-zero', async () => {
      deleteObjectsSpy.mockRejectedValueOnce(new Error('algolia unavailable'))

      await expect(removeLanguagesFromAlgolia(['20525'])).rejects.toThrow(
        'algolia unavailable'
      )
    })
  })
})
