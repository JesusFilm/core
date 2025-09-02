import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Journey, Prisma, UserJourney } from '@core/prisma/journeys/client'

import { UserJourneyRole } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyResolver, UserJourneyResolver } from './userJourney.resolver'
import { UserJourneyService } from './userJourney.service'

describe('UserJourneyResolver', () => {
  let resolver: UserJourneyResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility
  const userJourney = {
    id: 'userJourneyId',
    userId: 'userId',
    role: UserJourneyRole.inviteRequested
  } as unknown as UserJourney
  const userJourneyWithJourneyOwner = {
    id: 'userJourneyId',
    journey: {
      id: 'journeyId',
      userJourneys: [
        {
          userId: 'userId',
          role: UserJourneyRole.owner
        }
      ]
    }
  } as unknown as UserJourney

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      sendJourneyApproveEmail: jest.fn().mockResolvedValue(null),
      sendJourneyAccessRequest: jest.fn().mockResolvedValue(null)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        UserJourneyResolver,
        userJourneyService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: Queue,
          useValue: {
            add: jest.fn()
          }
        }
      ]
    }).compile()
    resolver = module.get<UserJourneyResolver>(UserJourneyResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('userJourneyRequest', () => {
    const user = {
      id: 'userId',
      firstName: 'John',
      email: 'jsmith@example.com',
      emailVerified: true
    }

    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (cb) => await cb(prismaService)
      )
    })

    it('creates a userJourney', async () => {
      prismaService.userJourney.upsert.mockResolvedValueOnce(userJourney)
      expect(
        await resolver.userJourneyRequest(ability, 'journeyId', user)
      ).toEqual(userJourney)
    })

    it('throws error if not authorized', async () => {
      prismaService.userJourney.upsert.mockResolvedValueOnce({
        id: 'userJourneyId'
      } as unknown as UserJourney)
      await expect(
        resolver.userJourneyRequest(ability, 'journeyId', user)
      ).rejects.toThrow('user is not allowed to create userJourney')
    })
  })

  describe('userJourneyApprove', () => {
    const user = {
      id: 'userId',
      firstName: 'John',
      email: 'jsmith@example.com',
      emailVerified: true
    }

    it('updates a UserJourney to editor status', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(
        userJourneyWithJourneyOwner
      )
      await resolver.userJourneyApprove(ability, user, 'userJourneyId')
      expect(prismaService.userJourney.update).toHaveBeenCalledWith({
        where: { id: 'userJourneyId' },
        data: { role: UserJourneyRole.editor }
      })
    })

    it('throws error if not found', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userJourneyApprove(ability, user, 'userJourneyId')
      ).rejects.toThrow('userJourney not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(userJourney)
      await expect(
        resolver.userJourneyApprove(ability, user, 'userJourneyId')
      ).rejects.toThrow('user is not allowed to update userJourney')
    })
  })

  describe('userJourneyPromote', () => {
    it('updates a UserJourney to owner status', async () => {
      prismaService.$transaction.mockImplementation(
        async (cb) => await cb(prismaService)
      )
      prismaService.userJourney.findUnique.mockResolvedValueOnce(
        userJourneyWithJourneyOwner
      )
      await resolver.userJourneyPromote(ability, 'userJourneyId')
      expect(prismaService.userJourney.updateMany).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId', role: UserJourneyRole.owner },
        data: { role: UserJourneyRole.editor }
      })
      expect(prismaService.userJourney.update).toHaveBeenCalledWith({
        where: { id: 'userJourneyId' },
        data: { role: UserJourneyRole.owner }
      })
    })

    it('throws error if not found', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userJourneyPromote(ability, 'userJourneyId')
      ).rejects.toThrow('userJourney not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(userJourney)
      await expect(
        resolver.userJourneyPromote(ability, 'userJourneyId')
      ).rejects.toThrow('user is not allowed to update userJourney')
    })
  })

  describe('userJourneyRemove', () => {
    it('removes a UserJourney', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(
        userJourneyWithJourneyOwner
      )
      await resolver.userJourneyRemove(ability, 'userJourneyId')
      expect(prismaService.userJourney.delete).toHaveBeenCalledWith({
        where: { id: 'userJourneyId' }
      })
    })

    it('throws error if not found', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.userJourneyRemove(ability, 'userJourneyId')
      ).rejects.toThrow('userJourney not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(userJourney)
      await expect(
        resolver.userJourneyRemove(ability, 'userJourneyId')
      ).rejects.toThrow('user is not allowed to delete userJourney')
    })
  })

  describe('userJourneyRemoveAll', () => {
    it('removes all userJourneys', async () => {
      prismaService.userJourney.findMany.mockResolvedValue([
        userJourney,
        userJourney
      ])
      await resolver.userJourneyRemoveAll({ OR: [] }, 'journeyId')
      expect(prismaService.userJourney.deleteMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [] }, { id: { in: [userJourney.id, userJourney.id] } }]
        }
      })
    })
  })

  describe('UserJourneyOpen', () => {
    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2021-02-18'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('updates openedAt', async () => {
      prismaService.userJourney.findUnique.mockResolvedValue(userJourney)
      await resolver.userJourneyOpen(ability, 'userJourneyId', 'userId')
      expect(prismaService.userJourney.update).toHaveBeenCalledWith({
        where: { id: userJourney.id },
        data: {
          openedAt: new Date()
        }
      })
    })

    it('returns null if not found', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce(null)
      expect(
        await resolver.userJourneyOpen(ability, 'userJourneyId', 'userId')
      ).toBeNull()
    })

    it('throws error if not authorized', async () => {
      prismaService.userJourney.findUnique.mockResolvedValueOnce({
        ...userJourney,
        userId: 'unknownUserId'
      })
      await expect(
        resolver.userJourneyOpen(ability, 'userJourneyId', 'userId')
      ).rejects.toThrow('user is not allowed to update userJourney')
    })
  })

  describe('journey', () => {
    it('returns associated journey', async () => {
      await resolver.journey({ ...userJourney, journeyId: 'journeyId' })
      expect(prismaService.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journeyId' }
      })
    })
  })

  describe('user', () => {
    it('returns user reference', async () => {
      expect(await resolver.user(userJourney)).toEqual({
        __typename: 'User',
        id: 'userId'
      })
    })
  })

  describe('journeyNotification', () => {
    it('returns associated journeyNotification', async () => {
      const userJourneyWithJourneyNotification = {
        ...userJourney,
        journeyNotification: {
          id: 'journeyNotification',
          userId: 'userId',
          journeyId: 'journeyId',
          userTeamId: null,
          userJourneyId: 'userJourneyId',
          visitorInteractionEmail: false
        }
      }

      const journeyNotification = jest
        .fn()
        .mockResolvedValue(
          userJourneyWithJourneyNotification.journeyNotification
        )

      prismaService.userJourney.findUnique.mockReturnValue({
        ...userJourneyWithJourneyNotification,
        journeyNotification
      } as unknown as Prisma.Prisma__UserJourneyClient<UserJourney>)
      expect(await resolver.journeyNotification(userJourney)).toEqual({
        id: 'journeyNotification',
        journeyId: 'journeyId',
        userId: 'userId',
        userJourneyId: 'userJourneyId',
        userTeamId: null,
        visitorInteractionEmail: false
      })
    })
  })
})

describe('JourneyResolver', () => {
  let resolver: JourneyResolver, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<JourneyResolver>(JourneyResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('userJourneys', () => {
    it('fetches accessible userJourneys', async () => {
      prismaService.userJourney.findMany.mockResolvedValueOnce([
        { id: 'userInviteId' } as unknown as UserJourney
      ])
      const userJourneys = await resolver.userJourneys({ OR: [] }, {
        id: 'journeyId'
      } as unknown as Journey)
      expect(prismaService.userJourney.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ OR: [] }, { journeyId: 'journeyId' }]
        }
      })
      expect(userJourneys).toEqual([{ id: 'userInviteId' }])
    })
  })
})
