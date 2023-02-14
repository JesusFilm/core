import { Test, TestingModule } from '@nestjs/testing'
import { Role, UserJourneyRole } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserRoleService } from '../userRole/userRole.service'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    service: UserInviteService,
    ujService: UserJourneyService

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
    acceptedAt: '2021-02-10T00:00:00.000Z'
  }

  const removedInvite = {
    ...userInvite,
    id: '3',
    journeyId: 'removedJourneyId',
    removedAt: '2021-02-18T00:00:00.000Z'
  }

  const outdatedAcceptedInvite = {
    ...userInvite,
    id: '4',
    journeyId: 'outdatedAcceptedJourneyId',
    email: 'existing@email.com',
    acceptedAt: '2021-02-10T00:00:00.000Z'
  }

  const userInviteService = {
    provide: UserInviteService,
    useFactory: () => ({
      save: jest.fn((input) => {
        return { ...input, acceptedAt: null, removedAt: null }
      }),
      update: jest.fn((id, input) => {
        if (id === removedInvite.id) {
          return { ...removedInvite, ...input }
        } else if (id === acceptedInvite.id) {
          return { ...acceptedInvite, ...input }
        } else if (id === outdatedAcceptedInvite.id) {
          return { ...outdatedAcceptedInvite, ...input }
        }
        return { ...userInvite, ...input }
      }),
      remove: jest.fn((id, journeyId) =>
        id === userInvite.id ? userInvite : outdatedAcceptedInvite
      ),
      getAllUserInvitesByEmail: jest.fn((email) => {
        if (email === userInvite.email) {
          return [userInvite, acceptedInvite, removedInvite]
        } else if (email === outdatedAcceptedInvite.email) {
          return [outdatedAcceptedInvite]
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

  const user2 = {
    id: 'existingUserId',
    email: 'existing@email.com',
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
        userJourneyService,
        userRoleService,
        journeyService
      ]
    }).compile()
    resolver = module.get(UserInviteResolver)
    service = await module.resolve(UserInviteService)
    ujService = await module.resolve(UserJourneyService)
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
        email: createInput.email,
        acceptedAt: null,
        removedAt: null
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
        acceptedAt: null,
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

      expect(service.update).toHaveBeenCalledWith('1', {
        acceptedAt: null,
        removedAt: '2021-02-18T00:00:00.000Z'
      })
      expect(invite).toEqual({
        ...userInvite,
        acceptedAt: null,
        removedAt: '2021-02-18T00:00:00.000Z'
      })
    })
  })

  describe('userInviteAcceptAll', () => {
    it('should accept unredeemed valid user invites', async () => {
      const invites = await resolver.userInviteAcceptAll(user)

      expect(ujService.requestAccess).toHaveBeenCalledTimes(2)
      expect(ujService.requestAccess).toHaveBeenCalledWith(
        'journeyId',
        'databaseId',
        'userId'
      )
      expect(ujService.approveAccess).toHaveBeenCalledTimes(2)
      expect(ujService.approveAccess).toHaveBeenCalledWith(
        'userJourneyId',
        'senderId'
      )

      expect(await invites[0]).toEqual({
        ...userInvite,
        acceptedAt: '2021-02-18T00:00:00.000Z'
      })
      // accepted invites with no userJourney, updated to todays date
      expect(await invites[1]).toEqual({
        ...acceptedInvite,
        acceptedAt: '2021-02-18T00:00:00.000Z'
      })
      // Expired invites unchanged
      expect(await invites[2]).toEqual(removedInvite)
    })

    it('should remove userInvites which already have userJourneys', async () => {
      const invites = await resolver.userInviteAcceptAll(user2)

      expect(ujService.requestAccess).toHaveBeenCalledTimes(1)
      expect(ujService.requestAccess).toHaveBeenCalledWith(
        outdatedAcceptedInvite.journeyId,
        'databaseId',
        user2.id
      )

      expect(await invites[0]).toEqual({
        ...outdatedAcceptedInvite,
        removedAt: '2021-02-18T00:00:00.000Z'
      })
    })

    it('should show no invites if email does not match', async () => {
      const rejectedInvite = await resolver.userInviteAcceptAll({
        ...user,
        email: 'doesnotexist@email.com'
      })

      expect(ujService.requestAccess).not.toHaveBeenCalled()
      expect(ujService.approveAccess).not.toHaveBeenCalled()
      expect(service.update).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual([])
    })
  })
})
