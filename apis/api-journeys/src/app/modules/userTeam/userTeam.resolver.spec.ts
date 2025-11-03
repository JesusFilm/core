import { Test, TestingModule } from '@nestjs/testing'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { UserTeam, UserTeamRole } from '@core/prisma/journeys/client'

import { UserTeamRole as GraphQlUserTeamRole } from '../../__generated__/graphql'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamResolver } from './userTeam.resolver'
import { UserTeamService } from './userTeam.service'

describe('UserTeamResolver', () => {
  let userTeamResolver: UserTeamResolver, prismaService: PrismaService
  const userTeamService = {
    provide: UserTeamService,
    useFactory: () => ({
      sendTeamRemovedEmail: jest.fn().mockResolvedValue(null)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [UserTeamResolver, PrismaService, userTeamService]
    }).compile()
    userTeamResolver = module.get<UserTeamResolver>(UserTeamResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.userTeam.findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'userTeamId' }])
  })

  describe('userTeams', () => {
    it('fetches accessible userTeams with filter', async () => {
      const userTeams = await userTeamResolver.userTeams(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId',
        { role: [GraphQlUserTeamRole.member, GraphQlUserTeamRole.manager] }
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
            { teamId: 'teamId', role: { in: ['member', 'manager'] } }
          ]
        }
      })
      expect(userTeams).toEqual([{ id: 'userTeamId' }])
    })

    it('should not apply role filter if filter is empty object', async () => {
      const userTeams = await userTeamResolver.userTeams(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId',
        {}
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

    it('fetches accessible userTeams', async () => {
      const userTeams = await userTeamResolver.userTeams(
        {
          team: {
            is: {
              userTeams: { some: { userId: 'userId' } }
            }
          }
        },
        'teamId'
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
          role: GraphQlUserTeamRole.manager
        })
      ).resolves.toEqual(userTeam)
      expect(prismaService.userTeam.update).toHaveBeenCalledWith({
        where: { id: 'userTeamId' },
        data: {
          role: 'manager'
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
          role: GraphQlUserTeamRole.manager
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
          role: GraphQlUserTeamRole.manager
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

  describe('journeyNotification', () => {
    it('returns associated journeyNotification', async () => {
      const userTeam = {
        id: 'userTeamId',
        journeyNotifications: [
          {
            id: 'journeyNotification',
            userId: 'userId',
            journeyId: 'journeyId',
            userTeamId: null,
            userJourneyId: 'userJourneyId',
            visitorInteractionEmail: false
          }
        ]
      }

      const journeyNotifications = jest
        .fn()
        .mockResolvedValue(userTeam.journeyNotifications)

      prismaService.userTeam.findUnique = jest
        .fn()
        .mockReturnValue({ ...userTeam, journeyNotifications })
      await expect(
        userTeamResolver.journeyNotifications(
          userTeam as unknown as UserTeam,
          'journeyId'
        )
      ).resolves.toEqual({
        id: 'journeyNotification',
        journeyId: 'journeyId',
        userId: 'userId',
        userJourneyId: 'userJourneyId',
        userTeamId: null,
        visitorInteractionEmail: false
      })
      expect(journeyNotifications).toHaveBeenCalledWith({
        where: {
          journeyId: 'journeyId'
        }
      })
    })
  })
})
