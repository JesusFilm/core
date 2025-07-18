import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, JourneyVisitor, Visitor } from '@core/prisma/journeys/client'

import {
  TextResponseSubmissionEventCreateInput,
  TextResponseType
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationGrowthSpacesService } from '../../integration/growthSpaces/growthSpaces.service'
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
    prismaService: DeepMockProxy<PrismaService>,
    integrationGrowthSpacesService: DeepMockProxy<IntegrationGrowthSpacesService>,
    eventService: DeepMockProxy<EventService>

  const block: Block = {
    id: 'blockId',
    journeyId: '2',
    typename: 'ImageBlock',
    parentBlockId: 'card1',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    label: 'label',
    description: 'description',
    updatedAt: new Date(),
    routeId: 'routeId',
    integrationId: 'integrationId',
    type: null
  } as unknown as Block

  const response = {
    visitor: { id: 'visitor.id' } as unknown as Visitor,
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    } as unknown as JourneyVisitor,
    journeyId: 'journey.id',
    block
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextResponseSubmissionEventResolver,
        {
          provide: IntegrationGrowthSpacesService,
          useValue: mockDeep<IntegrationGrowthSpacesService>()
        },
        { provide: EventService, useValue: mockDeep<EventService>() },
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
    eventService = module.get<EventService>(
      EventService
    ) as DeepMockProxy<EventService>
    integrationGrowthSpacesService = module.get<IntegrationGrowthSpacesService>(
      IntegrationGrowthSpacesService
    ) as DeepMockProxy<IntegrationGrowthSpacesService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('textResponseSubmissionEventCreate', () => {
    const input: TextResponseSubmissionEventCreateInput = {
      id: '1',
      blockId: 'block.id',
      stepId: 'step.id',
      label: 'stepName',
      value: 'My response'
    }

    const saveInputRes = {
      ...input,
      typename: 'TextResponseSubmissionEvent',
      visitor: {
        connect: { id: 'visitor.id' }
      },
      createdAt: new Date().toISOString(),
      journeyId: 'journey.id'
    }

    it('returns TextResponseSubmissionEvent', async () => {
      eventService.validateBlockEvent.mockResolvedValue({ ...response, block })
      eventService.save.mockResolvedValue(saveInputRes)

      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual(saveInputRes)
    })

    it('should update visitor name if TextResponse block type is name', async () => {
      const textResponseBlockType = {
        ...block,
        type: TextResponseType.name
      }
      eventService.validateBlockEvent.mockResolvedValue({
        ...response,
        block: textResponseBlockType
      })
      await resolver.textResponseSubmissionEventCreate('userId', input)
      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        data: {
          lastTextResponse: 'My response',
          name: 'My response'
        },
        where: {
          id: 'visitor.id'
        }
      })
    })

    it('should update visitor email if TextResponse block type is email', async () => {
      const textResponseBlockType = {
        ...block,
        type: TextResponseType.email
      }
      eventService.validateBlockEvent.mockResolvedValue({
        ...response,
        block: textResponseBlockType
      })
      await resolver.textResponseSubmissionEventCreate('userId', input)
      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        data: {
          lastTextResponse: 'My response',
          email: 'My response'
        },
        where: {
          id: 'visitor.id'
        }
      })
    })

    it('should update visitor phone if TextResponse block type is phone', async () => {
      const textResponseBlockType = {
        ...block,
        type: TextResponseType.phone
      }
      eventService.validateBlockEvent.mockResolvedValue({
        ...response,
        block: textResponseBlockType
      })
      await resolver.textResponseSubmissionEventCreate('userId', input)
      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        data: {
          lastTextResponse: 'My response',
          phone: 'My response'
        },
        where: {
          id: 'visitor.id'
        }
      })
    })

    it('should update add subscriber to GrowthSpaces integration', async () => {
      const textResponseBlockType = {
        ...block,
        type: TextResponseType.email
      }
      eventService.validateBlockEvent.mockResolvedValue({
        ...response,
        block: textResponseBlockType
      })

      const mockVisitor = {
        id: 'visitorId',
        name: 'Name',
        email: 'example@example.com'
      } as unknown as Visitor
      prismaService.visitor.update.mockResolvedValue(mockVisitor)

      await resolver.textResponseSubmissionEventCreate('userId', input)
      expect(integrationGrowthSpacesService.addSubscriber).toHaveBeenCalledWith(
        'journey.id',
        textResponseBlockType,
        mockVisitor.name,
        mockVisitor.email
      )
    })

    it('should update visitor', async () => {
      eventService.validateBlockEvent.mockResolvedValue({ ...response, block })

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
