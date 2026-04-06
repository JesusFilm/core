import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { Action, ability } from '../../lib/auth/ability'
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

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>
const mockAbility = ability as jest.MockedFunction<typeof ability>

describe('googleSheetsSyncCreate', () => {
  const mockUser = { id: 'userId', email: 'test@example.com' }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const GOOGLE_SHEETS_SYNC_CREATE_MUTATION = graphql(`
    mutation GoogleSheetsSyncCreate($input: CreateGoogleSheetsSyncInput!) {
      googleSheetsSyncCreate(input: $input) {
        id
        journeyId
        spreadsheetId
        sheetName
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    mockAbility.mockReturnValue(true)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    // Default auth: user is integration owner for provided integrationId
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-id',
      userId: 'userId'
    } as any)
  })

  it('should create Google Sheets sync', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: {
        id: 'team-id',
        integrations: [],
        userTeams: []
      }
    }

    const mockIntegration = {
      id: 'integration-id',
      userId: 'userId',
      teamId: 'team-id',
      type: 'google' as const,
      accountEmail: 'test@example.com'
    }

    const mockSync = {
      id: 'sync-id',
      journeyId: 'journey-id',
      teamId: 'team-id',
      integrationId: 'integration-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: 'Sheet1',
      folderId: null,
      email: 'test@example.com',
      deletedAt: null
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.create.mockResolvedValue(mockSync as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: 'journey-id' },
      include: {
        team: { include: { integrations: true, userTeams: true } }
      }
    })

    expect(prismaMock.integration.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'integration-id',
        teamId: 'team-id',
        type: 'google'
      }
    })

    // Ability check happens after integration check
    expect(mockAbility).toHaveBeenCalledWith(
      Action.Export,
      { subject: 'Journey', object: mockJourney },
      expect.objectContaining({ id: mockUser.id })
    )

    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          teamId: 'team-id',
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1',
          folderId: null,
          email: 'test@example.com',
          deletedAt: null
        }
      })
    )

    expect(result).toEqual({
      data: {
        googleSheetsSyncCreate: expect.objectContaining({
          id: 'sync-id',
          journeyId: 'journey-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        })
      }
    })
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    // When user is null, journey lookup still happens but returns null
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await unauthClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })

  it('should throw error when journey is not found', async () => {
    mockGetUserFromPayload.mockReturnValue(mockUser as any)
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'non-existent-journey',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
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

  it('should throw error when Google integration is not found', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: {
        id: 'team-id',
        integrations: [],
        userTeams: []
      }
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'non-existent-integration',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Google integration not found for team'
        })
      ]
    })
  })

  it('should throw error when user is not the integration owner', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: {
        id: 'team-id',
        integrations: [],
        userTeams: []
      }
    }

    const mockIntegration = {
      id: 'integration-id',
      userId: 'other-user-id',
      teamId: 'team-id',
      type: 'google' as const
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
    // Auth guard denies ownership
    prismaMock.integration.findUnique.mockResolvedValue({
      id: 'integration-id',
      userId: 'other-user-id'
    } as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })

  it('should throw error when user lacks export permission', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: {
        id: 'team-id',
        integrations: [],
        userTeams: []
      }
    }

    const mockIntegration = {
      id: 'integration-id',
      userId: 'userId',
      teamId: 'team-id',
      type: 'google' as const,
      accountEmail: 'test@example.com'
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
    mockAbility.mockReturnValue(false)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Forbidden'
        })
      ]
    })
  })

  it('should include folderId when provided', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: {
        id: 'team-id',
        integrations: [],
        userTeams: []
      }
    }

    const mockIntegration = {
      id: 'integration-id',
      userId: 'userId',
      teamId: 'team-id',
      type: 'google' as const,
      accountEmail: 'test@example.com'
    }

    const mockSync = {
      id: 'sync-id',
      journeyId: 'journey-id',
      teamId: 'team-id',
      integrationId: 'integration-id',
      spreadsheetId: 'spreadsheet-id',
      sheetName: 'Sheet1',
      folderId: 'folder-id',
      email: 'test@example.com',
      deletedAt: null
    }

    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findFirst.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.create.mockResolvedValue(mockSync as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNC_CREATE_MUTATION,
      variables: {
        input: {
          journeyId: 'journey-id',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Sheet1',
          folderId: 'folder-id'
        }
      }
    })

    expect(prismaMock.googleSheetsSync.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          folderId: 'folder-id'
        })
      })
    )

    expect(result).toHaveProperty('data.googleSheetsSyncCreate')
  })
})
