import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  validateBlockEvent: jest.fn(),
  resetEventsEmailDelay: jest.fn()
}))

describe('videoStartEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const VIDEO_START_EVENT_CREATE = graphql(`
    mutation VideoStartEventCreate($input: VideoStartEventCreateInput!) {
      videoStartEventCreate(input: $input) {
        id
        journeyId
      }
    }
  `)

  const { validateBlockEvent, resetEventsEmailDelay } = require('../utils')

  const mockVisitor = {
    id: 'visitorId',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    userId: 'userId',
    teamId: 'teamId'
  }

  beforeEach(() => {
    validateBlockEvent.mockResolvedValue({
      visitor: mockVisitor,
      journeyVisitor: {
        journeyId: 'journeyId',
        visitorId: 'visitorId'
      },
      journeyId: 'journeyId',
      teamId: 'teamId',
      block: { id: 'blockId', journeyId: 'journeyId' }
    })
    resetEventsEmailDelay.mockResolvedValue(undefined)
  })

  it('creates a VideoStartEvent when authorized', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      duration: 120,
      startAt: 10,
      endAt: 50
    } as any)

    const createdEvent = {
      id: 'eventId',
      typename: 'VideoStartEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date(),
      position: null,
      source: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: VIDEO_START_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          blockId: 'blockId',
          stepId: 'stepId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        videoStartEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'VideoStartEvent',
          blockId: 'blockId',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } },
          stepId: 'stepId'
        })
      })
    )

    expect(resetEventsEmailDelay).toHaveBeenCalledWith(
      'journeyId',
      'visitorId',
      40
    )
  })

  it('uses duration when startAt and endAt are null', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      duration: 200,
      startAt: null,
      endAt: null
    } as any)

    const createdEvent = {
      id: 'eventId',
      typename: 'VideoStartEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    await authClient({
      document: VIDEO_START_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(resetEventsEmailDelay).toHaveBeenCalledWith(
      'journeyId',
      'visitorId',
      200
    )
  })

  it('uses delay of 0 when video block is not found', async () => {
    prismaMock.block.findUnique.mockResolvedValue(null)

    const createdEvent = {
      id: 'eventId',
      typename: 'VideoStartEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    await authClient({
      document: VIDEO_START_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(resetEventsEmailDelay).toHaveBeenCalledWith(
      'journeyId',
      'visitorId',
      0
    )
  })

  it('returns error when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    validateBlockEvent.mockRejectedValue(
      new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = (await authClient({
      document: VIDEO_START_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'nonExistentBlock'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Block does not exist')
  })

  it('creates event without optional fields', async () => {
    prismaMock.block.findUnique.mockResolvedValue({
      id: 'blockId',
      duration: null,
      startAt: null,
      endAt: null
    } as any)

    const createdEvent = {
      id: 'auto-id',
      typename: 'VideoStartEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date()
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: VIDEO_START_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        videoStartEventCreate: expect.objectContaining({
          id: 'auto-id',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'VideoStartEvent',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
