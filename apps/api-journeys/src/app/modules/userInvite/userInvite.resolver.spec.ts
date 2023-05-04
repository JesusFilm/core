import { Test, TestingModule } from '@nestjs/testing'
import { Role, UserJourneyRole } from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'
import { PrismaService } from '../../lib/prisma.service'
import { UserInviteResolver } from './userInvite.resolver'

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    ujService: UserJourneyService,
    prisma: PrismaService

  const createInput = {
    email: 'test@email.com'
  }

  const userInvite = {
    id: '1',
    journeyId: 'journeyId',
    senderId: 'senderId',
    email: 'test@email.com',
    acceptedAt: null,
    removedAt: null
  }

  const acceptedInvite = {
    ...userInvite,
    id: '2',
    journeyId: 'acceptedJourneyId',
    acceptedAt: new Date('2021-02-10T00:00:00.000Z')
  }

  const removedInvite = {
    ...userInvite,
    id: '3',
    journeyId: 'removedJourneyId',
    removedAt: new Date('2021-02-18T00:00:00.000Z')
  }

  const outdatedAcceptedInvite = {
    ...userInvite,
    id: '4',
    journeyId: 'outdatedAcceptedJourneyId',
    email: 'existing@email.com',
    acceptedAt: new Date('2021-02-10T00:00:00.000Z')
  }

  const userJourney = {
    id: 'userJourneyId',
    userId: 'userId',
    journeyId: 'journeyId',
    role: UserJourneyRole.editor
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      get: jest.fn((key) => userJourney),
      requestAccess: jest.fn((journeyId, idType, userId) => {
        return userId === 'existingUserId'
          ? undefined
          : { ...userJourney, journeyId, userId, role: 'inviteRequested' }
      }),
      approveAccess: jest.fn((id, userId) => {
        return userJourney
      })
    })
  }

  const userRole = {
    id: 'userRoleId',
    userId: 'userId',
    roles: [Role.publisher]
  }

  const userRole2 = {
    id: 'userRoleId2',
    userId: 'existingUserId',
    roles: []
  }

  const userRoleService = {
    provide: UserRoleService,
    useFactory: () => ({
      getUserRoleById: jest.fn((id) =>
        id === userRole.id ? userRole : userRole2
      )
    })
  }

  const user = {
    id: 'userId',
    email: 'test@email.com',
    firstName: 'Test'
  }

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInviteResolver,
        userJourneyService,
        userRoleService,
        PrismaService
      ]
    }).compile()
    resolver = module.get(UserInviteResolver)
    ujService = await module.resolve(UserJourneyService)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.journey.findUnique = jest
      .fn()
      .mockImplementationOnce((request) => ({ id: request.where.id }))
    prisma.userInvite.findMany = jest.fn().mockImplementation((input) => {
      if (input.where.email === userInvite.email) {
        return [userInvite, acceptedInvite, removedInvite]
      } else if (input.where.email === outdatedAcceptedInvite.email) {
        return [outdatedAcceptedInvite]
      }
      return []
    })
    prisma.userInvite.create = jest.fn().mockImplementation((input) => {
      return { ...input.data, acceptedAt: null, removedAt: null }
    })
    prisma.userInvite.update = jest.fn().mockImplementation((input) => {
      if (input.where.id === removedInvite.id) {
        return { ...removedInvite, ...input.data }
      } else if (input.where.id === acceptedInvite.id) {
        return { ...acceptedInvite, ...input.data }
      } else if (input.where.id === outdatedAcceptedInvite.id) {
        return { ...outdatedAcceptedInvite, ...input.data }
      }
      return { ...userInvite, ...input.data }
    })
    prisma.userInvite.findUnique = jest.fn().mockImplementationOnce((input) => {
      if (
        input.where.journeyId_email.journeyId === removedInvite.journeyId &&
        input.where.journeyId_email.email === removedInvite.email
      ) {
        return removedInvite
      } else if (
        input.where.journeyId_email.journeyId === acceptedInvite.journeyId &&
        input.where.journeyId_email.email === acceptedInvite.email
      ) {
        return acceptedInvite
      }
      return null
    })
  })

  describe('userInvites', () => {
    it('should return all user invites sent for a journey', async () => {
      await resolver.userInvites('journeyId')

      expect(prisma.userInvite.findMany).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId' }
      })
    })
  })

  describe('userInviteCreate', () => {
    it('should create user invite if does not exist', async () => {
      const invite = await resolver.userInviteCreate(
        'senderId',
        'newJourneyId',
        createInput
      )

      expect(prisma.userInvite.create).toHaveBeenCalledWith({
        data: {
          journeyId: 'newJourneyId',
          senderId: 'senderId',
          email: createInput.email,
          acceptedAt: null,
          removedAt: null
        }
      })
      expect(prisma.userInvite.update).not.toHaveBeenCalled()
      expect(invite).toEqual({
        journeyId: 'newJourneyId',
        senderId: 'senderId',
        email: createInput.email,
        acceptedAt: null,
        removedAt: null
      })
    })

    it('should re-activate existing user invite if not accepted', async () => {
      await resolver.userInviteCreate(
        'senderId',
        'removedJourneyId',
        createInput
      )

      expect(prisma.userInvite.create).not.toHaveBeenCalled()
      expect(prisma.userInvite.update).toHaveBeenCalledWith({
        where: { id: removedInvite.id },
        data: {
          senderId: removedInvite.senderId,
          acceptedAt: null,
          removedAt: null
        }
      })
    })

    it('should ignore accepted user invite', async () => {
      const invite = await resolver.userInviteCreate(
        'senderId',
        'acceptedJourneyId',
        createInput
      )
      expect(prisma.userInvite.create).not.toHaveBeenCalled()
      expect(prisma.userInvite.update).not.toHaveBeenCalled()
      expect(invite).toEqual(null)
    })

    it('throws UserInputError when journey does not exist', async () => {
      await resolver
        .userInviteCreate('senderId', 'randomJourneyId', createInput)
        .catch((error) => {
          expect(error.message).toEqual('journey does not exist')
        })
    })
  })

  describe('userInviteRemove', () => {
    it('should remove user invite', async () => {
      const invite = await resolver.userInviteRemove('1', 'journeyId')

      expect(prisma.userInvite.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          acceptedAt: null,
          removedAt: new Date('2021-02-18T00:00:00.000Z')
        }
      })
      expect(invite).toEqual({
        ...userInvite,
        acceptedAt: null,
        removedAt: new Date('2021-02-18T00:00:00.000Z')
      })
    })
  })

  describe('userInviteAcceptAll', () => {
    it('should accept unredeemed valid user invites', async () => {
      const invites = await resolver.userInviteAcceptAll(user)

      expect(ujService.requestAccess).toHaveBeenCalledTimes(1)
      expect(ujService.requestAccess).toHaveBeenCalledWith(
        'journeyId',
        'databaseId',
        'userId'
      )
      expect(ujService.approveAccess).toHaveBeenCalledTimes(1)
      expect(ujService.approveAccess).toHaveBeenCalledWith(
        'userJourneyId',
        'senderId'
      )

      expect(await invites[0]).toEqual({
        ...userInvite,
        acceptedAt: new Date('2021-02-18T00:00:00.000Z')
      })
      // accepted invites unchanged
      expect(await invites[1]).toEqual(acceptedInvite)
      // Expired invites unchanged
      expect(await invites[2]).toEqual(removedInvite)
    })

    it('should show no invites if email does not match', async () => {
      const rejectedInvite = await resolver.userInviteAcceptAll({
        ...user,
        email: 'doesnotexist@email.com'
      })

      expect(ujService.requestAccess).not.toHaveBeenCalled()
      expect(ujService.approveAccess).not.toHaveBeenCalled()
      expect(prisma.userInvite.update).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual([])
    })
  })
})
