import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { v4 as uuidv4 } from 'uuid'
import { EventService } from '../event.service'
import { JourneyViewEventCreateInput } from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { VisitorService } from '../../visitor/visitor.service'
import { JourneyViewEventResolver } from './journey.resolver'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('JourneyViewEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: JourneyViewEventResolver, vService: VisitorService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getVisitorByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return visitorWithId
          case basicVisitor.userId:
            return basicVisitorWithId
        }
      })
    })
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn(() => journey)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      save: jest.fn(() => ''),
      update: jest.fn(() => '')
    })
  }

  const input: JourneyViewEventCreateInput = {
    id: '1',
    journeyId: 'journey.id'
  }

  const journey = {
    languageId: 'english',
    teamId: 'team.id'
  }

  const userInfo = {
    userAgent: 'device info',
    ipAddress: '000.00.000.00'
  }

  const visitor = {
    _key: 'visitor.id',
    userId: 'user.id',
    userAgent: '000'
  }

  const basicVisitor = {
    _key: 'basicVisitor.id',
    userId: 'basicUser.id'
  }

  const visitorWithId = keyAsId(visitor)
  const basicVisitorWithId = keyAsId(basicVisitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyViewEventResolver,
        eventService,
        journeyService,
        visitorService
      ]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      expect(
        await resolver.journeyViewEventCreate('user.id', userInfo, input)
      ).toEqual({
        ...input,
        __typename: 'JourneyViewEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        languageId: journey.languageId
      })

      expect(vService.save).not.toHaveBeenCalled()
      expect(vService.update).not.toHaveBeenCalled()
    })

    it('should create a new visitor if visitor doesnt exist', async () => {
      mockUuidv4.mockReturnValueOnce('newVisitor.id')

      await resolver.journeyViewEventCreate('newUser.id', userInfo, input)

      expect(vService.save).toHaveBeenCalledWith({
        id: 'newVisitor.id',
        teamId: journey.teamId,
        userId: 'newUser.id',
        createdAt: new Date().toISOString()
      })
    })

    it('should update user agent on visitor if visitor does not have a user agent', async () => {
      await resolver.journeyViewEventCreate('basicUser.id', userInfo, input)

      expect(vService.update).toHaveBeenCalledWith('basicVisitor.id', {
        userAgent: userInfo.userAgent
      })
    })
  })
})
