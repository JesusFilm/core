import { Test, TestingModule } from '@nestjs/testing'
import { omit } from 'lodash'
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
    senderId: 'senderId',
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
    expireAt: new Date()
  }

  const userInviteService = {
    provide: UserInviteService,
    useFactory: () => ({
      get: jest.fn((id) => {
        return { ...userInvite, id }
      }),
      save: jest.fn((input) => input),
      update: jest.fn((id, input) => {
        return { ...userInvite, ...input }
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

  const journey = {
    id: 'journeyId'
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((id) => (id === journey.id ? journey : undefined))
    })
  }

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

      await resolver.userInviteCreate('journeyId', { ...createInput, expireAt })

      expect(service.save).toHaveBeenCalledWith(
        expect.objectContaining({
          journeyId: 'journeyId',
          senderId: 'senderId',
          name: createInput.name,
          email: createInput.email,
          accepted: false
        })
      )
    })
  })

  describe('userInviteAccept', () => {
    it('should accept user invite', async () => {
      const acceptedInvite = await resolver.userInviteAccept('1', 'userId', {
        email: 'test@email.com'
      })

      expect(service.get).toHaveBeenCalledWith('1')
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
  })
})
