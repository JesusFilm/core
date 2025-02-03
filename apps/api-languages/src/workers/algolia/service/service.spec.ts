import clone from 'lodash/clone'

import { prisma } from '../../../lib/prisma'

import { service } from '.'

const prismaFindManySpy = jest
  .fn()
  .mockResolvedValueOnce([
    {
      id: '185021',
      bcp47: 'eng'
    }
  ])
  .mockResolvedValueOnce([
    {
      id: '185021',
      iso3: 'eng',
      bcp47: 'eng',
      name: [
        {
          value: 'English, British',
          languageId: '185021'
        }
      ],
      countryLanguages: [
        {
          countryId: 'GB',
          primary: true,
          speakers: 100000
        }
      ]
    }
  ])

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

const initIndexSpy = jest.fn().mockReturnValue({
  saveObjects: saveObjectsSpy
})

jest.mock('algoliasearch', () => {
  return jest.fn().mockImplementation(() => ({
    initIndex: initIndexSpy
  }))
})

describe('algolia/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ALGOLIA_API_KEY: 'key',
      ALGOLIA_APPLICATION_ID: 'id',
      ALGOLIA_INDEX: 'languages'
    }
    jest.clearAllMocks()
    jest
      .spyOn(prisma.language, 'findMany')
      .mockImplementation(prismaFindManySpy)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should throw if environment variables not set', async () => {
    process.env.ALGOLIA_API_KEY = undefined
    await expect(service()).rejects.toThrow(
      'algolia environment variables not set'
    )
  })

  it('should index languages to Algolia', async () => {
    await service()

    expect(prismaFindManySpy).toHaveBeenNthCalledWith(1, {
      select: {
        id: true,
        bcp47: true
      }
    })

    expect(prismaFindManySpy).toHaveBeenNthCalledWith(2, {
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

    expect(initIndexSpy).toHaveBeenCalledWith('languages')

    expect(saveObjectsSpy).toHaveBeenCalledWith([
      {
        objectID: '185021',
        languageId: 185021,
        iso3: 'eng',
        bcp47: 'eng',
        primaryCountryId: 'GB',
        nameNative: 'English, British',
        names: [
          {
            value: 'English, British',
            languageId: '185021',
            bcp47: 'eng'
          }
        ],
        speakersCount: 100000
      }
    ])
  })
})
