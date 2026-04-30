import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  validateBlockEvent: jest.fn()
}))

describe('stepViewEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_VIEW_EVENT_CREATE = graphql(`
    mutation StepViewEventCreate($input: StepViewEventCreateInput!) {
      stepViewEventCreate(input: $input) {
        id
        journeyId
        value
      }
    }
  `)

  const { validateBlockEvent } = require('../utils')

  const mockVisitor = {
    id: 'visitorId',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    userId: 'userId',
    teamId: 'teamId'
  }

  const mockJourneyVisitor = {
    journeyId: 'journeyId',
    visitorId: 'visitorId',
    createdAt: new Date('2024-01-01T00:00:00Z')
  }

  beforeEach(() => {
    validateBlockEvent.mockResolvedValue({
      visitor: mockVisitor,
      journeyVisitor: mockJourneyVisitor,
      journeyId: 'journeyId',
      teamId: 'teamId',
      block: { id: 'blockId', journeyId: 'journeyId' }
    })
  })

  it('creates a StepViewEvent when authorized', async () => {
    const createdEvent = {
      id: 'eventId',
      typename: 'StepViewEvent',
      journeyId: 'journeyId',
      label: null,
      value: 'Step Title',
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null,
      stepId: 'blockId'
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.visitor.update.mockResolvedValue(mockVisitor as any)
    prismaMock.journeyVisitor.update.mockResolvedValue(
      mockJourneyVisitor as any
    )

    const result = await authClient({
      document: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          blockId: 'blockId',
          value: 'Step Title'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepViewEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId',
          value: 'Step Title'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'StepViewEvent',
          value: 'Step Title',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } },
          stepId: 'blockId'
        })
      })
    )

    expect(prismaMock.visitor.update).toHaveBeenCalledWith({
      where: { id: 'visitorId' },
      data: {
        duration: expect.any(Number),
        lastStepViewedAt: expect.any(Date)
      }
    })

    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith({
      where: {
        journeyId_visitorId: {
          journeyId: 'journeyId',
          visitorId: 'visitorId'
        }
      },
      data: {
        duration: expect.any(Number),
        lastStepViewedAt: expect.any(Date)
      }
    })
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    validateBlockEvent.mockRejectedValue(
      new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = (await authClient({
      document: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'nonExistentBlock',
          value: 'Step Title'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Block does not exist')
  })

  it('creates event without optional id and value', async () => {
    const createdEvent = {
      id: 'auto-generated-id',
      typename: 'StepViewEvent',
      journeyId: 'journeyId',
      label: null,
      value: null,
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null,
      stepId: 'blockId'
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.visitor.update.mockResolvedValue(mockVisitor as any)
    prismaMock.journeyVisitor.update.mockResolvedValue(
      mockJourneyVisitor as any
    )

    const result = await authClient({
      document: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepViewEventCreate: expect.objectContaining({
          id: 'auto-generated-id',
          journeyId: 'journeyId',
          value: null
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'StepViewEvent',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })

  it('caps duration at 1200 seconds', async () => {
    const oldDate = new Date('2020-01-01T00:00:00Z')
    validateBlockEvent.mockResolvedValue({
      visitor: { ...mockVisitor, createdAt: oldDate },
      journeyVisitor: { ...mockJourneyVisitor, createdAt: oldDate },
      journeyId: 'journeyId',
      teamId: 'teamId',
      block: { id: 'blockId', journeyId: 'journeyId' }
    })

    const createdEvent = {
      id: 'eventId',
      typename: 'StepViewEvent',
      journeyId: 'journeyId',
      label: null,
      value: null,
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null,
      stepId: 'blockId'
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.visitor.update.mockResolvedValue(mockVisitor as any)
    prismaMock.journeyVisitor.update.mockResolvedValue(
      mockJourneyVisitor as any
    )

    await authClient({
      document: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(prismaMock.visitor.update).toHaveBeenCalledWith({
      where: { id: 'visitorId' },
      data: {
        duration: 1200,
        lastStepViewedAt: expect.any(Date)
      }
    })

    expect(prismaMock.journeyVisitor.update).toHaveBeenCalledWith({
      where: {
        journeyId_visitorId: {
          journeyId: 'journeyId',
          visitorId: 'visitorId'
        }
      },
      data: {
        duration: 1200,
        lastStepViewedAt: expect.any(Date)
      }
    })
  })
})
