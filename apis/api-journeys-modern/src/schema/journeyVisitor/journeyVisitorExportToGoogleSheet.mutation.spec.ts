import { format } from 'date-fns'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
import { getIntegrationGoogleAccessToken } from '../../lib/google/googleAuth'
import { createSpreadsheet, ensureSheet } from '../../lib/google/sheets'
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
  ensureSheet: jest.fn()
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

  // Updated mutation - no longer accepts filter and select args
  // Data writing is now handled asynchronously by the worker
  const JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION = graphql(`
    mutation JourneyVisitorExportToGoogleSheet(
      $journeyId: ID!
      $destination: JourneyVisitorGoogleSheetDestinationInput!
      $integrationId: ID!
      $timezone: String
    ) {
      journeyVisitorExportToGoogleSheet(
        journeyId: $journeyId
        destination: $destination
        integrationId: $integrationId
        timezone: $timezone
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
    userJourneys: []
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

  it('should create new spreadsheet and enqueue export job', async () => {
    const mockSpreadsheet = {
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      ...mockSpreadsheet,
      sheetName: '2024-01-01 test-journey'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue(mockSpreadsheet)

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
        userJourneys: true
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

    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith({
      data: {
        teamId: 'team-id',
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        spreadsheetId: 'spreadsheet-id',
        sheetName: '2024-01-01 test-journey',
        folderId: 'folder-id',
        email: 'test@example.com',
        timezone: 'UTC',
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
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'existing-spreadsheet-id',
      sheetName: 'Sheet1'
    } as any)
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

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test Journey Visitors',
          folderId: 'folder-id'
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
          message: 'spreadsheetId is required when mode is "existing"'
        })
      ]
    })
  })

  it('should throw error when sheetName is missing in existing mode', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'existing',
          spreadsheetId: 'spreadsheet-id'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'sheetName is required when mode is "existing"'
        })
      ]
    })
  })

  it('should throw error when spreadsheetTitle is missing in create mode', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          folderId: 'folder-id'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'spreadsheetTitle is required when mode is "create"'
        })
      ]
    })
  })

  it('should create spreadsheet in root when folderId is missing in create mode', async () => {
    const mockSpreadsheet = {
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    }
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: `${format(new Date(), 'yyyy-MM-dd')} ${mockJourney.slug}`
    } as any)
    mockCreateSpreadsheet.mockResolvedValue(mockSpreadsheet)

    const result = await authClient({
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
        title: 'Test Journey Visitors',
        folderId: undefined
      })
    )
    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          folderId: null
        })
      })
    )
    expect(result).toHaveProperty('data.journeyVisitorExportToGoogleSheet')
  })

  it('should throw error when spreadsheetTitle is empty string in create mode', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: '   ',
          folderId: 'folder-id'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'spreadsheetTitle is required when mode is "create"'
        })
      ]
    })
  })

  it('should throw error when sheetName is empty string in existing mode', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'existing',
          spreadsheetId: 'spreadsheet-id',
          sheetName: '   '
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'sheetName is required when mode is "existing"'
        })
      ]
    })
  })

  it('should throw error when sync already exists', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue({
      id: 'existing-sync-id'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue({
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    })

    const result = await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test',
          sheetName: 'Sheet1',
          folderId: 'folder-id'
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

  it('should use provided timezone', async () => {
    const mockSpreadsheet = {
      spreadsheetId: 'spreadsheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/spreadsheet-id'
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findFirst.mockResolvedValue(null)
    prismaMock.googleSheetsSync.create.mockResolvedValue({
      id: 'sync-id',
      ...mockSpreadsheet,
      sheetName: 'Sheet1'
    } as any)
    mockCreateSpreadsheet.mockResolvedValue(mockSpreadsheet)

    await authClient({
      document: JOURNEY_VISITOR_EXPORT_TO_GOOGLE_SHEET_MUTATION,
      variables: {
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        timezone: 'Pacific/Auckland',
        destination: {
          mode: 'create',
          spreadsheetTitle: 'Test',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        timezone: 'Pacific/Auckland'
      })
    })
  })
})
