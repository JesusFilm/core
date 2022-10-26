import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { JourneyViewEventCreateInput } from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getVisitorByUserIdAndTeamId: jest.fn(() => visitorWithId)
    })
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn(() => journey)
    })
  }

  const input: JourneyViewEventCreateInput = {
    id: '1',
    journeyId: 'journey.id'
  }

  const journey = {
    language: 'english'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyViewEventResolver, eventService, journeyService]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      const userInfo = {
        deviceInfo: 'device info',
        ipAddress: '000.00.000.00'
      }

      // TODO: add check for visitor update

      expect(
        await resolver.journeyViewEventCreate('userId', userInfo, input)
      ).toEqual({
        ...input,
        __typename: 'JourneyViewEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        language: journey.language // TODO: update
      })
    })
  })
})
