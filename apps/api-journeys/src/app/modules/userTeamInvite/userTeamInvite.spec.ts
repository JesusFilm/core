import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Team, UserTeamInvite, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { UserTeamInviteCreateInput } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamInviteResolver } from './userTeamInvite.resolver'

describe('UserTeamInviteResolver', () => {
  let resolver: UserTeamInviteResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const userTeamInvite: UserTeamInvite = {
    id: 'userTeamInviteId',
    removedAt: null,
    acceptedAt: null,
    email: 'bob.jones@example.com',
    senderId: 'senderId',
    receipientId: 'receipientId',
    teamId: 'teamId',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const team = {
    id: 'teamId',
    userTeams: [
      {
        userId: 'userId',
        role: UserTeamRole.manager
      }
    ]
  } as unknown as Team

  const userTeamInviteWithUserTeam = {
    ...userTeamInvite,
    team
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        UserTeamInviteResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<UserTeamInviteResolver>(UserTeamInviteResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('userTeamInvites', () => {
    it('fetches accessible userTeamInvites', async () => {
      prismaService.userTeamInvite.findMany.mockResolvedValueOnce([
        { id: 'userTeamId' } as unknown as UserTeamInvite
      ])
      const userTeams = await resolver.userTeamInvites(
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
    const input: UserTeamInviteCreateInput = {
      email: 'brian.smith@example.com'
    }
    it('creates a user team invite', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userTeamInvite.upsert.mockResolvedValueOnce(
        userTeamInviteWithUserTeam
      )
      await resolver.userTeamInviteCreate(ability, 'userId', 'teamId', input)
      expect(prismaService.userTeamInvite.upsert).toBeCalledWith({
        where: {
          teamId_email: {
            teamId: 'teamId',
            email: input.email
          }
        },
        create: {
          email: 'brian.smith@example.com',
          senderId: 'userId',
          team: { connect: { id: 'teamId' } }
        },
        update: {
          acceptedAt: null,
          receipientId: null,
          removedAt: null,
          senderId: 'userId'
        },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userTeamInvite.upsert.mockResolvedValueOnce(userTeamInvite)
      await expect(
        resolver.userTeamInviteCreate(ability, 'userId', 'teamId', input)
      ).rejects.toThrow('user is not allowed to create userTeamInvite')
    })
  })

  describe('userTeamInviteRemove', () => {
    it('should delete a userInvite', async () => {
      prismaService.userTeamInvite.findUnique.mockResolvedValue(
        userTeamInviteWithUserTeam
      )
      await resolver.userTeamInviteRemove(ability, 'userTeamInviteId')
      await expect(prismaService.userTeamInvite.update).toBeCalledWith({
        data: { removedAt: expect.any(Date) },
        where: { id: 'userTeamInviteId' }
      })
    })
    it('throws error if not found', async () => {
      prismaService.userTeamInvite.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userTeamInviteRemove(ability, 'userTeamInviteId')
      ).rejects.toThrow('userTeamInvite not found')
    })
    it('throws error if not authorized', async () => {
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      prismaService.userTeamInvite.findUnique.mockResolvedValue(userTeamInvite)
      await expect(
        resolver.userTeamInviteRemove(ability, 'userTeamInviteId')
      ).rejects.toThrow('user is not allowed to remove userTeamInvite')
    })
  })

  describe('userTeamInviteAcceptAll', () => {
    it('should accept pending team invites for current user', async () => {
      const user = {
        id: 'userId',
        firstName: 'Robert',
        email: 'robert.smith@example.com'
      }
      const userTeamInvite: UserTeamInvite = {
        id: 'inviteId1',
        teamId: 'teamId1',
        email: 'robert.smith@example.com',
        senderId: 'senderId1',
        receipientId: null,
        acceptedAt: null,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const redeemedUserTeamInvite = {
        ...userTeamInvite,
        acceptedAt: expect.any(Date),
        receipientId: user.id
      }

      prismaService.userTeamInvite.findMany.mockResolvedValue([userTeamInvite])
      prismaService.$transaction.mockImplementation(
        async (promises) => promises
      )
      prismaService.userTeamInvite.update.mockResolvedValueOnce(
        redeemedUserTeamInvite
      )
      expect(await resolver.userTeamInviteAcceptAll(user)).toEqual([
        redeemedUserTeamInvite
      ])
    })
  })
})
