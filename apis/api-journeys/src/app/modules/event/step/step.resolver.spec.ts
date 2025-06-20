import { Test, TestingModule } from '@nestjs/testing'

import {
  StepNextEventCreateInput,
  StepPreviousEventCreateInput,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

import {
  StepNextEventResolver,
  StepPreviousEventResolver,
  StepViewEventResolver
} from './step.resolver'

describe('Step', () => {
  let prismaService: PrismaService, eService: EventService

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: {
      id: 'visitor.id',
      createdAt: new Date(new Date('2021-02-18').setMinutes(-5))
    },
    journeyVisitor: {
      visitorId: 'visitor.id',
      journeyId: 'journey.id',
      createdAt: new Date(new Date('2021-02-18').setMinutes(-5))
    },
    journeyId: 'journey.id'
  }

  describe('stepViewEventCreate', () => {
    let resolver: StepViewEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepViewEventResolver, eventService, PrismaService]
      }).compile()
      resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
      eService = module.get<EventService>(EventService)
      prismaService = module.get<PrismaService>(PrismaService)
      prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
      prismaService.journeyVisitor.update = jest
        .fn()
        .mockResolvedValueOnce(null)
    })

    it('returns StepViewEvent', async () => {
      const input: StepViewEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        value: 'stepName'
      }

      expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
        ...input,
        typename: 'StepViewEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        journey: { connect: { id: 'journey.id' } },
        stepId: input.blockId
      })
    })

    it('should update visitor last event at', async () => {
      const input: StepViewEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        value: 'stepName'
      }
      await resolver.stepViewEventCreate('userId', input)

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          duration: 300,
          lastStepViewedAt: new Date()
        }
      })
    })

    it('should have a max duration of 20 minutes', async () => {
      const input: StepViewEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        value: 'stepName'
      }
      prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
      eService.validateBlockEvent = jest.fn().mockResolvedValueOnce({
        ...response,
        visitor: {
          ...response.visitor,
          createdAt: new Date(new Date('2021-02-18').setMinutes(-25))
        },
        journeyVisitor: {
          ...response.journeyVisitor,
          createdAt: new Date(new Date('2021-02-18').setMinutes(-25))
        }
      })
      await resolver.stepViewEventCreate('userId', input)

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          duration: 1200,
          lastStepViewedAt: new Date()
        }
      })
    })
  })

  describe('StepNextEventResolver', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService]
      }).compile()
      resolver = module.get<StepNextEventResolver>(StepNextEventResolver)
    })

    describe('stepNextEventCreate', () => {
      const input: StepNextEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        nextStepId: 'step.id',
        label: 'step name',
        value: 'next step name'
      }

      it('should return step next event', async () => {
        expect(await resolver.stepNextEventCreate('userId', input)).toEqual({
          ...input,
          typename: 'StepNextEvent',
          visitor: {
            connect: { id: 'visitor.id' }
          },
          createdAt: new Date().toISOString(),
          journey: { connect: { id: 'journey.id' } }
        })
      })
    })
  })

  describe('StepPreviousEventResolver', () => {
    let resolver: StepPreviousEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepPreviousEventResolver, eventService]
      }).compile()
      resolver = module.get<StepPreviousEventResolver>(
        StepPreviousEventResolver
      )
    })

    describe('stepPreviousEventCreate', () => {
      const input: StepPreviousEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        previousStepId: 'step.id',
        label: 'step name',
        value: 'Prev step name'
      }

      it('should return step Prev event', async () => {
        expect(await resolver.stepPreviousEventCreate('userId', input)).toEqual(
          {
            ...input,
            typename: 'StepPreviousEvent',
            visitor: {
              connect: { id: 'visitor.id' }
            },
            createdAt: new Date().toISOString(),
            journey: { connect: { id: 'journey.id' } }
          }
        )
      })
    })
  })
})
