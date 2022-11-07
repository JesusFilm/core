import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { JourneyViewEventCreateInput } from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
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

  let resolver: JourneyViewEventResolver, vService: VisitorService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return visitorWithId
          case newVisitor.userId:
            return newVisitorWithId
        }
      }),
      update: jest.fn(() => '')
    })
  }

  const journeyService = {
    provide: JourneyService,
    useFactory: () => ({
      get: jest.fn((journeyId) => {
        switch (journeyId) {
          case input.journeyId:
            return { id: input.journeyId }
        }
      })
    })
  }

  const input: JourneyViewEventCreateInput = {
    id: '1',
    journeyId: 'journey.id',
    label: 'journey title',
    value: '503'
  }

  const userAgent = 'device info'

  const visitor = {
    _key: 'visitor.id',
    userId: 'user.id',
    userAgent: '000'
  }

  const newVisitor = {
    _key: 'newVisitor.id',
    userId: 'newUser.id'
  }

  const visitorWithId = keyAsId(visitor)
  const newVisitorWithId = keyAsId(newVisitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyViewEventResolver,
        eventService,
        visitorService,
        journeyService
      ]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      expect(
        await resolver.journeyViewEventCreate('user.id', userAgent, input)
      ).toEqual({
        ...input,
        __typename: 'JourneyViewEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString()
      })

      expect(vService.update).not.toHaveBeenCalled()
    })

    it('should update user agent on visitor if visitor does not have a user agent', async () => {
      await resolver.journeyViewEventCreate('newUser.id', userAgent, input)

      expect(vService.update).toHaveBeenCalledWith('newVisitor.id', {
        userAgent
      })
    })

    it('should throw error if journey doesnt exist', async () => {
      const errorInput = {
        ...input,
        journeyId: 'anotherJourney.id'
      }

      await expect(
        async () =>
          await resolver.journeyViewEventCreate(
            'user.id',
            userAgent,
            errorInput
          )
      ).rejects.toThrow('Journey does not exist')
    })
  })

  describe('language', () => {
    it('returns object for federation', () => {
      expect(resolver.language({ value: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })

    it('when no languageId returns object for federation with default', () => {
      expect(resolver.language({})).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })
})
