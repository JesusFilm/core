import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
import { GrowthSpacesRoute } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationService } from '../integration.service'
import { IntegrationGrowthSpaceResolver } from './growthSpaces.resolver'
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

jest.mock('@apollo/client')

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

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

describe('IntegrationGrowthSpaceResolver', () => {
  const OLD_ENV = process.env

  let growthSpacesService: IntegrationGrothSpacesService,
    prismaService: DeepMockProxy<PrismaService>,
    integrationService: IntegrationService,
    resolver: IntegrationGrowthSpaceResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        IntegrationGrowthSpaceResolver,
        IntegrationService,
        IntegrationGrothSpacesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    integrationService = module.get<IntegrationService>(IntegrationService)
    growthSpacesService = await module.resolve(IntegrationGrothSpacesService)
    resolver = await module.resolve(IntegrationGrowthSpaceResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>

    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = OLD_ENV
  })

  describe('integrationGrowthSpacesCreate', () => {
    it('should create a growth spaces integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiscryptokeyitisactuallyfake='
      const data = 'ok'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      prismaService.integration.create.mockResolvedValue(integration)
      await resolver.integrationGrowthSpacesCreate('teamId', {
        accessId: 'accessId',
        accessSecret: 'accessSecret'
      })
      expect(prismaService.integration.create).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
          accessSecretCipherText: expect.any(String),
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String),
          teamId: 'teamId',
          type: 'growthSpaces'
        }
      })
    })

    it('should throw error if authentication fails', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await expect(
        resolver.integrationGrowthSpacesCreate('teamId', {
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })

    it('should throw error if encryption fails', async () => {
      const data = 'ok'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      await expect(
        resolver.integrationGrowthSpacesCreate('teamId', {
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow('no crypto key')
    })
  })

  describe('integrationGrowthSpacesUpdate', () => {
    it('should throw error if authentication fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await expect(
        resolver.integrationGrowthSpacesUpdate('integrationId', {
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })

    it('should throw error if encryption fails', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await expect(
        resolver.integrationGrowthSpacesUpdate('integrationId', {
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        })
      ).rejects.toThrow('no crypto key')
    })

    it('should update integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await resolver.integrationGrowthSpacesUpdate('integrationId', {
        accessId: 'accessId',
        accessSecret: 'accessSecret'
      })

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

  describe('accessSecretPart', () => {
    it('should return accessSecretPart', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      const res = await resolver.accessSecretPart(integration)
      expect(res).toEqual('plaint')
    })

    it('should throw error if crypto variables missing', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      await expect(
        resolver.accessSecretPart({
          ...integration,
          accessId: null,
          accessSecretCipherText: null
        })
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })
  })

  describe('routes', () => {
    it('should return routes', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const data: GrowthSpacesRoute[] = [
        { __typename: 'GrowthSpacesRoute', id: '1', name: 'route' }
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      const res = await resolver.routes(integration)
      expect(res).toEqual(data)
    })

    it('should throw error if fetch response is not 200', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await expect(resolver.routes(integration)).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })

    it('should throw error if crypto variables missing', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      await expect(
        resolver.routes({
          ...integration,
          accessId: null,
          accessSecretCipherText: null
        })
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })
  })
})
