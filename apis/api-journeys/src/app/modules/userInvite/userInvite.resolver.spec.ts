import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Journey, UserInvite, UserTeamRole } from '@core/prisma/journeys/client'

import { UserInviteCreateInput } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const userInvite: UserInvite = {
    id: 'userInviteId',
    removedAt: null,
    acceptedAt: null,
    email: 'bob.jones@example.com',
    senderId: 'senderId',
    journeyId: 'journeyId',
    updatedAt: new Date()
  }

  const journey = {
    team: {
      userTeams: [
        {
          userId: 'userId',
          role: UserTeamRole.manager
        }
      ]
    }
  } as unknown as Journey

  const userInviteWithUserTeam = {
    ...userInvite,
    journey
  }

  const userInviteService = {
    provide: UserInviteService,
    useFactory: () => ({
      sendEmail: jest.fn().mockResolvedValue(null)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        UserInviteResolver,
        userInviteService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<UserInviteResolver>(UserInviteResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('userInvites', () => {
    it('fetches accessible userInvites', async () => {
      prismaService.userInvite.findMany.mockResolvedValueOnce([
        { id: 'userInviteId' } as unknown as UserInvite
      ])
      const userTeams = await resolver.userInvites(
        {
          journey: {
            is: {
              team: {
                is: {
                  userTeams: { some: { userId: 'userId' } }
                }
              }
            }
          }
        },
        'journeyId'
      )
      expect(prismaService.userInvite.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              journey: {
                is: {
                  team: {
                    is: {
                      userTeams: { some: { userId: 'userId' } }
                    }
                  }
                }
              }
            },
            { journeyId: 'journeyId' }
          ]
        }
      })
      expect(userTeams).toEqual([{ id: 'userInviteId' }])
    })
  })

  describe('userInviteCreate', () => {
    const input: UserInviteCreateInput = {
      email: 'brian.smith@example.com'
    }

    const user = {
      id: 'userId',
      firstName: 'Joe',
      lastName: 'Smith',
      email: 'jsmith@example.com',
      emailVerified: true
    }

    it('creates a user team invite', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userInvite.upsert.mockResolvedValueOnce(
        userInviteWithUserTeam
      )
      await resolver.userInviteCreate(ability, user, 'journeyId', input)
      expect(prismaService.userInvite.upsert).toHaveBeenCalledWith({
        where: {
          journeyId_email: {
            journeyId: 'journeyId',
            email: input.email
          }
        },
        create: {
          email: 'brian.smith@example.com',
          senderId: 'userId',
          journey: { connect: { id: 'journeyId' } }
        },
        update: {
          acceptedAt: null,
          removedAt: null,
          senderId: 'userId'
        },
        include: {
          journey: {
            include: {
              primaryImageBlock: true,
              team: {
                include: { userTeams: true }
              },
              userJourneys: true
            }
          }
        }
      })
    })

    it('throws error if not authorized', async () => {
      prismaService.$transaction.mockImplementationOnce(
        async (cb) => await cb(prismaService)
      )
      prismaService.userInvite.upsert.mockResolvedValueOnce(userInvite)
      await expect(
        resolver.userInviteCreate(ability, user, 'journeyId', input)
      ).rejects.toThrow('user is not allowed to create userInvite')
    })
  })

  describe('userInviteRemove', () => {
    it('should delete a userInvite', async () => {
      prismaService.userInvite.findUnique.mockResolvedValue(
        userInviteWithUserTeam
      )
      await resolver.userInviteRemove(ability, 'userInviteId')
      await expect(prismaService.userInvite.update).toHaveBeenCalledWith({
        data: { acceptedAt: null, removedAt: expect.any(Date) },
        where: { id: 'userInviteId' }
      })
    })

    it('throws error if not found', async () => {
      prismaService.userInvite.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userInviteRemove(ability, 'userInviteId')
      ).rejects.toThrow('userInvite not found')
    })

    it('throws error if not authorized', async () => {
      const ability = await new AppCaslFactory().createAbility({
        id: 'userId'
      })
      prismaService.userInvite.findUnique.mockResolvedValue(userInvite)
      await expect(
        resolver.userInviteRemove(ability, 'userInviteId')
      ).rejects.toThrow('user is not allowed to remove userInvite')
    })
  })

  describe('userInviteAcceptAll', () => {
    it('should accept pending team invites for current user', async () => {
      const user = {
        id: 'userId',
        firstName: 'Robert',
        email: 'robert.smith@example.com',
        emailVerified: true
      }
      const userInvite: UserInvite = {
        id: 'inviteId1',
        email: 'robert.smith@example.com',
        senderId: 'senderId1',
        journeyId: 'journeyId',
        acceptedAt: null,
        removedAt: null,
        updatedAt: new Date()
      }

      const redeemedUserInvite = {
        ...userInvite,
        acceptedAt: expect.any(Date),
        receipientId: user.id
      }

      prismaService.userInvite.findMany.mockResolvedValue([userInvite])
      prismaService.$transaction.mockImplementation(
        async (promises) => promises
      )
      prismaService.userInvite.update.mockResolvedValueOnce(redeemedUserInvite)
      expect(await resolver.userInviteAcceptAll(user)).toEqual([
        redeemedUserInvite
      ])
    })
  })
})
