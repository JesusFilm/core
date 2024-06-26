import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
import {
  IntegrationGrowthSpacesRoute,
  UserTeamRole
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationGrowthSpacesResolver } from './growthSpaces.resolver'
import { IntegrationGrowthSpacesService } from './growthSpaces.service'
import { Integration, Team } from '.prisma/api-journeys-client'

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
  accessSecretPart: 'plaint',
  // decrypted value for accessSecretCipherText should be "plaintext"
  accessSecretCipherText: 'saeRCBy44pMT',
  accessSecretIv: 'dx+2iBr7yYvilLIC',
  accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
}

describe('IntegrationGrowthSpaceResolver', () => {
  const OLD_ENV = process.env

  let integrationGrowthSpacesService: IntegrationGrowthSpacesService,
    prismaService: DeepMockProxy<PrismaService>,
    resolver: IntegrationGrowthSpacesResolver,
    ability: AppAbility

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        CaslAuthModule.register(AppCaslFactory)
      ],
      providers: [
        IntegrationGrowthSpacesResolver,
        IntegrationGrowthSpacesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    integrationGrowthSpacesService = await module.resolve(
      IntegrationGrowthSpacesService
    )
    resolver = await module.resolve(IntegrationGrowthSpacesResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })

    process.env = { ...OLD_ENV }
    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation((callback) => callback(prismaService))
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = OLD_ENV
  })

  describe('integrationGrowthSpacesCreate', () => {
    it('should create a growth spaces integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiscryptokeyitisactuallyfake='

      prismaService.team.findUnique.mockResolvedValue({
        id: 'teamId',
        userTeams: [
          { id: 'userTeamId', userId: 'userId', role: UserTeamRole.manager }
        ]
      } as unknown as Team)

      const data = 'ok'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      prismaService.integration.create.mockResolvedValue(integration)
      await resolver.integrationGrowthSpacesCreate(
        {
          accessId: 'accessId',
          accessSecret: 'accessSecret',
          teamId: 'teamId'
        },
        ability
      )
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

      prismaService.team.findUnique.mockResolvedValue({
        id: 'teamId',
        userTeams: [
          { id: 'userTeamId', userId: 'userId', role: UserTeamRole.member }
        ]
      } as unknown as Team)

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      await expect(
        resolver.integrationGrowthSpacesCreate(
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret',
            teamId: 'teamId'
          },
          ability
        )
      ).rejects.toThrow(
        'incorrect access Id and access secret for Growth Space integration'
      )
    })

    it('should throw error if team not found', async () => {
      await expect(
        resolver.integrationGrowthSpacesCreate(
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret',
            teamId: 'teamId'
          },
          ability
        )
      ).rejects.toThrow('team not found')
    })

    it('should throw error if user is not in team', async () => {
      prismaService.team.findUnique.mockResolvedValue({
        userTeams: [
          {
            id: 'userTeamId',
            userId: 'user id not in team',
            role: UserTeamRole.member,
            teamId: 'teamId'
          }
        ]
      } as unknown as Team)
      await expect(
        resolver.integrationGrowthSpacesCreate(
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret',
            teamId: 'teamId'
          },
          ability
        )
      ).rejects.toThrow('user is not allowed to create integration')
    })

    it('should throw error if encryption fails', async () => {
      const data = 'ok'
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve(data)
      } as unknown as Response)

      prismaService.team.findUnique.mockResolvedValue({
        id: 'teamId',
        userTeams: [
          { id: 'userTeamId', userId: 'userId', role: UserTeamRole.manager }
        ]
      } as unknown as Team)

      await expect(
        resolver.integrationGrowthSpacesCreate(
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret',
            teamId: 'teamId'
          },
          ability
        )
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

      prismaService.integration.findUnique.mockResolvedValue({
        id: 'integrationId',
        team: {
          id: 'teamId',
          userTeams: [
            { id: 'userTeamId', userId: 'userId', role: UserTeamRole.manager }
          ]
        }
      } as unknown as Integration)

      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
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

      prismaService.integration.findUnique.mockResolvedValue({
        id: 'integrationId',
        team: {
          id: 'teamId',
          userTeams: [
            { id: 'userTeamId', userId: 'userId', role: UserTeamRole.manager }
          ]
        }
      } as unknown as Integration)

      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
      ).rejects.toThrow('no crypto key')
    })

    it('should throw error if integration can not be found', async () => {
      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
      ).rejects.toThrow('integration not found')
    })

    it('should throw error if user is not in the team', async () => {
      prismaService.integration.findUnique.mockResolvedValue({
        id: 'integrationId',
        team: {
          id: 'teamId',
          userTeams: [
            {
              id: 'userTeamId',
              userId: 'user id not in the team',
              role: UserTeamRole.manager
            }
          ]
        }
      } as unknown as Integration)
      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
      ).rejects.toThrow('user is not allowed to update integration')
    })

    it('should update integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => await Promise.resolve()
      } as unknown as Response)

      prismaService.integration.findUnique.mockResolvedValue({
        id: 'integrationId',
        team: {
          id: 'teamId',
          userTeams: [
            { id: 'userTeamId', userId: 'userId', role: UserTeamRole.manager }
          ]
        }
      } as unknown as Integration)

      await resolver.integrationGrowthSpacesUpdate(
        'integrationId',
        {
          accessId: 'accessId',
          accessSecret: 'accessSecret'
        },
        ability
      )

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

      const data: IntegrationGrowthSpacesRoute[] = [
        { __typename: 'IntegrationGrowthSpacesRoute', id: '1', name: 'route' }
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
