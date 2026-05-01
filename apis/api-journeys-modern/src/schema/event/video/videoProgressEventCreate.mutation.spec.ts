import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  validateBlockEvent: jest.fn()
}))

describe('videoProgressEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const VIDEO_PROGRESS_EVENT_CREATE = graphql(`
    mutation VideoProgressEventCreate(
      $input: VideoProgressEventCreateInput!
    ) {
      videoProgressEventCreate(input: $input) {
        id
        journeyId
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
  })

  it('creates a VideoProgressEvent when authorized', async () => {
    const createdEvent = {
      id: 'eventId',
      typename: 'VideoProgressEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date(),
      position: null,
      source: null,
      progress: 25
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: VIDEO_PROGRESS_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          blockId: 'blockId',
          stepId: 'stepId',
          progress: 25
        }
      }
    })

    expect(result).toEqual({
      data: {
        videoProgressEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'VideoProgressEvent',
          blockId: 'blockId',
          progress: 25,
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } },
          stepId: 'stepId'
        })
      })
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
      document: VIDEO_PROGRESS_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'nonExistentBlock',
          progress: 50
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Block does not exist')
  })

  it('creates event without optional fields', async () => {
    const createdEvent = {
      id: 'auto-id',
      typename: 'VideoProgressEvent',
      journeyId: 'journeyId',
      visitorId: 'visitorId',
      createdAt: new Date(),
      progress: 75
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: VIDEO_PROGRESS_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId',
          progress: 75
        }
      }
    })

    expect(result).toEqual({
      data: {
        videoProgressEventCreate: expect.objectContaining({
          id: 'auto-id',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'VideoProgressEvent',
          progress: 75,
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
