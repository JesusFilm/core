import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyRoles } from '../../graphql'
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

  const userresponse = {
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
  
  const userservice = {
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
      providers: [UserResolver, userservice, userJourneyService]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    service = await module.resolve(UserService)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('User', () => {
    it('returns User', async () => {
      expect(resolver.user("1")).resolves.toEqual(userresponse)
      expect(resolver.users()).resolves.toEqual([userresponse, userresponse])
    })
  })

  describe('UserCreate', () => {
    it('creates a User', async () => {
      resolver.userCreate(userresponse)
      expect(service.save).toHaveBeenCalledWith(user)
    })
  })

  describe('UsersJourneys', () => {
    it('returns UsersJourneys', async () => {     
      expect(await resolver.usersJourneys(userresponse)).toEqual([userJourneyResponse, userJourneyResponse])
    })
  })
})
