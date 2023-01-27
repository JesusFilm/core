import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { UserJourneyRole } from '../../__generated__/graphql'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver,
    service: UserInviteService,
    ujResolver: UserJourneyResolver

  const createInput = {
    email: 'email@test.com',
    name: 'Tester McTestFace'
  }

  const userInvite = {
    key: '1',
    journeyId: 'journeyId',
    email: 'email@test.com',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInviteResolver, userInviteService, userJourneyResolver]
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
      mockUuidv4.mockReturnValueOnce('1')

      await resolver.userInviteCreate('journeyId', createInput)

      const currentDate = new Date()
      const expireAt = currentDate.setDate(currentDate.getDate() + 30)

      expect(service.save).toHaveBeenCalledWith({
        journeyId: 'journeyId',
        name: createInput.name,
        email: createInput.email,
        accepted: false,
        expireAt: new Date(expireAt).toISOString()
      })
    })
  })

  describe('userInviteAccept', () => {
    it('should accept user invite', async () => {
      const acceptedInvite = await resolver.userInviteAccept('1', 'userId')

      expect(service.get).toHaveBeenCalledWith('1')
      expect(ujResolver.userJourneyRequest).toHaveBeenCalledWith(
        'journeyId',
        undefined,
        'userId'
      )
      expect(ujResolver.userJourneyApprove).toHaveBeenCalledWith(
        'userJourneyId',
        'userId'
      )

      expect(acceptedInvite).toEqual({
        ...userInvite,
        accepted: true
      })
    })
  })
})
