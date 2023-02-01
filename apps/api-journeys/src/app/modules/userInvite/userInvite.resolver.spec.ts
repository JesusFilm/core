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
    email: 'test@email.com',
    expireAt: null
  }

  const userInvite = {
    key: '1',
    journeyId: 'journeyId',
    senderId: 'senderId',
    email: 'test@email.com',
    accepted: false,
    expireAt: '2021-03-20T00:00:00.000Z'
  }

  const acceptedInvite = {
    ...userInvite,
    key: '2',
    journeyId: 'acceptedJourneyId',
    accepted: true
  }

  const expiredInvite = {
    ...userInvite,
    key: '3',
    journeyId: 'expiredJourneyId',
    expireAt: '2021-01-18T00:00:00.000Z'
  }

  const userInviteService = {
    provide: UserInviteService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      update: jest.fn((id, input) => {
        // console.log('MOCK IS CALLED')
        return { ...userInvite, ...input }
      }),
      remove: jest.fn((id) => userInvite),
      getAllUserInvitesByEmail: jest.fn((email) => {
        if (email === userInvite.email) {
          return [userInvite, acceptedInvite, expiredInvite]
        }
        return []
      }),
      getAllUserInvitesByJourney: jest.fn((journeyId) => {
        return [{ ...userInvite, journeyId }]
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

  const journey = {
    id: 'journeyId'
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => (id === journey.id ? journey : undefined))
    })
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
    it('should create user invite', async () => {
      const currentDate = new Date()
      const expireAt = new Date(
        currentDate.setDate(currentDate.getDate() + 30)
      ).toISOString()

      await resolver.userInviteCreate('journeyId', 'senderId', createInput)

      expect(service.save).toHaveBeenCalledWith({
        journeyId: 'journeyId',
        senderId: 'senderId',
        email: createInput.email,
        accepted: false,
        expireAt
      })
    })
  })

  describe('userInviteRemove', () => {
    it('should remove user invite', async () => {
      const removedInvite = await resolver.userInviteRemove('1', 'journeyId')

      expect(service.remove).toHaveBeenCalledWith('1')
      expect(removedInvite).toEqual(userInvite)
    })
  })

  describe('userInviteAcceptAll', () => {
    it('should accept unredeemed valid user invites', async () => {
      await resolver.userInviteAcceptAll('userId', {
        email: 'test@email.com'
      })

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

      // expect(service.update).toBeCalledTimes(1)
      // expect(service.update).toHaveBeenCalledWith(userInvite.key, {
      //   accepted: true
      // })

      // Ignored accepted and expired invites
      // expect(invites[0]).toEqual([
      //   {
      //     ...userInvite,
      //     accepted: true
      //   }
      // ])
    })

    it('should show no invites if email does not match', async () => {
      const rejectedInvite = await resolver.userInviteAcceptAll('userId', {
        email: 'doesnotexist@email.com'
      })

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(service.update).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual([])
    })
  })
})
