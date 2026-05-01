import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  validateBlockEvent: jest.fn()
}))

describe('stepNextEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const STEP_NEXT_EVENT_CREATE = graphql(`
    mutation StepNextEventCreate($input: StepNextEventCreateInput!) {
      stepNextEventCreate(input: $input) {
        id
        journeyId
        label
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

  it('creates a StepNextEvent when authorized', async () => {
    const createdEvent = {
      id: 'eventId',
      typename: 'StepNextEvent',
      journeyId: 'journeyId',
      label: 'Step Title',
      value: 'Next Step Title',
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
      document: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          blockId: 'blockId',
          nextStepId: 'nextStepId',
          label: 'Step Title',
          value: 'Next Step Title'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepNextEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId',
          label: 'Step Title',
          value: 'Next Step Title'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'StepNextEvent',
          blockId: 'blockId',
          nextStepId: 'nextStepId',
          label: 'Step Title',
          value: 'Next Step Title',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })

  it('returns NOT_FOUND when block does not exist', async () => {
    const { GraphQLError } = require('graphql')
    validateBlockEvent.mockRejectedValue(
      new GraphQLError('Block does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    )

    const result = (await authClient({
      document: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'nonExistentBlock',
          nextStepId: 'nextStepId'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Block does not exist')
  })

  it('creates event without optional id, label, and value', async () => {
    const createdEvent = {
      id: 'auto-generated-id',
      typename: 'StepNextEvent',
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
      document: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          blockId: 'blockId',
          nextStepId: 'nextStepId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        stepNextEventCreate: expect.objectContaining({
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
          typename: 'StepNextEvent',
          blockId: 'blockId',
          nextStepId: 'nextStepId',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
