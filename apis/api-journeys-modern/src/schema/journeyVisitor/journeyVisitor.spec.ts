import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

const JOURNEY_VISITOR_EXPORT_QUERY = graphql(`
  query JourneyVisitorExport(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $select: JourneyVisitorExportSelect
  ) {
    journeyVisitorExport(
      journeyId: $journeyId
      filter: $filter
      select: $select
    )
  }
`)

describe('journeyVisitorExport', () => {
  const mockUser = { id: 'testUserId' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return CSV formatted string with visitor data and events', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'blockFirst'
        },
        {
          id: 'blockLast'
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'blockLast',
        label: 'Text Response'
      } as any,
      {
        blockId: 'blockFirst',
        label: 'Button Click'
      } as any
    ])
    prismaMock.journeyVisitor.findMany.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: [
          {
            blockId: 'blockFirst',
            label: 'Button Click',
            value: 'Submit'
          } as any
        ]
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone,Button Click,Text Response\nvisitor1,2024-01-01T00:00:00.000Z,John Doe,john@example.com,+1234567890,Submit,\n'
    )
  })

  it('should filter by typename when provided', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1'
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])

    prismaMock.journeyVisitor.findMany.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: {
          typenames: ['ButtonClickEvent', 'TextResponseSubmissionEvent']
        }
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone,Button Click\n'
    )

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        label: { not: null },
        typename: { in: ['ButtonClickEvent', 'TextResponseSubmissionEvent'] }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label']
    })
  })

  it('should not filter by typenames when empty array is provided but ignore headers', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1'
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit'
          } as any
        ]
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: {
          typenames: []
        }
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone\nvisitor1,2024-01-01T00:00:00.000Z,John Doe,john@example.com,+1234567890\n'
    )

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        label: { not: null }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label']
    })
  })

  it('should filter by date range when provided', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: {
          periodRangeStart: '2024-01-01T00:00:00Z',
          periodRangeEnd: '2024-12-31T23:59:59Z'
        }
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone\n'
    )

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        label: { not: null },
        createdAt: {
          gte: new Date('2024-01-01T00:00:00Z'),
          lte: new Date('2024-12-31T23:59:59Z')
        }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label']
    })
  })

  it('should handle multiple events for the same block by concatenating values', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1'
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])

    prismaMock.journeyVisitor.findMany.mockResolvedValue([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit'
          } as any,
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Cancel'
          } as any
        ]
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone,Button Click\nvisitor1,2024-01-01T00:00:00.000Z,John Doe,john@example.com,+1234567890,Submit; Cancel\n'
    )
  })

  it('should handle multiple events for the same block with different labelss', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1'
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any,
      {
        blockId: 'block1',
        label: 'Button Click New Label'
      } as any
    ])

    prismaMock.journeyVisitor.findMany.mockResolvedValue([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit'
          } as any,
          {
            blockId: 'block1',
            label: 'Button Click New Label',
            value: 'Cancel'
          } as any
        ]
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone,Button Click,Button Click New Label\nvisitor1,2024-01-01T00:00:00.000Z,John Doe,john@example.com,+1234567890,Submit,Cancel\n'
    )
  })

  it('should handle visitors with no events', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: []
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone\nvisitor1,2024-01-01T00:00:00.000Z,John Doe,john@example.com,+1234567890\n'
    )
  })

  it('should handle visitor with no metadata', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: null,
          email: null,
          phone: null
        },
        events: []
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone\nvisitor1,2024-01-01T00:00:00.000Z,,,\n'
    )
  })

  it('should handle empty results gracefully', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'id,createdAt,name,email,phone\n'
    )
  })

  it('should error when journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce(null)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })

    expect(result).toHaveProperty('errors[0].message', 'Journey not found')
  })

  it('should error when user is not allowed to export journey', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: 'otherUserId', role: 'manager' }] },
      userJourneys: [],
      blocks: []
    } as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })

    expect(result).toHaveProperty(
      'errors[0].message',
      'User is not allowed to export visitors'
    )
  })

  it('should handle select argument', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: []
    } as any)

    prismaMock.event.findMany.mockResolvedValueOnce([])
    prismaMock.journeyVisitor.findMany.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        visitor: {
          id: 'visitor1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: []
      } as any
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        select: { createdAt: false, name: false, email: false, phone: false }
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', 'id\nvisitor1\n')
  })
})
