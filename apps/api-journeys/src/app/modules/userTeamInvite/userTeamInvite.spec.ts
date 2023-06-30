import { Test, TestingModule } from '@nestjs/testing'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { ForbiddenError } from 'apollo-server-errors'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { UserTeamRole } from '../../__generated__/graphql'
import { TeamResolver } from './userTeamInvite.resolver'

describe('UserTeamInviteResolver', () => {
  let userTeamInviteResolver: TeamResolver, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [TeamResolver, PrismaService]
    }).compile()

    userTeamInviteResolver = module.get<TeamResolver>(TeamResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.userTeamInvite.findMany = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'userTeamId' }])
  })

  describe('userTeamInvites', () => {
    it('fetches accessible userTeamInvites', async () => {
      const userTeams = await userTeamInviteResolver.userTeamInvites(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId'
      )
      expect(prismaService.userTeamInvite.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              team: {
                is: {
                  userTeams: { some: { userId: 'userId' } }
                }
              }
            },
            { teamId: 'teamId' }
          ]
        }
      })
      expect(userTeams).toEqual([{ id: 'userTeamId' }])
    })
  })

  describe('userTeamInviteCreate', () => {
    it('creates a user team invite', async () => {
      const team = {
        id: 'teamId',
        userTeams: [
          {
            userId: 'userId',
            role: UserTeamRole.manager
          }
        ]
      }
      const input = {
        email: 'siyangthemanthestan@gmail.com'
      }
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })

      prismaService.team.findUnique = jest.fn().mockResolvedValueOnce(team)
      prismaService.userTeamInvite.upsert = jest.fn()
      await userTeamInviteResolver.userTeamInviteCreate(
        ability,
        'userId',
        'teamId',
        input
      )

      expect(prismaService.userTeamInvite.upsert).toBeCalledWith({
        create: {
          email: 'siyangthemanthestan@gmail.com',
          senderId: 'userId',
          teamId: 'teamId'
        },
        update: { acceptedAt: null, removedAt: null, senderId: 'userId' },
        where: {
          teamId_email: {
            email: 'siyangthemanthestan@gmail.com',
            teamId: 'teamId'
          }
        }
      })
    })
  })

  describe('userTeamnInviteRemove', () => {
    it('should delete a userInvite', async () => {
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const id = 'userTeamInvite-id'
      prismaService.userTeamInvite.findUnique = jest.fn().mockReturnValue({
        id: 'userTeamInvite-id',
        removedAt: null,
        acceptedAt: null,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      })
      prismaService.userTeamInvite.update = jest.fn()
      await userTeamInviteResolver.userTeamInviteRemove(ability, id)
      await expect(prismaService.userTeamInvite.update).toBeCalledWith({
        data: { removedAt: expect.any(Date) },
        where: { id: 'userTeamInvite-id' }
      })
    })
    it('should throw a ForbiddenError when the user does not have the required permissions', async () => {
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      const userTeamInviteId = 'userTeamInviteId'
      prismaService.userTeamInvite.findUnique = jest.fn().mockReturnValue({
        id: 'userTeamInvite-id',
        removedAt: null,
        acceptedAt: null,
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.member
            }
          ]
        }
      })
      await expect(
        userTeamInviteResolver.userTeamInviteRemove(ability, userTeamInviteId)
      ).rejects.toThrow(ForbiddenError)
    })
  })
})
