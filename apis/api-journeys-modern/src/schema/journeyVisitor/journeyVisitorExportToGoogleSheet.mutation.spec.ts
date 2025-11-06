import { format } from 'date-fns'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { getIntegrationGoogleAccessToken } from '../../lib/google/googleAuth'
import {
  createSpreadsheet,
  ensureSheet,
  readValues,
  writeValues
} from '../../lib/google/sheets'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

jest.mock('../../lib/auth/ability', () => ({
  Action: {
    Export: 'export'
  },
  ability: jest.fn(),
  subject: jest.fn((type, object) => ({ subject: type, object }))
}))

jest.mock('../../lib/google/googleAuth', () => ({
  getIntegrationGoogleAccessToken: jest.fn()
}))

jest.mock('../../lib/google/sheets', () => ({
  createSpreadsheet: jest.fn(),
  ensureSheet: jest.fn(),
  readValues: jest.fn(),
  writeValues: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

const mockAbility = ability as jest.MockedFunction<typeof ability>
const mockGetIntegrationGoogleAccessToken =
  getIntegrationGoogleAccessToken as jest.MockedFunction<
    typeof getIntegrationGoogleAccessToken
  >
const mockCreateSpreadsheet = createSpreadsheet as jest.MockedFunction<
  typeof createSpreadsheet
>
const mockEnsureSheet = ensureSheet as jest.MockedFunction<typeof ensureSheet>
const mockReadValues = readValues as jest.MockedFunction<typeof readValues>
const mockWriteValues = writeValues as jest.MockedFunction<typeof writeValues>

describe('journeyVisitorExportToGoogleSheet', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION = graphql(`
    mutation JourneyVisitorExportToGoogleSheet(
      $journeyId: ID!
      $filter: JourneyEventsFilter
      $select: JourneyVisitorExportSelect
      $destination: JourneyVisitorGoogleSheetDestinationInput!
      $integrationId: ID!
    ) {
      journeyVisitorExportToGoogleSheet(
        journeyId: $journeyId
        filter: $filter
        select: $select
        destination: $destination
        integrationId: $integrationId
      ) {
        spreadsheetId
        spreadsheetUrl
        sheetName
      }
    }
  `)

  const mockJourney = {
    id: 'journey-id',
    title: 'Test Journey',
    slug: 'test-journey',
    teamId: 'team-id',
    team: {
      id: 'team-id',
      userTeams: [{ userId: 'userId', role: 'manager' }]
    },
    userJourneys: [],
    blocks: [{ id: 'block-1' }, { id: 'block-2' }]
  }

  const mockIntegration = {
    id: 'integration-id',
    accountEmail: 'test@example.com'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAbility.mockReturnValue(true)
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    mockGetIntegrationGoogleAccessToken.mockResolvedValue({
      accessToken: 'access-token',
      accountEmail: 'test@example.com'
    })
  })

  it('should create new spreadsheet and export visitors', async () => {
    const mockBlockHeaders = [
      { blockId: 'block-1', label: 'Button Click' },
      { blockId: 'block-2', label: 'Text Response' }
    ]

    const mockJourneyVisitors = [
      {
        id: 'jv-1',
        createdAt: new Date('2024-01-01'),
        visitor: {
          id: 'visitor-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        events: [
          {
            blockId: 'block-1',
            label: 'Button Click',
            value: 'Submit'
          }
        ]
      }
    ]

    const mockSpreadsheet = {
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue(mockBlockHeaders as any)
    prismaMock.journeyVisitor.findMany.mockResolvedValue(
      mockJourneyVisitors as any
    )
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      ...mockSpreadsheet,
      sheetName: '2024-01-01 test-journey'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue(mockSpreadsheet)
    mockReadValues.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test Journey Visitors',
          folderId: 'folder-id',
          sheetName: '2024-01-01 test-journey'
        }
      }
    })

    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: 'journey-id' },
      include: {
        team: { include: { userTeams: true } },
        userJourneys: true,
        blocks: { select: { id: true }, orderBy: { updatedAt: 'asc' } }
      }
    })

    expect(mockAbility).toHaveBeenCalledWith(
      Action.Export,
      { subject: 'Journey', object: mockJourney },
      mockUser
    )

    expect(mockGetIntegrationGoogleAccessToken).toHaveBeenCalledWith(
      'integration-id'
    )

    expect(mockCreateSpreadsheet).toHaveBeenCalledWith({
      accessToken: 'access-token',
      title: 'Test Journey Visitors',
      folderId: 'folder-id',
      initialSheetTitle: '2024-01-01 test-journey'
    })

    expect(mockWriteValues).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        spreadsheetId: 'spreadsheet-id',
        sheetTitle: '2024-01-01 test-journey',
        values: expect.arrayContaining([
          expect.arrayContaining([
            'visitorId',
            'createdAt',
            'name',
            'email',
            'phone',
            'block-1-Button Click',
            'block-2-Text Response'
          ])
        ]),
        append: false
      })
    )

    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith({
      data: {
        teamId: 'team-id',
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: '2024-01-01 test-journey',
        folderId: 'folder-id',
        email: 'test@example.com',
        deletedAt: null
      }
    })

    expect(result).toEqual({
      data: {
        journeyVisitorExportToGoogleSheet: {
          spreadsheetId: 'spreadsheet-id',
          spreadsheetUrl:
            'https://docs.google.com/spreadsheets/d/spreadsheet-id',
          sheetName: '2024-01-01 test-journey'
        }
      }
    })
  })

  it('should export to existing spreadsheet', async () => {
    const mockBlockHeaders = [{ blockId: 'block-1', label: 'Button Click' }]

    const mockJourneyVisitors = [
      {
        id: 'jv-1',
        createdAt: new Date('2024-01-01'),
        visitor: {
          id: 'visitor-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: null
        },
        events: []
      }
    ]

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue(mockBlockHeaders as any)
    prismaMock.journeyVisitor.findMany.mockResolvedValue(
      mockJourneyVisitors as any
    )
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'existing-spreadsheet-id',
      sheetName: 'Sheet1'
    } as any)
    mockReadValues.mockResolvedValueOnce([
      ['visitorId', 'createdAt', 'name', 'email', 'phone', 'Custom Field']
    ])
    mockEnsureSheet.mockResolvedValue(undefined)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'existing',
          spreadsheetId: 'existing-spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(mockCreateSpreadsheet).not.toHaveBeenCalled()
    expect(mockEnsureSheet).toHaveBeenCalledWith({
      accessToken: 'access-token',
      spreadsheetId: 'existing-spreadsheet-id',
      sheetTitle: 'Sheet1'
    })

    expect(mockReadValues).toHaveBeenCalledWith({
      accessToken: 'access-token',
      spreadsheetId: 'existing-spreadsheet-id',
      range: 'Sheet1!A1:ZZ1'
    })

    expect(result).toEqual({
      data: {
        journeyVisitorExportToGoogleSheet: {
          spreadsheetId: 'existing-spreadsheet-id',
          spreadsheetUrl:
            'https://docs.google.com/spreadsheets/d/existing-spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })
  })

  it('should use default sheet name when not provided', async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const expectedSheetName = `${today} test-journey`.trim()

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: expectedSheetName
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })
    mockReadValues.mockResolvedValue([])

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test Journey Visitors'
        }
      }
    })

    expect(mockCreateSpreadsheet).toHaveBeenCalledWith(
      expect.objectContaining({
        initialSheetTitle: expectedSheetName
      })
    )
  })

  it('should throw error when journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'non-existent-journey',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Journey not found'
        })
      ]
    })
  })

  it('should throw error when user lacks export permission', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to export visitors'
        })
      ]
    })
  })

  it('should throw error when integration is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'non-existent-integration',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Integration not found'
        })
      ]
    })
  })

  it('should throw error when spreadsheetId is missing in existing mode', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'existing',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'spreadsheetId is required for existing mode'
        })
      ]
    })
  })

  it('should throw error when sync already exists', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue({
      id: 'existing-sync-id'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })
    mockReadValues.mockResolvedValue([])

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message:
            'A sync already exists for this journey, spreadsheet, and sheet combination'
        })
      ]
    })
  })

  it('should filter events by typenames when provided', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: 'Sheet1'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })
    mockReadValues.mockResolvedValue([])

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        filter: {
          typenames: ['ButtonClickEvent', 'TextResponseSubmissionEvent']
        },
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        typename: { in: ['ButtonClickEvent', 'TextResponseSubmissionEvent'] }
      }),
      select: { blockId: true, label: true },
      distinct: ['blockId', 'label']
    })
  })

  it('should filter events by date range when provided', async () => {
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: 'Sheet1'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })
    mockReadValues.mockResolvedValue([])

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        filter: {
          periodRangeStart: startDate.toISOString(),
          periodRangeEnd: endDate.toISOString()
        },
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }),
      select: { blockId: true, label: true },
      distinct: ['blockId', 'label']
    })
  })

  it('should respect select options', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.findMany.mockResolvedValue([])
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: 'Sheet1'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })
    mockReadValues.mockResolvedValue([])

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        select: {
          createdAt: false,
          name: false,
          email: false,
          phone: false
        },
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test'
        }
      }
    })

    expect(mockWriteValues).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.arrayContaining([expect.arrayContaining(['visitorId'])])
      })
    )
  })
})
