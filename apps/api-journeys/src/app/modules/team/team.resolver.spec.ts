import { Test, TestingModule } from '@nestjs/testing'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { UserTeamRole } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { TeamResolver } from './team.resolver'

describe('TeamResolver', () => {
  let teamResolver: TeamResolver, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [TeamResolver, PrismaService]
    }).compile()
    teamResolver = module.get<TeamResolver>(TeamResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.team.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'teamId' }])
  })
  describe('teams', () => {
    it('fetches accessible teams', async () => {
      const teams = await teamResolver.teams({
        userTeams: { some: { userId: 'userId' } }
      })
      expect(prismaService.team.findMany).toHaveBeenCalledWith({
        where: {
          userTeams: { some: { userId: 'userId' } }
        }
      })
      expect(teams).toEqual([{ id: 'teamId' }])
    })
  })

  describe('team', () => {
    it('fetches team', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.member
          }
        ]
      }
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({ id: 'userId' })
      await expect(teamResolver.team(ability, 'teamId')).resolves.toEqual(team)
    })

    it('throws forbidden error if user is not allowed to view team', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.member
          }
        ]
      }
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId2'
      })
      await expect(teamResolver.team(ability, 'teamId')).rejects.toThrow(
        'user is not allowed to view team'
      )
    })

    it('throws not found error if team is not found', async () => {
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(null)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(teamResolver.team(ability, 'teamId')).rejects.toThrow(
        'team not found'
      )
    })
  })

  describe('teamCreate', () => {
    it('creates team with userTeam', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.manager
          }
        ]
      }
      prismaService.team.create = jest.fn().mockResolvedValue(team)
      await expect(
        teamResolver.teamCreate('userId', { name: 'team' })
      ).resolves.toEqual(team)
      expect(prismaService.team.create).toHaveBeenCalledWith({
        data: {
          name: 'team',
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
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.manager
          }
        ]
      }
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(team)
      prismaService.team.update = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        teamResolver.teamUpdate(ability, 'teamId', { name: 'team' })
      ).resolves.toEqual(team)
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 'teamId' },
        data: {
          name: 'team'
        }
      })
    })

    it('throws forbidden error if user is not allowed to update team', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.member
          }
        ]
      }
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId2'
      })
      await expect(
        teamResolver.teamUpdate(ability, 'teamId', { name: 'team' })
      ).rejects.toThrow('user is not allowed to update team')
    })

    it('throws not found error if team is not found', async () => {
      prismaService.team.findFirstOrThrow = jest.fn().mockResolvedValue(null)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        teamResolver.teamUpdate(ability, 'teamId', { name: 'team' })
      ).rejects.toThrow('team not found')
    })
  })
})
