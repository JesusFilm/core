import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyService } from './userJourney.service'

describe('UserJourneyService', () => {
  let service: UserJourneyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJourneyService],
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
