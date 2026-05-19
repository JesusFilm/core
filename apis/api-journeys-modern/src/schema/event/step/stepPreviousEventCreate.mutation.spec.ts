import { GraphQLError } from 'graphql'
import { vi } from 'vitest'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { validateBlockEvent } from '../utils'

vi.mock('../utils', async () => ({
  ...(await vi.importActual('../utils')),
  validateBlockEvent: vi.fn()
}))

describe('stepPreviousEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_PREVIOUS_EVENT_CREATE = graphql(`
    mutation StepPreviousEventCreate($input: StepPreviousEventCreateInput!) {
      stepPreviousEventCreate(input: $input) {
        id
        journeyId
        label
        value
      }
    }
  `)

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
    ;(validateBlockEvent as any).mockResolvedValue({
      visitor: mockVisitor,
      journeyVisitor: mockJourneyVisitor,
      journeyId: 'journeyId',
      teamId: 'teamId',
      block: { id: 'blockId', journeyId: 'journeyId' }
    })
  })

  it('creates a StepPreviousEvent when authorized', async () => {
    const createdEvent = {
      id: 'eventId',
      typename: 'StepPreviousEvent',
      journeyId: 'journeyId',
      label: 'Step Title',
      value: 'Previous Step Title',
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null,
      stepId: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          blockId: 'blockId',
          previousStepId: 'previousStepId',
          label: 'Step Title',
          value: 'Previous Step Title'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepPreviousEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId',
          label: 'Step Title',
          value: 'Previous Step Title'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'StepPreviousEvent',
          blockId: 'blockId',
          previousStepId: 'previousStepId',
          label: 'Step Title',
          value: 'Previous Step Title',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    ;(validateBlockEvent as any).mockRejectedValue(
      new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = (await authClient({
      document: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'nonExistentBlock',
          previousStepId: 'previousStepId'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Block does not exist')
  })

  it('creates event without optional id, label, and value', async () => {
    const createdEvent = {
      id: 'auto-generated-id',
      typename: 'StepPreviousEvent',
      journeyId: 'journeyId',
      label: null,
      value: null,
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null,
      stepId: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId',
          previousStepId: 'previousStepId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepPreviousEventCreate: expect.objectContaining({
          id: 'auto-generated-id',
          journeyId: 'journeyId',
          label: null,
          value: null
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'StepPreviousEvent',
          blockId: 'blockId',
          previousStepId: 'previousStepId',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
