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
  // Cast needed because Prisma findUnique has generics that hide jest mock helpers in TS
  const jf = prismaMock.journey.findUnique as unknown as jest.Mock
  const evFM = prismaMock.event.findMany as unknown as jest.Mock
  const jvFM = prismaMock.journeyVisitor.findMany as unknown as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return CSV formatted string with two header rows and visitor data', async () => {
    jf.mockResolvedValueOnce({
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
    evFM.mockResolvedValueOnce([
      {
        blockId: 'blockFirst',
        label: 'Button Click'
      } as any
    ])
    jvFM.mockResolvedValueOnce([
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

    // First row: Date + card headings
    // Second row: Date + event labels
    // Third row+: visitor data
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'Date,Welcome Card\nDate,Button Click\n2024-01-01,Submit\n'
    )
  })

  it('should filter by typename when provided', async () => {
    jf.mockResolvedValueOnce({
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
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])

    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: {
          typenames: ['ButtonClickEvent', 'TextResponseSubmissionEvent'],
          includeUnconnectedCards: true
        }
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'Date,\nDate,Button Click\n'
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
    jf.mockResolvedValueOnce({
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
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])
    jvFM.mockResolvedValue([
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
          typenames: [],
          includeUnconnectedCards: true
        }
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      'Date,\nDate,Button Click\n2024-01-01,Submit\n'
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
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    evFM.mockResolvedValueOnce([])
    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: {
          periodRangeStart: '2024-01-01T00:00:00Z',
          periodRangeEnd: '2024-12-31T23:59:59Z',
          includeUnconnectedCards: true
        }
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', 'Date\nDate\n')

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
    jf.mockResolvedValueOnce({
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
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any
    ])

    jvFM.mockResolvedValue([
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
      'Date,\nDate,Button Click\n2024-01-01,Submit; Cancel\n'
    )
  })

  it('should handle multiple events for the same block with different labels', async () => {
    jf.mockResolvedValueOnce({
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
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      } as any,
      {
        blockId: 'block1',
        label: 'Button Click New Label'
      } as any
    ])

    jvFM.mockResolvedValue([
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
      'Date,,\nDate,Button Click,Button Click New Label\n2024-01-01,Submit,Cancel\n'
    )
  })

  it('should not include visitors with no events', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    evFM.mockResolvedValueOnce([])
    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', 'Date\nDate\n')
  })

  it('should handle empty results gracefully', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: []
    } as any)
    evFM.mockResolvedValueOnce([])
    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', 'Date\nDate\n')
  })

  it('should error when journey is not found', async () => {
    jf.mockResolvedValueOnce(null)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })

    expect(result).toHaveProperty('errors[0].message', 'Journey not found')
  })

  it('should error when user is not allowed to export journey', async () => {
    jf.mockResolvedValueOnce({
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
    jf.mockResolvedValueOnce({
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

    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'What is your name?'
      } as any,
      {
        blockId: 'block2',
        label: 'Select an option'
      } as any
    ])
    jvFM.mockResolvedValueOnce([
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
      'Date,Question 1 Card,Question 2 Card\nDate,What is your name?,Poll\n2024-01-15,John Doe,Option A\n'
    )
  })

  it('should use "Multiselect" as header for RadioMultiselectBlock types', async () => {
    jf.mockResolvedValueOnce({
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
          typename: 'MultiselectBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ]
    } as any)

    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Select multiple options'
      } as any
    ])
    jvFM.mockResolvedValueOnce([
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
      'Date,Choose Your Options\nDate,Multiselect\n2024-01-20,Option 1; Option 2\n'
    )
  })
})
