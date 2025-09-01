import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  Team,
  UserTeamInvite,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { UserTeamInviteCreateInput } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamInviteResolver } from './userTeamInvite.resolver'
import { UserTeamInviteService } from './userTeamInvite.service'

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

  const mockSendTeamInviteEmail = jest.fn().mockResolvedValue(null)
  const mockSendTeamInviteAcceptedEmail = jest.fn().mockResolvedValue(null)

  const userTeamInviteService = {
    provide: UserTeamInviteService,
    useFactory: () => ({
      sendTeamInviteEmail: mockSendTeamInviteEmail,
      sendTeamInviteAcceptedEmail: mockSendTeamInviteAcceptedEmail
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        UserTeamInviteResolver,
        userTeamInviteService,
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

    // Reset mocks before each test
    mockSendTeamInviteEmail.mockClear()
    mockSendTeamInviteAcceptedEmail.mockClear()
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

    const user = {
      id: 'userId',
      firstName: 'Robert',
      lastName: 'Smith',
      email: 'robert.smith@example.com',
      emailVerified: true
    }

    it('creates a user team invite', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userTeamInvite.upsert.mockResolvedValueOnce(
        userTeamInviteWithUserTeam
      )

      await resolver.userTeamInviteCreate(ability, user, 'teamId', input)
      expect(prismaService.userTeamInvite.upsert).toHaveBeenCalledWith({
        where: {
          teamId_email: {
            teamId: 'teamId',
            email: input.email
          }
        },
        create: {
          email: 'brian.smith@example.com',
          senderId: user.id,
          team: { connect: { id: 'teamId' } }
        },
        update: {
          acceptedAt: null,
          receipientId: null,
          removedAt: null,
          senderId: user.id
        },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      // Verify that sendTeamInviteEmail service method is called with sender including id
      expect(mockSendTeamInviteEmail).toHaveBeenCalledWith(
        team,
        input.email,
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          imageUrl: undefined
        }
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userTeamInvite.upsert.mockResolvedValueOnce(userTeamInvite)
      await expect(
        resolver.userTeamInviteCreate(ability, user, 'teamId', input)
      ).rejects.toThrow('user is not allowed to create userTeamInvite')
    })
  })

  describe('userTeamInviteRemove', () => {
    it('should delete a userInvite', async () => {
      prismaService.userTeamInvite.findUnique.mockResolvedValue(
        userTeamInviteWithUserTeam
      )
      await resolver.userTeamInviteRemove(ability, 'userTeamInviteId')
      await expect(prismaService.userTeamInvite.update).toHaveBeenCalledWith({
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
        email: 'robert.smith@example.com',
        emailVerified: true
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

      const userTeamInviteWithTeam = {
        ...userTeamInvite,
        acceptedAt: expect.any(Date),
        receipientId: user.id
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
        userTeamInviteWithTeam
      )
      expect(await resolver.userTeamInviteAcceptAll(user)).toEqual([
        redeemedUserTeamInvite
      ])
    })
  })
})
