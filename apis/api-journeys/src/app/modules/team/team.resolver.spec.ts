import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  CustomDomain,
  Prisma,
  Team,
  UserTeam,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { TeamResolver } from './team.resolver'

describe('TeamResolver', () => {
  let resolver: TeamResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const team = {
    id: 'teamId'
  } as unknown as Team
  const teamWithUserTeam = {
    ...team,
    userTeams: [{ userId: 'userId', role: UserTeamRole.manager }]
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        TeamResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<TeamResolver>(TeamResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('teams', () => {
    it('fetches accessible teams', async () => {
      prismaService.team.findMany.mockResolvedValue([team])
      const teams = await resolver.teams({
        OR: [{}]
      })
      expect(prismaService.team.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [{}] }]
        },
        include: { customDomains: { select: { id: true } } }
      })
      expect(teams).toEqual([team])
    })
  })

  describe('team', () => {
    it('fetches team', async () => {
      prismaService.team.findUnique.mockResolvedValue(teamWithUserTeam)
      await expect(resolver.team(ability, 'teamId')).resolves.toEqual(
        teamWithUserTeam
      )
    })

    it('throws forbidden error if user is not allowed to view team', async () => {
      prismaService.team.findUnique.mockResolvedValue(team)
      await expect(resolver.team(ability, 'teamId')).rejects.toThrow(
        'user is not allowed to view team'
      )
    })

    it('throws not found error if team is not found', async () => {
      prismaService.team.findUnique.mockResolvedValue(null)
      await expect(resolver.team(ability, 'teamId')).rejects.toThrow(
        'team not found'
      )
    })
  })

  describe('teamCreate', () => {
    it('creates team with userTeam', async () => {
      prismaService.team.create.mockResolvedValue(team)
      await expect(
        resolver.teamCreate('userId', {
          name: 'team',
          publicName: 'public team name'
        })
      ).resolves.toEqual(team)
      expect(prismaService.team.create).toHaveBeenCalledWith({
        data: {
          name: 'team',
          publicName: 'public team name',
          userTeams: {
            create: {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          }
        }
      })
    })
  })

  describe('teamUpdate', () => {
    it('updates team', async () => {
      prismaService.team.findUnique.mockResolvedValue(teamWithUserTeam)
      prismaService.team.update.mockResolvedValue(teamWithUserTeam)
      await expect(
        resolver.teamUpdate(ability, 'teamId', {
          name: 'team',
          publicName: 'public team name'
        })
      ).resolves.toEqual(teamWithUserTeam)
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 'teamId' },
        data: {
          name: 'team',
          publicName: 'public team name'
        }
      })
    })

    it('throws forbidden error if user is not allowed to update team', async () => {
      prismaService.team.findUnique.mockResolvedValue(team)
      await expect(
        resolver.teamUpdate(ability, 'teamId', { name: 'team' })
      ).rejects.toThrow('user is not allowed to update team')
    })

    it('throws not found error if team is not found', async () => {
      prismaService.team.findUnique.mockResolvedValue(null)
      await expect(
        resolver.teamUpdate(ability, 'teamId', { name: 'team' })
      ).rejects.toThrow('team not found')
    })
  })

  describe('userTeams', () => {
    const team = {
      id: 'teamId',
      userTeams: [
        {
          userId: 'userId',
          role: UserTeamRole.manager,
          teamId: 'teamId',
          team: {
            id: 'teamId',
            userTeams: [
              {
                id: 'userTeamId',
                userId: 'userId',
                role: UserTeamRole.manager
              }
            ]
          }
        }
      ]
    } as unknown as Team & { userTeams: UserTeam[] }

    const teamWithNoUserTeam = {
      id: 'teamId'
    } as unknown as Team

    it('returns userTeams of parent', async () => {
      const userTeams = jest.fn().mockResolvedValue(team.userTeams)
      prismaService.team.findUnique.mockReturnValue({
        ...team,
        userTeams
      } as unknown as Prisma.Prisma__TeamClient<Team>)
      expect(await resolver.userTeams(team, ability)).toEqual(team.userTeams)
    })

    it('returns userTeams from database', async () => {
      const userTeams = jest.fn().mockResolvedValue(team.userTeams)
      prismaService.team.findUnique.mockReturnValue({
        ...team,
        userTeams
      } as unknown as Prisma.Prisma__TeamClient<Team>)
      await expect(
        resolver.userTeams({ ...teamWithNoUserTeam }, ability)
      ).resolves.toEqual(team.userTeams)
    })

    it('returns empty userTeams array when null', async () => {
      const userTeams = jest.fn().mockResolvedValue(null)
      prismaService.team.findUnique.mockReturnValue({
        ...team,
        userTeams
      } as unknown as Prisma.Prisma__TeamClient<Team>)
      await expect(
        resolver.userTeams({ ...teamWithNoUserTeam }, ability)
      ).resolves.toEqual([])
    })

    it('returns empty userTeams array when ability is undefined', async () => {
      expect(await resolver.userTeams(team, undefined)).toEqual([])
    })
  })

  describe('customDomains', () => {
    it('returns customDomain links of parent', async () => {
      const customDomainsSpy = jest.spyOn(
        prismaService.customDomain,
        'findMany'
      )
      customDomainsSpy.mockResolvedValue([
        { id: 'id' } as unknown as CustomDomain
      ])

      expect(
        await resolver.customDomains({
          ...team,
          customDomains: [{ id: 'id' }]
        })
      ).toEqual([{ id: 'id' }])
    })
  })

  describe('integrations', () => {
    it('Should return integrations of team', async () => {
      const teamWithIntegrations = {
        ...team,
        integrations: {
          id: 'integrationId',
          teamId: 'teamId',
          type: 'growthSpaces'
        }
      }

      const integrations = jest
        .fn()
        .mockResolvedValue(teamWithIntegrations.integrations)

      prismaService.team.findUnique.mockReturnValue({
        ...teamWithIntegrations,
        integrations
      } as unknown as Prisma.Prisma__TeamClient<Team>)
      await expect(
        resolver.integrations(teamWithIntegrations)
      ).resolves.toEqual(teamWithIntegrations.integrations)
    })
  })

  describe('resolveReference', () => {
    it('fetches team by id', async () => {
      prismaService.team.findUnique.mockResolvedValue(team)
      await expect(
        resolver.resolveReference({ __typename: 'Team', id: 'teamId' })
      ).resolves.toEqual(team)
    })

    it('returns null if team is not found', async () => {
      prismaService.team.findUnique.mockResolvedValue(null)
      await expect(
        resolver.resolveReference({ __typename: 'Team', id: 'teamId' })
      ).resolves.toBeNull()
    })
  })
})
