import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyRole } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    service: UserInviteService,
    ujResolver: UserJourneyResolver

  const createInput = {
    email: 'test@email.com',
    name: 'Tester McTestFace',
    expireAt: null
  }

  const userInvite = {
    key: '1',
    journeyId: 'journeyId',
    senderId: 'senderId',
    email: 'test@email.com',
    name: 'Tester McTestFace',
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
        return { ...userInvite, ...input }
      }),
      getAllUserInvitesByJourney: jest.fn((journeyId) => {
        return [{ ...userInvite, journeyId }]
      }),
      getUserInviteByJourneyAndEmail: jest.fn((journeyId, email) => {
        if (email === userInvite.email) {
          if (journeyId === userInvite.journeyId) return userInvite
          if (journeyId === acceptedInvite.journeyId) return acceptedInvite
          if (journeyId === expiredInvite.journeyId) return expiredInvite
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
        name: createInput.name,
        email: createInput.email,
        accepted: false,
        expireAt
      })
    })
  })

  describe('userInviteAccept', () => {
    it('should accept user invite', async () => {
      const acceptedInvite = await resolver.userInviteAccept(
        'journeyId',
        'userId',
        { email: 'test@email.com' }
      )

      expect(ujResolver.userJourneyRequest).toHaveBeenCalledWith(
        'journeyId',
        'databaseId',
        'userId'
      )
      expect(ujResolver.userJourneyApprove).toHaveBeenCalledWith(
        'userJourneyId',
        'senderId'
      )

      expect(acceptedInvite).toEqual({
        ...userInvite,
        accepted: true
      })
    })

    it('should show no invite if journey does not match', async () => {
      const rejectedInvite = await resolver.userInviteAccept(
        'wrongJourneyId',
        'userId',
        { email: 'test@email.com' }
      )

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual(null)
    })

    it('should show no invite if email does not match', async () => {
      const rejectedInvite = await resolver.userInviteAccept(
        'journeyId',
        'userId',
        { email: 'doesnotexist@email.com' }
      )

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(rejectedInvite).toEqual(null)
    })

    it('should ignore invite if already accepted', async () => {
      const invite = await resolver.userInviteAccept(
        'acceptedJourneyId',
        'userId',
        { email: 'test@email.com' }
      )

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(invite).toEqual(acceptedInvite)
    })

    it('should ignore invite if expired', async () => {
      const invite = await resolver.userInviteAccept(
        'expiredJourneyId',
        'userId',
        {
          email: 'test@email.com'
        }
      )

      expect(ujResolver.userJourneyRequest).not.toHaveBeenCalled()
      expect(ujResolver.userJourneyApprove).not.toHaveBeenCalled()
      expect(invite).toEqual(expiredInvite)
    })
  })
})
