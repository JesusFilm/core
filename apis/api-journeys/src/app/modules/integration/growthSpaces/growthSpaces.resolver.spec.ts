import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Integration, Prisma, Team } from '@core/prisma/journeys/client'

import { IntegrationGrowthSpacesCreateInput } from '../../../../__generated__/graphql'
import {
  IntegrationGrowthSpacesRoute,
  UserTeamRole
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationGrowthSpacesResolver } from './growthSpaces.resolver'
import { IntegrationGrowthSpacesService } from './growthSpaces.service'

jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockAxios = axios as jest.MockedFunction<typeof axios>
let mockAxiosGet: jest.Mock
let mockAxiosPost: jest.Mock

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

const teamWithUserTeam: Team = {
  id: 'teamId',
  userTeams: [{ id: 'userTeamId', userId: 'userId', role: UserTeamRole.member }]
} as unknown as Team

const integrationWithTeam: Integration = {
  ...integration,
  team: teamWithUserTeam
} as unknown as Integration

describe('IntegrationGrowthSpaceResolver', () => {
  const OLD_ENV = process.env

  let prismaService: DeepMockProxy<PrismaService>,
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
    resolver = await module.resolve(IntegrationGrowthSpacesResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => await callback(prismaService))

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
    process.env = OLD_ENV
  })

  describe('integrationGrowthSpacesCreate', () => {
    const input: IntegrationGrowthSpacesCreateInput = {
      accessId: 'accessId',
      accessSecret: 'accessSecret',
      teamId: 'teamId'
    }

    it('should create a growth spaces integration', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiscryptokeyitisactuallyfake='

      prismaService.integration.create.mockResolvedValue(integrationWithTeam)
      await resolver.integrationGrowthSpacesCreate(input, ability)
      expect(prismaService.integration.create).toHaveBeenCalledWith({
        data: {
          accessId: 'accessId',
          accessSecretPart: input.accessSecret.slice(0, 6),
          accessSecretCipherText: expect.any(String),
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String),
          teamId: 'teamId',
          type: 'growthSpaces'
        },
        include: {
          team: {
            include: {
              userTeams: true
            }
          }
        }
      })
    })

    it('should throw error if user is not allowed to create', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiscryptokeyitisactuallyfake='

      const teamWithOtherUser = {
        ...teamWithUserTeam,
        userTeams: [
          {
            id: 'userTeamId',
            userId: 'different user',
            role: UserTeamRole.member
          }
        ]
      }

      const integrationWithOtherTeam: Integration = {
        ...integration,
        team: teamWithOtherUser
      } as unknown as Integration

      prismaService.integration.create.mockResolvedValue(
        integrationWithOtherTeam
      )
      await expect(
        resolver.integrationGrowthSpacesCreate(input, ability)
      ).rejects.toThrow('user is not allowed to create integration')
    })

    it('should throw error if authentication fails', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      prismaService.integration.create.mockResolvedValue(integrationWithTeam)

      mockAxiosGet.mockRejectedValueOnce(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: 401
        } as unknown as AxiosResponse<unknown, unknown>)
      )

      await expect(
        resolver.integrationGrowthSpacesCreate(input, ability)
      ).rejects.toThrow('invalid credentials for Growth Spaces integration')
    })

    it('should throw error if growth spaces call fails', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      prismaService.integration.create.mockResolvedValue(integrationWithTeam)

      mockAxiosGet.mockRejectedValueOnce({})

      await expect(
        resolver.integrationGrowthSpacesCreate(input, ability)
      ).rejects.toThrow()
    })

    it('should throw error if encryption fails', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        undefined as unknown as string
      prismaService.integration.create.mockResolvedValue(integrationWithTeam)
      await expect(
        resolver.integrationGrowthSpacesCreate(input, ability)
      ).rejects.toThrow('no crypto key')
    })
  })

  describe('integrationGrowthSpacesUpdate', () => {
    it('should throw error if authentication fails', async () => {
      prismaService.integration.findUnique.mockResolvedValue(
        integrationWithTeam
      )

      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockAxiosGet.mockRejectedValueOnce(
        new AxiosError(undefined, undefined, undefined, undefined, {
          status: 401
        } as unknown as AxiosResponse<unknown, unknown>)
      )

      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
      ).rejects.toThrow('invalid credentials for Growth Spaces integration')
    })

    it('should throw error if api call fails', async () => {
      prismaService.integration.findUnique.mockResolvedValue(
        integrationWithTeam
      )

      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      mockAxiosGet.mockRejectedValueOnce({})

      await expect(
        resolver.integrationGrowthSpacesUpdate(
          'integrationId',
          {
            accessId: 'accessId',
            accessSecret: 'accessSecret'
          },
          ability
        )
      ).rejects.toThrow()
    })

    it('should throw error if encryption fails', async () => {
      prismaService.integration.findUnique.mockResolvedValue(
        integrationWithTeam
      )
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        undefined as unknown as string

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
        ...integrationWithTeam,
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
          accessSecretPart: 'access',
          accessSecretIv: expect.any(String),
          accessSecretTag: expect.any(String)
        },
        where: {
          id: 'integrationId'
        }
      })
    })
  })

  describe('routes', () => {
    it('should return routes', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      const data: IntegrationGrowthSpacesRoute[] = [
        { __typename: 'IntegrationGrowthSpacesRoute', id: '1', name: 'route' }
      ]

      mockAxiosGet.mockResolvedValueOnce({ data })

      const res = await resolver.routes(integration)
      expect(res).toEqual(data)
    })

    it('should throw error if fetch response is not 200', async () => {
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET =
        'dontbefooledbythiskryptokeyitisactuallyfake='

      await expect(resolver.routes(integration)).rejects.toThrow()
    })
  })

  describe('team', () => {
    it('should return team', async () => {
      const integration = {
        id: 'integrationId',
        team: {
          id: 'teamId'
        }
      }

      const team = jest.fn().mockResolvedValue(integration.team)

      prismaService.integration.findUnique.mockReturnValue({
        ...integration,
        team
      } as unknown as Prisma.Prisma__IntegrationClient<Integration>)

      const res = await resolver.team(integration as unknown as Integration)
      expect(res).toEqual(integration.team)
    })
  })
})
