import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import {
  buildAlgoliaLanguageRecord,
  reindexLanguagesWithVideosInAlgolia,
  updateLanguageInAlgoliaFromMedia
} from './updateLanguageInAlgolia'

const saveObjectsSpy = vi.fn()

vi.mock('algoliasearch', () => ({
  algoliasearch: () => ({
    saveObjects: saveObjectsSpy
  })
}))

vi.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<LanguagesPrismaClient>()
}))

const languagesPrismaMock =
  languagesPrisma as unknown as DeepMockProxy<LanguagesPrismaClient>

function createLanguage(overrides: Record<string, unknown> = {}): any {
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
  })

  describe('buildAlgoliaLanguageRecord', () => {
    it('includes the English name in the searchable names array', () => {
      const record = buildAlgoliaLanguageRecord(createLanguage())

      expect(record).toEqual({
        objectID: '1234',
        languageId: '1234',
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
      languagesPrismaMock.language.findUnique.mockResolvedValue(
        createLanguage()
      )

      await updateLanguageInAlgoliaFromMedia('1234')

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'languages-index',
        objects: [expect.objectContaining({ objectID: '1234' })],
        waitForTasks: true
      })
    })

    it('does not save when the language is not found', async () => {
      languagesPrismaMock.language.findUnique.mockResolvedValue(null)

      await updateLanguageInAlgoliaFromMedia('missing')

      expect(saveObjectsSpy).not.toHaveBeenCalled()
    })
  })

  describe('reindexLanguagesWithVideosInAlgolia', () => {
    it('paginates full batches by cursor and saves each batch', async () => {
      const fullBatch = Array.from({ length: 1000 }, (_, index) =>
        createLanguage({ id: `id-${index}` })
      )
      languagesPrismaMock.language.findMany
        .mockResolvedValueOnce(fullBatch)
        .mockResolvedValueOnce([createLanguage({ id: 'last' })])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 1001 })
      expect(languagesPrismaMock.language.findMany).toHaveBeenCalledTimes(2)
      // first page: no cursor
      expect(languagesPrismaMock.language.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ where: { hasVideos: true }, take: 1000 })
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
          waitForTasks: false
        })
      )
    })

    it('stops after a partial batch without an extra query', async () => {
      languagesPrismaMock.language.findMany.mockResolvedValueOnce([
        createLanguage({ id: 'a' })
      ])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 1 })
      expect(languagesPrismaMock.language.findMany).toHaveBeenCalledTimes(1)
      expect(saveObjectsSpy).toHaveBeenCalledTimes(1)
    })

    it('returns zero and does not save when no languages have videos', async () => {
      languagesPrismaMock.language.findMany.mockResolvedValueOnce([])

      const result = await reindexLanguagesWithVideosInAlgolia()

      expect(result).toEqual({ count: 0 })
      expect(saveObjectsSpy).not.toHaveBeenCalled()
    })
  })
})
