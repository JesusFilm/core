import { Test, TestingModule } from '@nestjs/testing'

import { RadioQuestionSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: RadioQuestionSubmissionEventResolver,
    prismaService: PrismaService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const input: RadioQuestionSubmissionEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    radioOptionBlockId: 'radioOptionBlock.id',
    stepId: 'step.id',
    label: 'stepName',
    value: 'radioOption.label'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadioQuestionSubmissionEventResolver,
        eventService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<RadioQuestionSubmissionEventResolver>(
      RadioQuestionSubmissionEventResolver
    )
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prismaService.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
  })

  describe('radioQuestionSubmissionEventCreate', () => {
    it('returns RadioQuestionSubmissionEvent', async () => {
      expect(
        await resolver.radioQuestionSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        typename: 'RadioQuestionSubmissionEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        journey: { connect: { id: 'journey.id' } }
      })
    })

    it('should update visitor last event at', async () => {
      await resolver.radioQuestionSubmissionEventCreate('userId', input)

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastRadioQuestion: input.label,
          lastRadioOptionSubmission: input.value
        }
      })
    })
  })
})
