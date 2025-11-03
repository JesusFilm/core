import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Integration, Journey } from '@core/prisma/journeys/client'

import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationGrowthSpacesService } from './growthSpaces.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const block: Block = {
  id: 'blockId',
  journeyId: '2',
  typename: 'ImageBlock',
  parentBlockId: 'card1',
  parentOrder: 0,
  src: 'https://source.unsplash.com/random/1920x1080',
  alt: 'random image from unsplash',
  width: 1920,
  height: 1080,
  label: 'label',
  description: 'description',
  updatedAt: new Date(),
  routeId: 'routeId',
  integrationId: 'integrationId'
} as unknown as Block

const integration: Integration = {
  id: 'integrationId',
  teamId: 'teamId',
  type: 'growthSpaces',
  accessId: 'accessId',
  accessSecretPart: 'plaint',
  // decrypted value for accessSecretCipherText should be "plaintext"
  accessSecretCipherText: 'saeRCBy44pMT',
  accessSecretIv: 'dx+2iBr7yYvilLIC',
  accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
}

const journey: Journey = {
  id: 'journeyId',
  languageId: '529'
} as unknown as Journey

const mockAxios = axios as jest.MockedFunction<typeof axios>
let mockAxiosGet: jest.Mock
let mockAxiosPost: jest.Mock

describe('IntegrationGrothSpacesService', () => {
  const OLD_ENV = process.env

  let service: IntegrationGrowthSpacesService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        IntegrationGrowthSpacesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    service = await module.resolve(IntegrationGrowthSpacesService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    mockAxiosGet = jest.fn()
    mockAxiosPost = jest.fn()
    mockAxios.create = jest.fn().mockImplementation(async () => ({
      get: mockAxiosGet,
      post: mockAxiosPost
    }))

    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    process.env = OLD_ENV
  })

  describe('authenticate', () => {
    it('should check if growth spaces integration config is correct', async () => {
      process.env.GROWTH_SPACES_URL = 'https://example.url.api/v1'
      await service.authenticate({
        accessId: 'accessId',
        accessSecret: 'accessSecret'
      })
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://example.url.api/v1',
        headers: { 'Access-Id': 'accessId', 'Access-Secret': 'accessSecret' }
      })
      expect(mockAxiosGet).toHaveBeenCalledWith('/authentication')
    })

    it('should throw error if api sends error', async () => {
      mockAxiosGet.mockRejectedValueOnce({})
      await expect(
        service.authenticate({
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow()
    })

    it('should throw error if growth spaces integration details are incorrect', async () => {
      await mockAxiosGet.mockRejectedValueOnce(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: 401
        } as unknown as AxiosResponse<unknown, unknown>)
      )

      await expect(
        service.authenticate({
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow('invalid credentials for Growth Spaces integration')
    })
  })

  describe('routes', () => {
    it('should return routes', async () => {
      process.env.GROWTH_SPACES_URL = 'https://example.url.api/v1'
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockAxiosGet.mockResolvedValueOnce({})

      await service.routes(integration)
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://example.url.api/v1',
        headers: { 'Access-Id': 'accessId', 'Access-Secret': 'plaintext' }
      })
      expect(mockAxiosGet).toHaveBeenCalledWith('/routes')
    })

    it('should throw error if api sends error', async () => {
      await expect(service.routes(integration)).rejects.toThrow()
    })

    it('should throw error if growth spaces integration details are incorrect', async () => {
      process.env.GROWTH_SPACES_URL = 'https://example.url.api/v1'
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockAxiosGet.mockRejectedValueOnce(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: 401
        } as unknown as AxiosResponse<unknown, unknown>)
      )

      await expect(service.routes(integration)).rejects.toThrow(
        'invalid credentials for Growth Spaces integration'
      )

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://example.url.api/v1',
        headers: { 'Access-Id': 'accessId', 'Access-Secret': 'plaintext' }
      })
    })
  })

  describe('addSubscriber', () => {
    it('should silently exit function if block is missing the integration id or route id', async () => {
      const blockWithoutRouteOrIntegration = {
        ...block,
        integrationId: null,
        routeId: null
      }

      await service.addSubscriber(
        'journeyId',
        blockWithoutRouteOrIntegration,
        'john',
        'johndoe@example.com'
      )

      expect(prismaService.integration.findUnique).not.toHaveBeenCalled()
    })

    it('should silently exit function if integration cannot be found', async () => {
      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )
      prismaService.integration.findUnique.mockResolvedValue(null)

      expect(prismaService.integration.findUnique).toHaveBeenCalledWith({
        where: { id: 'integrationId' }
      })

      expect(prismaService.journey.findUnique).not.toHaveBeenCalled()
    })

    // eslint-disable-next-line jest/no-identical-title
    it('should silently exit function if integration cannot be found', async () => {
      prismaService.integration.findUnique.mockResolvedValue(null)
      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )

      expect(prismaService.integration.findUnique).toHaveBeenCalledWith({
        where: { id: 'integrationId' }
      })

      expect(prismaService.journey.findUnique).not.toHaveBeenCalled()
    })

    it('should silently exit function if journey cannot be found', async () => {
      prismaService.integration.findUnique.mockResolvedValue(integration)
      prismaService.journey.findUnique.mockResolvedValue(null)
      const mockApollo = jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          async () =>
            await Promise.resolve({
              data: {
                language: null
              }
            } as unknown as ApolloQueryResult<unknown>)
        )
      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )

      expect(prismaService.integration.findUnique).toHaveBeenCalledWith({
        where: { id: 'integrationId' }
      })

      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        select: { languageId: true },
        where: { id: 'journeyId' }
      })
      expect(mockApollo).not.toHaveBeenCalled()
    })

    it('should silently exit function if it can not find language', async () => {
      prismaService.integration.findUnique.mockResolvedValue(integration)
      prismaService.journey.findUnique.mockResolvedValue(journey)

      const mockApollo = jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          async () =>
            await Promise.resolve({
              data: {
                language: null
              }
            } as unknown as ApolloQueryResult<unknown>)
        )
      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )

      expect(mockApollo).toHaveBeenCalled()
    })

    it('should silently exit function if it cannot authenticate to Growth Spaces', async () => {
      prismaService.integration.findUnique.mockResolvedValue(integration)
      prismaService.journey.findUnique.mockResolvedValue(journey)
      mockAxiosPost.mockRejectedValueOnce({})
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              language: {
                id: 'languageId',
                bcp47: 'en'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      const consoleMock = jest.spyOn(global.console, 'error')

      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )

      expect(mockAxiosPost).toHaveBeenCalled()
      expect(consoleMock).toHaveBeenCalled()
    })

    it('should add subscriber', async () => {
      prismaService.integration.findUnique.mockResolvedValue(integration)
      prismaService.journey.findUnique.mockResolvedValue(journey)
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              language: {
                id: 'languageId',
                bcp47: 'en'
              }
            }
          } as unknown as ApolloQueryResult<unknown>)
      )
      const consoleMock = jest.spyOn(console, 'error')
      mockAxiosPost.mockResolvedValue({})
      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )

      expect(mockAxiosPost).toHaveBeenCalledWith('/subscribers', {
        subscriber: {
          email: 'johndoe@example.com',
          first_name: 'john',
          language_code: 'en',
          route_id: 'routeId'
        }
      })
      expect(consoleMock).not.toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('should create growth spaces integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const input = {
        accessId: 'accessId',
        accessSecret: 'accessSecret',
        teamId: 'teamId'
      }

      mockAxiosGet.mockResolvedValueOnce({})

      await service.create(input, prismaService)
      expect(prismaService.integration.create).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
          teamId: 'teamId',
          type: 'growthSpaces',
          accessSecretPart: input.accessSecret.slice(0, 6),
          accessSecretCipherText: expect.any(String),
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String)
        },
        include: { team: { include: { userTeams: true } } }
      })
    })
  })

  describe('update', () => {
    it('should update growth spaces integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const input = { accessId: 'accessId', accessSecret: 'accessSecret' }
      mockAxiosGet.mockResolvedValueOnce({})

      await service.update('integrationId', input)
      expect(prismaService.integration.update).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
          accessSecretPart: input.accessSecret.slice(0, 6),
          accessSecretCipherText: expect.any(String),
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String)
        },
        where: {
          id: 'integrationId'
        }
      })
    })
  })
})
