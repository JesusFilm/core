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

  it('should return CSV formatted string with two header rows and visitor data', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'card1',
          typename: 'CardBlock',
          parentBlockId: 'step1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typography1',
          typename: 'TypographyBlock',
          parentBlockId: 'card1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Welcome Card'
        },
        {
          id: 'blockFirst',
          typename: 'ButtonBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ]
    } as any)
    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'blockFirst',
        label: 'Button Click'
      } as any
    ])
    prismaMock.journeyVisitor.findMany.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        events: [
          {
            blockId: 'blockFirst',
            label: 'Button Click',
            value: 'Submit',
            typename: 'ButtonClickEvent'
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

    // First row: Date + event labels
    // Second row: empty + card headings
    // Third row+: visitor data
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'Date,Button Click\n,Welcome Card\n2024-01-01,Submit\n'
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
          id: 'block1',
          typename: 'ButtonBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
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
      'Date,Button Click\n,\n'
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

  it('should not filter by typenames when empty array is provided but ignore event headers', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1',
          typename: 'ButtonBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
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
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit',
            typename: 'ButtonClickEvent'
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
      'Date\n\n2024-01-01\n'
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

    expect(result).toHaveProperty('data.journeyVisitorExport', 'Date\n\n')

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
          id: 'block1',
          typename: 'ButtonBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
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
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit',
            typename: 'ButtonClickEvent'
          } as any,
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Cancel',
            typename: 'ButtonClickEvent'
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
      'Date,Button Click\n,\n2024-01-01,Submit; Cancel\n'
    )
  })

  it('should handle multiple events for the same block with different labels', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [
        {
          id: 'block1',
          typename: 'ButtonBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
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
        events: [
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Submit',
            typename: 'ButtonClickEvent'
          } as any,
          {
            blockId: 'block1',
            label: 'Button Click New Label',
            value: 'Cancel',
            typename: 'ButtonClickEvent'
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
      'Date,Button Click,Button Click New Label\n,,\n2024-01-01,Submit,Cancel\n'
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
      'Date\n\n2024-01-01\n'
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

    expect(result).toHaveProperty('data.journeyVisitorExport', 'Date\n\n')
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

  it('should include card headings in second header row', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: 'step2',
          action: null,
          content: null
        },
        {
          id: 'card1',
          typename: 'CardBlock',
          parentBlockId: 'step1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typography1',
          typename: 'TypographyBlock',
          parentBlockId: 'card1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Question 1 Card'
        },
        {
          id: 'block1',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'step2',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'card2',
          typename: 'CardBlock',
          parentBlockId: 'step2',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typography2',
          typename: 'TypographyBlock',
          parentBlockId: 'card2',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Question 2 Card'
        },
        {
          id: 'block2',
          typename: 'RadioQuestionBlock',
          parentBlockId: 'card2',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ]
    } as any)

    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'What is your name?'
      } as any,
      {
        blockId: 'block2',
        label: 'Select an option'
      } as any
    ])
    prismaMock.journeyVisitor.findMany.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-15T00:00:00Z'),
        events: [
          {
            blockId: 'block1',
            label: 'What is your name?',
            value: 'John Doe',
            typename: 'TextResponseSubmissionEvent'
          } as any,
          {
            blockId: 'block2',
            label: 'Select an option',
            value: 'Option A',
            typename: 'RadioQuestionSubmissionEvent'
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
      'Date,What is your name?,Poll\n,Question 1 Card,Question 2 Card\n2024-01-15,John Doe,Option A\n'
    )
  })

  it('should use "Multiselect" as header for RadioMultiselectBlock types', async () => {
    prismaMock.journey.findUnique.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: null,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'card1',
          typename: 'CardBlock',
          parentBlockId: 'step1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typography1',
          typename: 'TypographyBlock',
          parentBlockId: 'card1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Choose Your Options'
        },
        {
          id: 'block1',
          typename: 'RadioMultiselectBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ]
    } as any)

    prismaMock.event.findMany.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Select multiple options'
      } as any
    ])
    prismaMock.journeyVisitor.findMany.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-01-20T00:00:00Z'),
        events: [
          {
            blockId: 'block1',
            label: 'Select multiple options',
            value: 'Option 1',
            typename: 'MultiselectSubmissionEvent'
          } as any,
          {
            blockId: 'block1',
            label: 'Select multiple options',
            value: 'Option 2',
            typename: 'MultiselectSubmissionEvent'
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
      'Date,Multiselect\n,Choose Your Options\n2024-01-20,Option 1; Option 2\n'
    )
  })
})
