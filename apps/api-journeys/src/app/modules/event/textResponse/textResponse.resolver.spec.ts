import { Test, TestingModule } from '@nestjs/testing'

import { TextResponseSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: TextResponseSubmissionEventResolver,
    prismaService: PrismaService

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
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prismaService.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
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
        typename: 'TextResponseSubmissionEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })

    it('should update visitor', async () => {
      await resolver.textResponseSubmissionEventCreate('userId', input)

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastTextResponse: input.value
        }
      })
    })
  })
})
