import { algoliasearch } from 'algoliasearch'
import clone from 'lodash/clone'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from '.'

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn().mockImplementation(() => ({
    saveObjects: saveObjectsSpy
  }))
}))

describe('algolia/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  afterAll(() => {
    process.env = originalEnv
    jest.resetAllMocks()
  })

  it('should throw if no API key', async () => {
    process.env.ALGOLIA_API_KEY_LANGUAGES = undefined
    process.env.ALGOLIA_APPLICATION_ID = undefined
    process.env.ALGOLIA_INDEX_LANGUAGES = undefined
    await expect(service()).rejects.toThrow(
      'algolia environment variables not set'
    )
  })

  it('should sync languages to Algolia', async () => {
    process.env.ALGOLIA_API_KEY_LANGUAGES = 'key'
    process.env.ALGOLIA_APPLICATION_ID = 'id'
    process.env.ALGOLIA_INDEX_LANGUAGES = 'languages'

    prismaMock.language.findMany.mockResolvedValueOnce([
      {
        id: '21754',
        bcp47: 'zh-Hans',
        createdAt: new Date(),
        updatedAt: new Date(),
        iso3: null,
        hasVideos: false,
        slug: null
      },
      {
        id: '529',
        bcp47: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        iso3: null,
        hasVideos: false,
        slug: null
      }
    ])

    prismaMock.language.findMany.mockResolvedValueOnce([
      {
        id: '21754',
        iso3: 'zho',
        bcp47: 'zh-Hans',
        hasVideos: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: null,
        name: [
          { value: 'Chinese, Simplified', languageId: '529' },
          { value: '简体中文', languageId: '21754' }
        ],
        countryLanguages: [
          {
            primary: true,
            countryId: 'CN',
            speakers: 1000000,
            country: { id: 'CN' }
          }
        ]
      } as any
    ])

    await service()

    expect(prismaMock.language.findMany).toHaveBeenNthCalledWith(1, {
      select: {
        id: true,
        bcp47: true
      }
    })

    expect(prismaMock.language.findMany).toHaveBeenNthCalledWith(2, {
      include: {
        name: true,
        countryLanguages: {
          include: {
            country: true
          }
        }
      },
      where: {
        hasVideos: true
      }
    })

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'languages',
      objects: [
        {
          objectID: '21754',
          languageId: 21754,
          iso3: 'zho',
          bcp47: 'zh-Hans',
          primaryCountryId: 'CN',
          nameNative: '简体中文',
          names: [
            { value: 'Chinese, Simplified', languageId: '529', bcp47: 'en' },
            { value: '简体中文', languageId: '21754', bcp47: 'zh-Hans' }
          ],
          speakersCount: 1000000
        }
      ],
      waitForTasks: true
    })
  })
})
