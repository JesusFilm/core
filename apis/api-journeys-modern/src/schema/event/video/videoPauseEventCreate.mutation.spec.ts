import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  validateBlockEvent: jest.fn()
}))

describe('videoPauseEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const VIDEO_PAUSE_EVENT_CREATE = graphql(`
    mutation VideoPauseEventCreate($input: VideoPauseEventCreateInput!) {
      videoPauseEventCreate(input: $input) {
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

  it('creates a VideoPauseEvent when authorized', async () => {
    const createdEvent = {
      id: 'eventId',
      typename: 'VideoPauseEvent',
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
      document: VIDEO_PAUSE_EVENT_CREATE,
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
        videoPauseEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'VideoPauseEvent',
          blockId: 'blockId',
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
      document: VIDEO_PAUSE_EVENT_CREATE,
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
    const createdEvent = {
      id: 'auto-id',
      typename: 'VideoPauseEvent',
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
      document: VIDEO_PAUSE_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        videoPauseEventCreate: expect.objectContaining({
          id: 'auto-id',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'VideoPauseEvent',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
