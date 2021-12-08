import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyResolver } from './userJourney.resolver'

describe('UserJourneyResolver', () => {
  let resolver: UserJourneyResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJourneyResolver],
    }).compile()

    resolver = module.get<UserJourneyResolver>(UserJourneyResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
