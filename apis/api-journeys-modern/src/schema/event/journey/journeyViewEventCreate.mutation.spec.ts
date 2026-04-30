import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

describe('journeyViewEventCreate', () => {
  const mockUser = { id: 'userId' }
  const authClient = getClient({
    headers: { authorization: 'token', 'user-agent': 'TestAgent/1.0' },
    context: { currentUser: mockUser }
  })

  const JOURNEY_VIEW_EVENT_CREATE = graphql(`
    mutation JourneyViewEventCreate($input: JourneyViewEventCreateInput!) {
      journeyViewEventCreate(input: $input) {
        id
        journeyId
        label
        value
      }
    }
  `)

  beforeEach(() => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journeyId',
      teamId: 'teamId'
    } as any)
  })

  it('creates a JourneyViewEvent when no recent event exists', async () => {
    prismaMock.visitor.findFirst.mockResolvedValue({
      id: 'visitorId',
      userAgent: 'existing-agent'
    } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)
    prismaMock.event.findFirst.mockResolvedValue(null)

    const createdEvent = {
      id: 'eventId',
      typename: 'JourneyViewEvent',
      journeyId: 'journeyId',
      label: 'Journey Title',
      value: '529',
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'eventId',
          journeyId: 'journeyId',
          label: 'Journey Title',
          value: '529'
        }
      }
    })

    expect(result).toEqual({
      data: {
        journeyViewEventCreate: expect.objectContaining({
          id: 'eventId',
          journeyId: 'journeyId',
          label: 'Journey Title',
          value: '529'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'eventId',
          typename: 'JourneyViewEvent',
          label: 'Journey Title',
          value: '529',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })

  it('returns null when a recent JourneyViewEvent already exists', async () => {
    prismaMock.visitor.findFirst.mockResolvedValue({
      id: 'visitorId',
      userAgent: 'existing-agent'
    } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)
    prismaMock.event.findFirst.mockResolvedValue({
      id: 'existingEventId',
      typename: 'JourneyViewEvent',
      createdAt: new Date()
    } as any)

    const result = await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          journeyId: 'journeyId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        journeyViewEventCreate: null
      }
    })

    expect(prismaMock.event.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when journey does not exist', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          journeyId: 'nonExistentJourney'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Journey does not exist')
  })

  it('throws NOT_FOUND when visitor does not exist', async () => {
    prismaMock.visitor.findFirst.mockResolvedValue(null)

    const result = (await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          journeyId: 'journeyId'
        }
      }
    })) as any

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toBe('Visitor does not exist')
  })

  it('updates visitor userAgent when it is null', async () => {
    prismaMock.visitor.findFirst.mockResolvedValue({
      id: 'visitorId',
      userAgent: null
    } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)
    prismaMock.event.findFirst.mockResolvedValue(null)

    const createdEvent = {
      id: 'eventId',
      typename: 'JourneyViewEvent',
      journeyId: 'journeyId',
      label: null,
      value: null,
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )
    prismaMock.visitor.update.mockResolvedValue({ id: 'visitorId' } as any)

    await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          journeyId: 'journeyId'
        }
      }
    })

    expect(prismaMock.visitor.update).toHaveBeenCalledWith({
      where: { id: 'visitorId' },
      data: { userAgent: 'TestAgent/1.0' }
    })
  })

  it('handles optional fields (id, label, value)', async () => {
    prismaMock.visitor.findFirst.mockResolvedValue({
      id: 'visitorId',
      userAgent: 'existing-agent'
    } as any)
    prismaMock.journeyVisitor.findUnique.mockResolvedValue({
      journeyId: 'journeyId',
      visitorId: 'visitorId'
    } as any)
    prismaMock.event.findFirst.mockResolvedValue(null)

    const createdEvent = {
      id: 'auto-generated-id',
      typename: 'JourneyViewEvent',
      journeyId: 'journeyId',
      label: null,
      value: null,
      visitorId: 'visitorId',
      createdAt: new Date(),
      languageId: null
    } as any

    prismaMock.event.create.mockResolvedValue(createdEvent)
    prismaMock.event.findMany.mockResolvedValue([createdEvent])
    prismaMock.event.findUnique.mockResolvedValue(createdEvent)
    ;(prismaMock.event as any).findUniqueOrThrow?.mockResolvedValue?.(
      createdEvent
    )

    const result = await authClient({
      document: JOURNEY_VIEW_EVENT_CREATE,
      variables: {
        input: {
          journeyId: 'journeyId'
        }
      }
    })

    expect(result).toEqual({
      data: {
        journeyViewEventCreate: expect.objectContaining({
          id: 'auto-generated-id',
          journeyId: 'journeyId'
        })
      }
    })

    expect(prismaMock.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          typename: 'JourneyViewEvent',
          visitor: { connect: { id: 'visitorId' } },
          journey: { connect: { id: 'journeyId' } }
        })
      })
    )
  })
})
