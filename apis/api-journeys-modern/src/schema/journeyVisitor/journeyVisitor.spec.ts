import type { Prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

type SelectedJourneyBlock = Prisma.BlockGetPayload<{
  select: {
    id: true
    typename: true
    parentBlockId: true
    parentOrder: true
    nextBlockId: true
    action: true
    content: true
  }
}>

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

  it('should return CSV formatted string with single header row and visitor data', async () => {
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
      ] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([
      {
        blockId: 'blockFirst',
        label: 'Button Click'
      }
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
          }
        ]
      }
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    // Single header row: Type (Card Heading) or label for non-Poll/Multiselect
    // Data rows follow
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Button Click"\n"2024-01-01","Submit"\n'
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
      ] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      }
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
      '"Date","Button Click"\n'
    )

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        typename: { in: ['ButtonClickEvent', 'TextResponseSubmissionEvent'] }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label'],
      orderBy: { createdAt: 'asc' }
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
      ] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Button Click'
      }
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
      '"Date","Button Click"\n"2024-01-01","Submit"\n'
    )

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        typename: {
          in: [
            'RadioQuestionSubmissionEvent',
            'MultiselectSubmissionEvent',
            'TextResponseSubmissionEvent',
            'SignUpSubmissionEvent'
          ]
        }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label'],
      orderBy: { createdAt: 'asc' }
    })
  })

  it('should filter by date range when provided', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [] as unknown as SelectedJourneyBlock[]
    })
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

    expect(result).toHaveProperty('data.journeyVisitorExport', '"Date"\n')

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey1',
        blockId: { not: null },
        typename: {
          in: [
            'RadioQuestionSubmissionEvent',
            'MultiselectSubmissionEvent',
            'TextResponseSubmissionEvent',
            'SignUpSubmissionEvent'
          ]
        },
        createdAt: {
          gte: new Date('2024-01-01T00:00:00Z'),
          lte: new Date('2024-12-31T23:59:59Z')
        }
      },
      select: {
        blockId: true,
        label: true
      },
      distinct: ['blockId', 'label'],
      orderBy: { createdAt: 'asc' }
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
      ] as unknown as SelectedJourneyBlock[]
    })
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
          },
          {
            blockId: 'block1',
            label: 'Button Click',
            value: 'Cancel',
            typename: 'ButtonClickEvent'
          }
        ]
      }
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Button Click"\n"2024-01-01","Submit; Cancel"\n'
    )
  })

  it('should handle multiple events for the same block with different labels by keeping only one column per blockId', async () => {
    // This test verifies the fix for duplicate columns: when a block has events with different labels,
    // only one column should be created (using the first label encountered for that blockId)
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
      },
      {
        blockId: 'block1',
        label: 'Button Click New Label'
      }
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
          },
          {
            blockId: 'block1',
            label: 'Button Click New Label',
            value: 'Cancel',
            typename: 'ButtonClickEvent'
          }
        ]
      }
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    // Only one column for block1 should be created (using first label "Button Click")
    // The event with the different label should go to the same column using the first label's key
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Button Click"\n"2024-01-01","Submit"\n'
    )
  })

  it('should not include visitors with no events', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([])
    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', '"Date"\n')
  })

  it('should handle empty results gracefully', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: {
        userTeams: [{ userId: mockUser.id, role: 'manager' }]
      },
      userJourneys: [],
      blocks: [] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([])
    jvFM.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    expect(result).toHaveProperty('data.journeyVisitorExport', '"Date"\n')
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

  it('should format Poll headers with card heading', async () => {
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
      ] as unknown as SelectedJourneyBlock[]
    })

    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'What is your name?'
      },
      {
        blockId: 'block2',
        label: 'Select an option'
      }
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
          },
          {
            blockId: 'block2',
            label: 'Select an option',
            value: 'Option A',
            typename: 'RadioQuestionSubmissionEvent'
          }
        ]
      }
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    // Single header row: label for TextResponse, "Poll (Card Heading)" for RadioQuestion
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","What is your name?","Poll (Question 2 Card)"\n"2024-01-15","John Doe","Option A"\n'
    )
  })

  it('should format Multiselect headers with card heading', async () => {
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
      ] as unknown as SelectedJourneyBlock[]
    })

    evFM.mockResolvedValueOnce([
      {
        blockId: 'block1',
        label: 'Select multiple options'
      }
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
          },
          {
            blockId: 'block1',
            label: 'Select multiple options',
            value: 'Option 2',
            typename: 'MultiselectSubmissionEvent'
          }
        ]
      }
    ])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1'
      }
    })

    // Single header row: "Multiselect (Card Heading)" format
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Multiselect (Choose Your Options)"\n"2024-01-20","Option 1; Option 2"\n'
    )
  })

  it('excludes disconnected steps by default, includes them when includeUnconnectedCards=true', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        // Entry step (top-level first)
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
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
          content: 'Step 1 Heading'
        },
        {
          id: 'blockA',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        // Connected step via nextBlockId
        {
          id: 'step2',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 1,
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
          content: 'Step 2 Heading'
        },
        {
          id: 'blockB',
          typename: 'TextResponseBlock',
          parentBlockId: 'card2',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        // Disconnected step (top-level but not reachable)
        {
          id: 'stepX',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 2,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'cardX',
          typename: 'CardBlock',
          parentBlockId: 'stepX',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typographyX',
          typename: 'TypographyBlock',
          parentBlockId: 'cardX',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Disconnected Heading'
        },
        {
          id: 'blockC',
          typename: 'TextResponseBlock',
          parentBlockId: 'cardX',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ] as unknown as SelectedJourneyBlock[]
    })
    // Headers should include only A and B by default (C excluded)
    evFM.mockResolvedValueOnce([
      { blockId: 'blockA', label: 'Question A' },
      { blockId: 'blockB', label: 'Question B' }
    ])
    jvFM.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-02-01T00:00:00Z'),
        events: [
          {
            blockId: 'blockA',
            label: 'Question A',
            value: 'Alice',
            typename: 'TextResponseSubmissionEvent'
          },
          {
            blockId: 'blockB',
            label: 'Question B',
            value: 'Bob',
            typename: 'TextResponseSubmissionEvent'
          }
        ]
      }
    ])
    const resultDefault = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })
    expect(resultDefault).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Question A","Question B"\n"2024-02-01","Alice","Bob"\n'
    )

    // Now include unconnected cards; headers should include C as well
    // Re-mock journey for a second resolver call
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
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
          content: 'Step 1 Heading'
        },
        {
          id: 'blockA',
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
          parentOrder: 1,
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
          content: 'Step 2 Heading'
        },
        {
          id: 'blockB',
          typename: 'TextResponseBlock',
          parentBlockId: 'card2',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'stepX',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 2,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'cardX',
          typename: 'CardBlock',
          parentBlockId: 'stepX',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'typographyX',
          typename: 'TypographyBlock',
          parentBlockId: 'cardX',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Disconnected Heading'
        },
        {
          id: 'blockC',
          typename: 'TextResponseBlock',
          parentBlockId: 'cardX',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ] as unknown as SelectedJourneyBlock[]
    })
    evFM.mockResolvedValueOnce([
      { blockId: 'blockA', label: 'Question A' },
      { blockId: 'blockB', label: 'Question B' },
      { blockId: 'blockC', label: 'Question C' }
    ])
    jvFM.mockResolvedValueOnce([
      {
        id: 'jv2',
        createdAt: new Date('2024-02-02T00:00:00Z'),
        events: [
          {
            blockId: 'blockA',
            label: 'Question A',
            value: 'Ann',
            typename: 'TextResponseSubmissionEvent'
          },
          {
            blockId: 'blockB',
            label: 'Question B',
            value: 'Ben',
            typename: 'TextResponseSubmissionEvent'
          },
          {
            blockId: 'blockC',
            label: 'Question C',
            value: 'Cat',
            typename: 'TextResponseSubmissionEvent'
          }
        ]
      }
    ])
    const resultInclude = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: {
        journeyId: 'journey1',
        filter: { includeUnconnectedCards: true }
      }
    })
    expect(resultInclude).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Question A","Question B","Question C"\n"2024-02-02","Ann","Ben","Cat"\n'
    )
  })

  it('excludes deleted blocks from headers', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        {
          id: 'step1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
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
          id: 'typ1',
          typename: 'TypographyBlock',
          parentBlockId: 'card1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Heading'
        },
        // non-deleted block (kept)
        {
          id: 'blockAlive',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        // deleted block (should be excluded)
        {
          id: 'blockDeleted',
          typename: 'TextResponseBlock',
          parentBlockId: 'card1',
          parentOrder: 2,
          nextBlockId: null,
          action: null,
          content: null,
          deletedAt: new Date('2024-01-01T00:00:00Z')
        }
      ] as unknown as SelectedJourneyBlock[]
    })
    // Only alive block should be returned by header query based on server where
    evFM.mockResolvedValueOnce([{ blockId: 'blockAlive', label: 'Alive Q' }])
    jvFM.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-03-01T00:00:00Z'),
        events: [
          {
            blockId: 'blockAlive',
            label: 'Alive Q',
            value: 'A',
            typename: 'TextResponseSubmissionEvent'
          }
        ]
      }
    ])
    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Alive Q"\n"2024-03-01","A"\n'
    )
  })

  it('orders columns using renderer tree order (parentOrder/pre-order)', async () => {
    jf.mockResolvedValueOnce({
      id: 'journey1',
      team: { userTeams: [{ userId: mockUser.id, role: 'manager' }] },
      userJourneys: [],
      blocks: [
        // root steps in order
        {
          id: 's1',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 's2',
          typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        // s1 children: card, then blocks a,b
        {
          id: 'c1',
          typename: 'CardBlock',
          parentBlockId: 's1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'h1',
          typename: 'TypographyBlock',
          parentBlockId: 'c1',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Card 1'
        },
        {
          id: 'a',
          typename: 'TextResponseBlock',
          parentBlockId: 'c1',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'b',
          typename: 'TextResponseBlock',
          parentBlockId: 'c1',
          parentOrder: 2,
          nextBlockId: null,
          action: null,
          content: null
        },
        // s2 children: card, then block c
        {
          id: 'c2',
          typename: 'CardBlock',
          parentBlockId: 's2',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: null
        },
        {
          id: 'h2',
          typename: 'TypographyBlock',
          parentBlockId: 'c2',
          parentOrder: 0,
          nextBlockId: null,
          action: null,
          content: 'Card 2'
        },
        {
          id: 'c',
          typename: 'TextResponseBlock',
          parentBlockId: 'c2',
          parentOrder: 1,
          nextBlockId: null,
          action: null,
          content: null
        }
      ] as unknown as SelectedJourneyBlock[]
    })
    // events for b,a,c (intentionally out of order to test sort)
    evFM.mockResolvedValueOnce([
      { blockId: 'b', label: 'Label B' },
      { blockId: 'a', label: 'Label A' },
      { blockId: 'c', label: 'Label C' }
    ])
    jvFM.mockResolvedValueOnce([
      {
        id: 'jv1',
        createdAt: new Date('2024-04-01T00:00:00Z'),
        events: [
          {
            blockId: 'b',
            label: 'Label B',
            value: 'BV',
            typename: 'TextResponseSubmissionEvent'
          },
          {
            blockId: 'a',
            label: 'Label A',
            value: 'AV',
            typename: 'TextResponseSubmissionEvent'
          },
          {
            blockId: 'c',
            label: 'Label C',
            value: 'CV',
            typename: 'TextResponseSubmissionEvent'
          }
        ]
      }
    ])
    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_QUERY,
      variables: { journeyId: 'journey1' }
    })
    // Expected order: a, b (under Card 1), then c (under Card 2)
    // Single header row with labels (non-Poll/Multiselect types)
    expect(result).toHaveProperty(
      'data.journeyVisitorExport',
      '"Date","Label A","Label B","Label C"\n"2024-04-01","AV","BV","CV"\n'
    )
  })
})
