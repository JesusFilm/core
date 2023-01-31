import { Test, TestingModule } from '@nestjs/testing'

import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

describe('UserResolver', () => {
  let resolver: UserResolver
  let service: UserService

  const user = {
    id: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  const userUpdate = {
    acceptedTermsAt: '1970-01-01T00:00:00Z'
  }

  beforeEach(async () => {
    const userService = {
      provide: UserService,
      useFactory: () => ({
        get: jest.fn(() => user),
        getByUserId: jest.fn(() => user),
        getAll: jest.fn(() => [user, user]),
        save: jest.fn((input) => input),
        update: jest.fn(() => user)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, userService]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    service = module.get<UserService>(UserService)
  })

  describe('me', () => {
    it('returns User', async () => {
      expect(await resolver.me(user.id)).toEqual(user)
    })
  })

  describe('resolveReference', () => {
    it('returns User', async () => {
      expect(
        await resolver.resolveReference({ __typename: 'User', id: user.id })
      ).toEqual(user)
    })
  })

  describe('userUpdate', () => {
    it('updates a User', async () => {
      await resolver.userUpdate('1', userUpdate)
      expect(service.update).toHaveBeenCalledWith('1', userUpdate)
    })
  })
})
