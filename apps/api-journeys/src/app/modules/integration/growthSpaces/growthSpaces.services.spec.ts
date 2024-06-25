import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationService } from '../integration.service'
import { IntegrationGrothSpacesService } from './growthSpaces.service'
import { Block, Integration } from '.prisma/api-journeys-client'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

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
  // decrypted value for accessSecretCipherText should be "plaintext"
  accessSecretCipherText: 'saeRCBy44pMT',
  accessSecretIv: 'dx+2iBr7yYvilLIC',
  accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
}

describe('IntegrationGrothSpacesService', () => {
  const OLD_ENV = process.env

  let service: IntegrationGrothSpacesService,
    prismaService: DeepMockProxy<PrismaService>,
    integrationService: IntegrationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        IntegrationService,
        IntegrationGrothSpacesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    integrationService = module.get<IntegrationService>(IntegrationService)
    service = await module.resolve(IntegrationGrothSpacesService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>

    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = OLD_ENV
  })

  describe('authenticate', () => {
    it('should check if growth spaces integration config is correct', async () => {
      const data = 'ok'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      await service.authenticate('accessId', 'accessSecret')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.growthspaces.org/api/v1/authentication',
        {
          headers: { 'Access-Id': 'accessId', 'Access-Secret': 'accessSecret' }
        }
      )
    })

    it('should throw error if growth spaces integration is incorrect', async () => {
      const data = {
        error: 'Unauthorized'
      }
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      await expect(
        service.authenticate('accessId', 'accessSecret')
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })
  })

  describe('addSubscriber', () => {
    it('should throw an error if block is missing the integration id or route id', async () => {
      const blockWithoutRouteOrIntegration = {
        ...block,
        integrationId: null,
        routeId: null
      }

      await expect(
        service.addSubscriber(
          'journeyId',
          blockWithoutRouteOrIntegration,
          'john',
          'johndoe@example.com'
        )
      ).rejects.toThrow(
        'trying to add subscriber but the integration or route id is not set'
      )
    })

    it('should throw error if it can not find language', async () => {
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              language: null
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await expect(
        service.addSubscriber('journeyId', block, 'john', 'johndoe@example.com')
      ).rejects.toThrow('cannot find language code')
    })

    it('should throw error if integration variables are null', async () => {
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

      await expect(
        service.addSubscriber('journeyId', block, 'john', 'johndoe@example.com')
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })

    it('should throw error if api call to growth spaces fails', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      prismaService.integration.findUnique.mockResolvedValue(integration)

      mockFetch.mockRejectedValue({
        ok: true,
        status: 401,
        json: async () => await Promise.resolve()
      } as unknown as Response)

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

      await expect(
        service.addSubscriber('journeyId', block, 'john', 'johndoe@example.com')
      ).rejects.toThrow('failed to fetch from Growth Spaces')
    })

    it('should add subscriber', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      prismaService.integration.findUnique.mockResolvedValue(integration)

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

      const data = 'ok'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      await service.addSubscriber(
        'journeyId',
        block,
        'john',
        'johndoe@example.com'
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.growthspaces.org/api/v1/subscribers',
        {
          body: '{"subscriber":{"route_id":"routeId","language_code":"en","email":"johndoe@example.com","first_name":"john"}}',
          headers: {
            'Access-Id': 'accessId',
            'Access-Secret': 'plaintext',
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      )
    })
  })

  describe('create', () => {
    it('should create growth spaces integration', async () => {
      const data = 'ok'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const input = { accessId: 'accessId', accessSecret: 'accessSecret' }

      await service.create('teamId', input)
      expect(prismaService.integration.create).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
          teamId: 'teamId',
          type: 'growthSpaces',
          accessSecretCipherText: expect.any(String),
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String)
        }
      })
    })
  })

  describe('update', () => {
    it('should update growth spaces integration', async () => {
      const data = 'ok'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const input = { accessId: 'accessId', accessSecret: 'accessSecret' }

      await service.update('integrationId', input)
      expect(prismaService.integration.update).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
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
