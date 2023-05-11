import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextResponseSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: TextResponseSubmissionEventResolver, prisma: PrismaService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextResponseSubmissionEventResolver,
        eventService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
    prisma = module.get<PrismaService>(PrismaService)
    prisma.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prisma.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
  })

  describe('textResponseSubmissionEventCreate', () => {
    const input: TextResponseSubmissionEventCreateInput = {
      id: '1',
      blockId: 'block.id',
      stepId: 'step.id',
      label: 'stepName',
      value: 'My response'
    }
    it('returns TextResponseSubmissionEvent', async () => {
      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })

    it('should update visitor', async () => {
      await resolver.textResponseSubmissionEventCreate('userId', input)

      expect(prisma.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastTextResponse: input.value
        }
      })
    })
  })
})
