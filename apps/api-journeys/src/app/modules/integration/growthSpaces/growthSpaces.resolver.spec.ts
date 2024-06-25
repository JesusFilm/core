import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
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
        'dontbefooledbythiscryptokeyitisactuallyfake='

      mockFetch.mockRejectedValue({
        ok: true,
        status: 200,
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
})
