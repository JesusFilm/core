import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

describe('Step', () => {
  let resolver: UserResolver, service: UserService

  const user = {
    _key: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  const userResponse = {
    id: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  describe('me', () => {
    it('returns User', async () => {
      beforeEach(async () => {
        const userService = {
          provide: UserService,
          useFactory: () => ({
            get: jest.fn(() => user),
            getAll: jest.fn(() => [user, user]),
            save: jest.fn((input) => input)
          })
        }
        const module: TestingModule = await Test.createTestingModule({
          providers: [UserResolver, userService]
        }).compile()
        resolver = module.get<UserResolver>(UserResolver)
        service = module.get<UserService>(UserService)
      })
      expect(await resolver.me(user._key)).toEqual(userResponse)
    })
  })
})
