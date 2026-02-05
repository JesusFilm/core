import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { updateLanguageInAlgolia } from './algoliaLanguageUpdate'

// Mock the algolia client helper
jest.mock('../algoliaClient', () => ({
  getAlgoliaClient: jest.fn()
}))

describe('algoliaLanguageUpdate', () => {
  const saveObjectsSpy = jest
    .fn()
    .mockResolvedValue([{ taskID: 'test-task-123' }])

  const mockAlgoliaClient = {
    saveObjects: saveObjectsSpy
  }

  const mockLogger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  } as any

  // Get the mocked functions
  const { getAlgoliaClient } = require('../algoliaClient')

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ALGOLIA_INDEX_LANGUAGES = 'test-languages'

    // Reset the spy mock return values
    saveObjectsSpy.mockResolvedValue([{ taskID: 'test-task-123' }])

    getAlgoliaClient.mockResolvedValue(mockAlgoliaClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip update when algolia client is null', async () => {
    getAlgoliaClient.mockResolvedValueOnce(null)

    await updateLanguageInAlgolia('test-language-id', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'algolia client not found, skipping update'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should warn when language is not found', async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce(null)

    await updateLanguageInAlgolia('non-existent-language', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'language non-existent-language not found'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should successfully update language in algolia', async () => {
    // Mock language query
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          value: 'English',
          primary: true,
          language: { id: '529', bcp47: 'en' }
        },
        {
          value: 'Anglais',
          primary: false,
          language: { id: '496', bcp47: 'fr' }
        },
        {
          value: '英语',
          primary: false,
          language: { id: '21754', bcp47: 'zh-Hans' }
        }
      ],
      countryLanguages: [
        {
          speakers: 40000000000,
          suggested: false,
          primary: true,
          country: { id: 'GB' }
        },
        {
          speakers: 48368586015,
          suggested: false,
          primary: false,
          country: { id: 'US' }
        },
        {
          speakers: 1000000,
          suggested: true,
          primary: false,
          country: { id: 'CA' }
        } // This should be excluded
      ]
    } as any)

    await updateLanguageInAlgolia('529', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-languages',
      objects: [
        expect.objectContaining({
          objectID: '529',
          languageId: '529',
          bcp47: 'en',
          iso3: 'eng',
          nameNative: 'English',
          speakersCount: 88368586015,
          primaryCountryId: 'GB',
          names: [
            { value: 'English', languageId: '529', bcp47: 'en' },
            { value: 'Anglais', languageId: '496', bcp47: 'fr' },
            { value: '英语', languageId: '21754', bcp47: 'zh-Hans' }
          ]
        })
      ],
      waitForTasks: true
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Successfully saved language to Algolia. Tasks: test-task-123'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Record 529 is now available in index test-languages'
    )
  })

  it('should handle language with no names', async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 'test-id',
      bcp47: 'test',
      iso3: 'tst',
      name: [],
      countryLanguages: [
        {
          speakers: 1000,
          suggested: false,
          primary: true,
          country: { id: 'US' }
        }
      ]
    } as any)

    await updateLanguageInAlgolia('test-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-languages',
      objects: [
        expect.objectContaining({
          objectID: 'test-id',
          languageId: 'test-id',
          bcp47: 'test',
          iso3: 'tst',
          nameNative: '',
          speakersCount: 1000,
          primaryCountryId: 'US',
          names: []
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle errors gracefully', async () => {
    prismaMock.language.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    )

    await updateLanguageInAlgolia('test-language-id', mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update language test-language-id in algolia'
    )
  })
})
