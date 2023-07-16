import { Test, TestingModule } from '@nestjs/testing'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { UserTeamRole, UserTeam } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { UserTeamRole as GraphQlUserTeamRole } from '../../__generated__/graphql'
import { UserTeamResolver } from './userTeam.resolver'

describe('UserTeamResolver', () => {
  let userTeamResolver: UserTeamResolver, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [UserTeamResolver, PrismaService]
    }).compile()
    userTeamResolver = module.get<UserTeamResolver>(UserTeamResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.userTeam.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'userTeamId' }])
  })
  describe('userTeams', () => {
    it('fetches accessible userTeams without guests', async () => {
      const userTeams = await userTeamResolver.userTeams(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId',
        false
      )
      expect(prismaService.userTeam.findMany).toHaveBeenCalledWith({
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
          ],
          role: {
            not: 'guest'
          }
        }
      })
      expect(userTeams).toEqual([{ id: 'userTeamId' }])
    })
    it('fetches accessible userTeams with guests', async () => {
      const userTeams = await userTeamResolver.userTeams(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId',
        true
      )
      expect(prismaService.userTeam.findMany).toHaveBeenCalledWith({
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

  describe('userTeam', () => {
    it('fetches userTeam', async () => {
      const userTeam = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.member
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(userTeam)
      const ability = await new AppCaslFactory().createAbility({ id: 'userId' })
      await expect(
        userTeamResolver.userTeam(ability, 'userTeamId')
      ).resolves.toEqual(userTeam)
    })

    it('throws forbidden error if user is not allowed to view userTeam', async () => {
      const userTeam = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.member
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(userTeam)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId2'
      })
      await expect(
        userTeamResolver.userTeam(ability, 'userTeamId')
      ).rejects.toThrow('user is not allowed to view userTeam')
    })

    it('throws not found error if userTeam is not found', async () => {
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(null)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        userTeamResolver.userTeam(ability, 'teamId')
      ).rejects.toThrow('userTeam not found')
    })
  })
  describe('userTeamUpdate', () => {
    it('updates userTeam', async () => {
      const userTeam = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(userTeam)
      prismaService.userTeam.update = jest.fn().mockResolvedValue(userTeam)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        userTeamResolver.userTeamUpdate(ability, 'userTeamId', {
          role: GraphQlUserTeamRole.guest
        })
      ).resolves.toEqual(userTeam)
      expect(prismaService.userTeam.update).toHaveBeenCalledWith({
        where: { id: 'userTeamId' },
        data: {
          role: 'guest'
        }
      })
    })

    it('throws forbidden error if user is not allowed to update userTeam', async () => {
      const team = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.member
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId2'
      })
      await expect(
        userTeamResolver.userTeamUpdate(ability, 'userTeamId', {
          role: GraphQlUserTeamRole.guest
        })
      ).rejects.toThrow('user is not allowed to update userTeam')
    })

    it('throws not found error if userTeam is not found', async () => {
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(null)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        userTeamResolver.userTeamUpdate(ability, 'userTeamId', {
          role: GraphQlUserTeamRole.guest
        })
      ).rejects.toThrow('userTeam not found')
    })
  })

  describe('userTeamDelete', () => {
    it('deletes userTeam', async () => {
      const userTeam = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.manager
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(userTeam)
      prismaService.userTeam.delete = jest.fn().mockResolvedValue(userTeam)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        userTeamResolver.userTeamDelete(ability, 'userTeamId')
      ).resolves.toEqual(userTeam)
      expect(prismaService.userTeam.delete).toHaveBeenCalledWith({
        where: { id: 'userTeamId' }
      })
    })

    it('throws forbidden error if user is not allowed to delete userTeam', async () => {
      const team = {
        id: 'userTeamId',
        team: {
          userTeams: [
            {
              userId: 'userId',
              role: UserTeamRole.member
            }
          ]
        }
      }
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(team)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId2'
      })
      await expect(
        userTeamResolver.userTeamDelete(ability, 'userTeamId')
      ).rejects.toThrow('user is not allowed to delete userTeam')
    })

    it('throws not found error if userTeam is not found', async () => {
      prismaService.userTeam.findUnique = jest.fn().mockResolvedValue(null)
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      await expect(
        userTeamResolver.userTeamDelete(ability, 'userTeamId')
      ).rejects.toThrow('userTeam not found')
    })
  })

  describe('user', () => {
    it('returns a reference to resolve', async () => {
      await expect(
        userTeamResolver.user({
          userId: 'userId'
        } as unknown as UserTeam)
      ).resolves.toEqual({
        __typename: 'User',
        id: 'userId'
      })
    })
  })
})
