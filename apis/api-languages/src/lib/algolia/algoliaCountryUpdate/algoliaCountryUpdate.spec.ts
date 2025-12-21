import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { updateCountryInAlgolia } from './algoliaCountryUpdate'

// Mock the algolia client helper
jest.mock('../algoliaClient', () => ({
  getAlgoliaClient: jest.fn()
}))

describe('algoliaCountryUpdate', () => {
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
    process.env.ALGOLIA_INDEX_COUNTRIES = 'test-countries'

    // Reset the spy mock return values
    saveObjectsSpy.mockResolvedValue([{ taskID: 'test-task-123' }])

    getAlgoliaClient.mockResolvedValue(mockAlgoliaClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip update when algolia client is null', async () => {
    getAlgoliaClient.mockResolvedValueOnce(null)

    await updateCountryInAlgolia('test-country-id', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'algolia client not found, skipping update'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should warn when country is not found', async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce(null)

    await updateCountryInAlgolia('non-existent-country', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'country non-existent-country not found'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should successfully update country in algolia', async () => {
    // Mock country query
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: 'GB',
      population: 67000000,
      latitude: 54.0,
      longitude: -2.0,
      flagPngSrc: 'gb-flag.png',
      flagWebpSrc: 'gb-flag.webp',
      name: [
        {
          value: 'United Kingdom',
          language: { id: '529', bcp47: 'en' },
          primary: true
        },
        {
          value: 'Royaume-Uni',
          language: { id: '496', bcp47: 'fr' },
          primary: false
        },
        {
          value: '英国',
          language: { id: '21754', bcp47: 'zh-Hans' },
          primary: false
        }
      ],
      continent: {
        id: 'europe',
        name: 'Europe'
      }
    } as any)

    await updateCountryInAlgolia('GB', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-countries',
      objects: [
        expect.objectContaining({
          objectID: 'GB',
          countryId: 'GB',
          population: 67000000,
          latitude: 54.0,
          longitude: -2.0,
          flagPngSrc: 'gb-flag.png',
          flagWebpSrc: 'gb-flag.webp',
          continent: {
            id: 'europe',
            name: 'Europe'
          },
          names: [
            { value: 'United Kingdom', languageId: '529', bcp47: 'en' },
            { value: 'Royaume-Uni', languageId: '496', bcp47: 'fr' },
            { value: '英国', languageId: '21754', bcp47: 'zh-Hans' }
          ]
        })
      ],
      waitForTasks: true
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Successfully saved country to Algolia. Tasks: test-task-123'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Record GB is now available in index test-countries'
    )
  })

  it('should handle country with no names', async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: 'TEST',
      population: 1000000,
      latitude: 0.0,
      longitude: 0.0,
      flagPngSrc: 'test-flag.png',
      flagWebpSrc: 'test-flag.webp',
      name: [],
      continent: {
        id: 'test-continent',
        name: 'Test Continent'
      }
    } as any)

    await updateCountryInAlgolia('TEST', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-countries',
      objects: [
        expect.objectContaining({
          objectID: 'TEST',
          countryId: 'TEST',
          population: 1000000,
          latitude: 0.0,
          longitude: 0.0,
          flagPngSrc: 'test-flag.png',
          flagWebpSrc: 'test-flag.webp',
          continent: {
            id: 'test-continent',
            name: 'Test Continent'
          },
          names: []
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle country with null values', async () => {
    prismaMock.country.findUnique.mockResolvedValueOnce({
      id: 'NULL',
      population: null,
      latitude: null,
      longitude: null,
      flagPngSrc: null,
      flagWebpSrc: null,
      name: [
        {
          value: 'Null Country',
          language: { id: '529', bcp47: 'en' },
          primary: true
        }
      ],
      continent: {
        id: 'null-continent',
        name: 'Null Continent'
      }
    } as any)

    await updateCountryInAlgolia('NULL', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-countries',
      objects: [
        expect.objectContaining({
          objectID: 'NULL',
          countryId: 'NULL',
          population: null,
          latitude: null,
          longitude: null,
          flagPngSrc: null,
          flagWebpSrc: null,
          continent: {
            id: 'null-continent',
            name: 'Null Continent'
          },
          names: [{ value: 'Null Country', languageId: '529', bcp47: 'en' }]
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle errors gracefully', async () => {
    prismaMock.country.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    )

    await updateCountryInAlgolia('test-country-id', mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update country test-country-id in algolia'
    )
  })
})
