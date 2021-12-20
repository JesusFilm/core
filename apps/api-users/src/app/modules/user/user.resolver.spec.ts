import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyRoles } from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

describe('Step', () => {
  let resolver: UserResolver, service: UserService

  const user = {
    _key: "1",
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  const userResponse = {
    id: "1",
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }


  const userJourney = {
    _key: "1",
    userId: "1",  
    journeyId: "2",
    role: UserJourneyRoles.editor
  }


  const userJourneyResponse = {
    id: "1",
    userId: "1",  
    journeyId: "2",
    role: UserJourneyRoles.editor
  }
  
  const userService = {
    provide: UserService,
    useFactory: () => ({
      get: jest.fn(() =>  user),
      getAll: jest.fn(() => [user, user]),
      save: jest.fn(input => input),
    })
  }

  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      forUser: jest.fn(() => [userJourney, userJourney]),
    })
  }
 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, userService, userJourneyService]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    service = await module.resolve(UserService)
  })

  describe('User', () => {
    it('returns User', async () => {
      expect(resolver.user("1")).resolves.toEqual(userResponse)
      expect(resolver.users()).resolves.toEqual([userResponse, userResponse])
    })
  })

  describe('UserCreate', () => {
    it('creates a User', async () => {
      resolver.userCreate(userResponse)
      expect(service.save).toHaveBeenCalledWith(user)
    })
  })

  describe('UsersJourneys', () => {
    it('returns UsersJourneys', async () => {     
      expect(await resolver.usersJourneys(userResponse)).toEqual([userJourneyResponse, userJourneyResponse])
    })
  })
})
