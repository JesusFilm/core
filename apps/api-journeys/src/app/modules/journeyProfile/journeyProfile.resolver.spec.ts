import { Test, TestingModule } from '@nestjs/testing'

import { JourneyProfileResolver } from './journeyProfile.resolver'
import { JourneyProfileService } from './journeyProfile.service'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver

  const profile = {
    id: '1',
    userId: 'userId',
    acceptedTermsAt: null
  }

  const journeyProfileService = {
    provide: JourneyProfileService,
    useFactory: () => ({
      getJourneyProfileByUserId: jest.fn((userId) =>
        userId === profile.userId ? profile : null
      ),
      save: jest.fn((input) => {
        return { ...profile, ...input }
      })
    })
  }

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyProfileResolver, journeyProfileService]
    }).compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)
  })

  describe('getJourneyProfile', () => {
    it('should return user profile', async () => {
      expect(await resolver.getJourneyProfile('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileCreate', () => {
    it('should create user profile', async () => {
      expect(await resolver.journeyProfileCreate('newUserId')).toEqual({
        ...profile,
        userId: 'newUserId',
        acceptedTermsAt: '2021-02-18T00:00:00.000Z'
      })
    })

    it('should return existing profile', async () => {
      expect(await resolver.journeyProfileCreate('userId')).toEqual(profile)
    })
  })
})
