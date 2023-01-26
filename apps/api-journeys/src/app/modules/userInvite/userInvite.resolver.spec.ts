import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('UserInviteResolver', () => {
  let resolver: UserInviteResolver
  let service: UserInviteService

  const createInput = {
    email: 'email@test.com',
    name: 'Tester McTestFace',
    sentBy: 'ownerId'
  }

  const userInvite = {
    key: '1',
    inviteId: 'inviteId',
    journeyId: 'journeyId',
    email: 'email@test.com',
    name: 'Tester McTestFace',
    sentBy: 'ownerId',
    acceptedBy: null,
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
      getAllUserInvitesBySender: jest.fn((userId) => {
        return { ...userInvite, sentBy: userId }
      })
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInviteResolver, userInviteService]
    }).compile()
    resolver = module.get(UserInviteResolver)
    service = await module.resolve(UserInviteService)
  })

  describe('userInvites', () => {
    it('should return all user invites sent by a user', async () => {
      await resolver.userInvites('userId')

      expect(service.getAllUserInvitesBySender).toHaveBeenCalledWith('userId')
    })
  })

  describe('userInviteCreate', () => {
    it('should create user invite', async () => {
      mockUuidv4.mockReturnValueOnce('inviteId')

      await resolver.userInviteCreate('journeyId', createInput)

      const currentDate = new Date()
      const expireAt = currentDate.setDate(currentDate.getDate() + 30)

      expect(service.save).toHaveBeenCalledWith({
        inviteId: 'inviteId',
        journeyId: 'journeyId',
        sentBy: createInput.sentBy,
        name: createInput.name,
        email: createInput.email,
        acceptedBy: null,
        expireAt: new Date(expireAt).toISOString()
      })
    })
  })

  describe('userInviteUpdate', () => {
    it('should update user invite', async () => {
      const updatedInvite = await resolver.userInviteUpdate('inviteId', {
        acceptedBy: 'invitedUserId'
      })

      expect(updatedInvite).toEqual({
        ...userInvite,
        acceptedBy: 'invitedUserId'
      })
    })
  })
})
