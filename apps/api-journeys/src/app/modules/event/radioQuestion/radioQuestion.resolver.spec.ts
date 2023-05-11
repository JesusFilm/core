import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: RadioQuestionSubmissionEventResolver, prisma: PrismaService

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
    prisma = module.get<PrismaService>(PrismaService)
    prisma.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prisma.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
  })

  describe('radioQuestionSubmissionEventCreate', () => {
    it('returns RadioQuestionSubmissionEvent', async () => {
      expect(
        await resolver.radioQuestionSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'RadioQuestionSubmissionEvent',
        visitorId: 'visitor.id',
        journeyId: 'journey.id'
      })
    })

    it('should update visitor last event at', async () => {
      await resolver.radioQuestionSubmissionEventCreate('userId', input)

      expect(prisma.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastRadioQuestion: input.label,
          lastRadioOptionSubmission: input.value
        }
      })
    })
  })
})
