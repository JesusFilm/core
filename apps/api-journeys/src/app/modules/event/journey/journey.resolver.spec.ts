import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { JourneyViewEventCreateInput } from '../../../__generated__/graphql'
import { JourneyViewEventResolver } from './journey.resolver'

describe('JourneyViewEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: JourneyViewEventResolver

  const input: JourneyViewEventCreateInput = {
    id: '1',
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyViewEventResolver, eventService]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      const userInfo = {
        deviceInfo: 'device info',
        ipAddress: '000.00.000.00'
      }
      expect(
        await resolver.journeyViewEventCreate('userId', userInfo, input)
      ).toEqual({
        ...input,
        ...userInfo,
        __typename: 'JourneyViewEvent',
        userId: 'userId',
        createdAt: new Date().toISOString(),
        teamId: 'team.id' // TODO: update
      })
    })
  })
})
