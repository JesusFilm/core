import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyRoles } from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'

describe('Step', () => {
  let resolver: UserJourneyResolver, service: UserJourneyService

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

  const userJourneyUpdate = {
    role: UserJourneyRoles.editor
  }
  
  const userJourneyService = {
    provide: UserJourneyService,
    useFactory: () => ({
      get: jest.fn(() =>  userJourney),
      getAll: jest.fn(() => [userJourney, userJourney]),
      remove: jest.fn(input => input),
      save: jest.fn(input => input),
      update: jest.fn(input => input),
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJourneyResolver, userJourneyService]
    }).compile()
    resolver = module.get<UserJourneyResolver>(UserJourneyResolver)
    service = await module.resolve(UserJourneyService)
  })

  describe('userJourneyCreate', () => {
    it('creates a UserJourney', async () => {
      resolver.userJourneyCreate(userJourneyResponse)
      expect(service.save).toHaveBeenCalledWith(userJourney)
    })
  })

  describe('userJourneyUpdate', () => {
    it('updates a UserJourney', async () => {
      resolver.userJourneyUpdate("1", userJourneyUpdate)
      expect(service.update).toHaveBeenCalledWith("1", userJourneyUpdate)
    })
  })

  describe('userJourneyRemove', () => {
    it('removes a UserJourney', async () => {
      resolver.userJourneyRemove("1")
      expect(service.remove).toHaveBeenCalledWith("1")
    })
  })
})
