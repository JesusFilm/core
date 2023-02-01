import { Test, TestingModule } from '@nestjs/testing'

import { JourneyProfileResolver } from './journeyProfile.resolver'
import { JourneyProfileService } from './journeyProfile.service'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver

  it('should return user profile', async () => {
    const user = {
      id: '1',
      userId: 'userId',
      acceptedTermsAt: '2021-11-19T12:34:56.647Z'
    }

    const journeyProfileService = {
      provide: JourneyProfileService,
      useFactory: () => ({
        getJourneyProfileByUserId: jest.fn(() => user)
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyProfileResolver, journeyProfileService]
    }).compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)

    expect(await resolver.getJourneyProfile('userId')).toEqual(user)
  })
})
