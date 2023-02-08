import { Test, TestingModule } from '@nestjs/testing'
import { Role, UserJourneyRole } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    service: UserInviteService,
    ujResolver: UserJourneyResolver

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
    acceptedAt: '2021-02-18T00:00:00.000Z'
  }

  const removedInvite = {
    ...userInvite,
    id: '3',
    journeyId: 'removedJourneyId',
    removedAt: '2021-02-18T00:00:00.000Z'
  }

  const userInviteService = {
    provide: UserInviteService,
    useFactory: () => ({
      save: jest.fn((input) => {
        return { ...input, acceptedAt: null, removedAt: null }
      }),
      update: jest.fn((id, input) => {
        return { ...userInvite, ...input }
      }),
      remove: jest.fn((id) => userInvite),
      getAllUserInvitesByEmail: jest.fn((email) => {
        if (email === userInvite.email) {
          return [userInvite, acceptedInvite, removedInvite]
        }
        return []
      }),
      getAllUserInvitesByJourney: jest.fn((journeyId) => {
        return [{ ...userInvite, journeyId }]
      }),
      getUserInviteByJourneyAndEmail: jest.fn((journeyId, email) => {
        if (
          journeyId === removedInvite.journeyId &&
          email === removedInvite.email
        ) {
          return removedInvite
        } else if (
          journeyId === acceptedInvite.journeyId &&
          email === acceptedInvite.email
        ) {
          return acceptedInvite
        }
        return null
      })
    })
  }

  const userJourney = {
    id: 'userJourneyId',
    userId: 'userId',
    journeyId: 'journeyId',
    role: UserJourneyRole.editor
  }

  const userJourneyResolver = {
    provide: UserJourneyResolver,
    useFactory: () => ({
      userJourneyRequest: jest.fn((journeyId, idType, userId) => {
        return { ...userJourney, journeyId, userId, role: 'inviteRequested' }
      }),
      userJourneyApprove: jest.fn((id, userId) => {
        return userJourney
      })
    })
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({ get: jest.fn((key) => userJourney) })
  }

  const userRole = {
    id: 'userRoleId',
    userId: 'userId',
    roles: [Role.publisher]
  }

  const userRoleService = {
    provide: UserRoleService,
    useFactory: () => ({
      getUserRoleById: jest.fn(() => userRole)
    })
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => ({ id }))
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
        userInviteService,
        userJourneyResolver,
        userJourneyService,
        userRoleService,
        journeyService
      ]
    }).compile()
    resolver = module.get(UserInviteResolver)
    service = await module.resolve(UserInviteService)
    ujResolver = await module.resolve(UserJourneyResolver)
  })

  describe('userInvites', () => {
    it('should return all user invites sent for a journey', async () => {
      await resolver.userInvites('journeyId')

      expect(service.getAllUserInvitesByJourney).toHaveBeenCalledWith(
        'journeyId'
      )
    })
  })

  describe('userInviteCreate', () => {
    it('should create user invite if does not exist', async () => {
      const invite = await resolver.userInviteCreate(
        'senderId',
        'newJourneyId',
        createInput
      )

      expect(service.save).toHaveBeenCalledWith({
        journeyId: 'newJourneyId',
        senderId: 'senderId',
        email: createInput.email
      })
      expect(service.update).not.toHaveBeenCalled()
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

      expect(service.save).not.toHaveBeenCalled()
      expect(service.update).toHaveBeenCalledWith(removedInvite.id, {
        senderId: removedInvite.senderId,
        removedAt: null
      })
    })

    it('should ignore accepted user invite', async () => {
      const invite = await resolver.userInviteCreate(
        'senderId',
        'acceptedJourneyId',
        createInput
      )

      expect(service.save).not.toHaveBeenCalled()
      expect(service.update).not.toHaveBeenCalled()
      expect(invite).toEqual(acceptedInvite)
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

      expect(service.update).toHaveBeenCalledWith('1', {
        removedAt: '2021-02-18T00:00:00.000Z'
      })
      expect(invite).toEqual({
        ...userInvite,
        removedAt: '2021-02-18T00:00:00.000Z'
      })
    })
  })

  describe('userInviteAcceptAll', () => {
    it('should accept unredeemed valid user invites', async () => {
      const invites = await resolver.userInviteAcceptAll(user)

      expect(ujResolver.userJourneyRequest).toHaveBeenCalledTimes(1)
      expect(ujResolver.userJourneyRequest).toHaveBeenCalledWith(
        'journeyId',
        'databaseId',
        'userId'
      )
      expect(ujResolver.userJourneyApprove).toHaveBeenCalledTimes(1)
      expect(ujResolver.userJourneyApprove).toHaveBeenCalledWith(
        'userJourneyId',
        'senderId'
      )

      expect(await invites[0]).toEqual({
        ...userInvite,
        acceptedAt: '2021-02-18T00:00:00.000Z'
      })
      // Accepted and expired invites unchanged
      expect(await invites[1]).toEqual(acceptedInvite)
      expect(await invites[2]).toEqual(removedInvite)
    })

    it('should show no invites if email does not match', async () => {
      const rejectedInvite = await resolver.userInviteAcceptAll({
        ...user,
        email: 'doesnotexist@email.com'
      })

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(service.update).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual([])
    })

    it('should throw an error when no user journey', async () => {
      const mockUserJourneyRequest =
        ujResolver.userJourneyRequest as jest.MockedFunction<
          typeof ujResolver.userJourneyRequest
        >
      mockUserJourneyRequest.mockResolvedValueOnce(undefined)
      await expect(
        async () => await resolver.redeemInvite(userInvite, user.id)
      ).rejects.toThrow('userJourney does not exist')
    })
  })
})
