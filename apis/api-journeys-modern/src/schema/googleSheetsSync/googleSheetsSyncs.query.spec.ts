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

describe('googleSheetsSyncs', () => {
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

  const GOOGLE_SHEETS_SYNCS_QUERY = graphql(`
    query GoogleSheetsSyncs($filter: GoogleSheetsSyncsFilter!) {
      googleSheetsSyncs(filter: $filter) {
        id
        journeyId
        integrationId
        spreadsheetId
        sheetName
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockAbility.mockReturnValue(true)
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    // Default: user is member of any team for membership checks
    prismaMock.userTeam.findFirst.mockResolvedValue({ id: 'ut-1' } as any)
  })

  describe('filter by journeyId', () => {
    it('should return syncs for journey when user has export permission', async () => {
      const mockJourney = {
        id: 'journey-id',
        teamId: 'team-id',
        team: {
          id: 'team-id',
          userTeams: []
        }
      }

      const mockSyncs = [
        {
          id: 'sync-1',
          journeyId: 'journey-id',
          integrationId: 'integration-1',
          spreadsheetId: 'spreadsheet-1',
          sheetName: 'Sheet1',
          deletedAt: null
        },
        {
          id: 'sync-2',
          journeyId: 'journey-id',
          integrationId: 'integration-2',
          spreadsheetId: 'spreadsheet-2',
          sheetName: 'Sheet2',
          deletedAt: null
        }
      ]

      prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
      prismaMock.googleSheetsSync.findMany.mockResolvedValue(mockSyncs as any)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            journeyId: 'journey-id'
          }
        }
      })

      expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
        where: { id: 'journey-id' },
        include: { team: { include: { userTeams: true } } }
      })

      expect(mockAbility).toHaveBeenCalledWith(
        Action.Export,
        { subject: 'Journey', object: mockJourney },
        expect.objectContaining({ id: 'userId' })
      )

      // prismaField spreads query parameter
      expect(prismaMock.googleSheetsSync.findMany).toHaveBeenCalled()
      const findManyCall = (prismaMock.googleSheetsSync.findMany as jest.Mock)
        .mock.calls[0][0]
      expect(findManyCall).toMatchObject({
        where: { journeyId: 'journey-id' },
        orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
      })

      expect(result).toEqual({
        data: {
          googleSheetsSyncs: expect.arrayContaining([
            expect.objectContaining({
              id: 'sync-1',
              journeyId: 'journey-id'
            }),
            expect.objectContaining({
              id: 'sync-2',
              journeyId: 'journey-id'
            })
          ])
        }
      })
    })

    it('should throw error when journey is not found', async () => {
      prismaMock.journey.findUnique.mockResolvedValue(null)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            journeyId: 'non-existent-journey'
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
      const mockJourney = {
        id: 'journey-id',
        teamId: 'team-id',
        team: {
          id: 'team-id',
          userTeams: []
        }
      }

      prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
      mockAbility.mockReturnValue(false)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            journeyId: 'journey-id'
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
  })

  describe('filter by integrationId', () => {
    it('should return syncs for integration when user is owner', async () => {
      const mockIntegration = {
        id: 'integration-id',
        userId: 'userId',
        teamId: 'team-id',
        team: {
          id: 'team-id',
          userTeams: []
        }
      }

      const mockSyncs = [
        {
          id: 'sync-1',
          journeyId: 'journey-1',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-1',
          sheetName: 'Sheet1',
          deletedAt: null
        }
      ]

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      prismaMock.googleSheetsSync.findMany.mockResolvedValue(mockSyncs as any)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            integrationId: 'integration-id'
          }
        }
      })

      expect(prismaMock.integration.findUnique).toHaveBeenCalledWith({
        where: { id: 'integration-id' },
        include: { team: { include: { userTeams: true } } }
      })

      // Check result first to see if there's an error
      expect(result).toEqual({
        data: {
          googleSheetsSyncs: expect.arrayContaining([
            expect.objectContaining({
              id: 'sync-1',
              integrationId: 'integration-id'
            })
          ])
        }
      })

      // prismaField spreads query parameter
      expect(prismaMock.googleSheetsSync.findMany).toHaveBeenCalled()
      const findManyCall = (prismaMock.googleSheetsSync.findMany as jest.Mock)
        .mock.calls[0][0]
      expect(findManyCall).toMatchObject({
        where: { integrationId: 'integration-id' },
        orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
      })
    })

    it('should return syncs for integration when user is team manager', async () => {
      const mockIntegration = {
        id: 'integration-id',
        userId: 'other-user-id',
        teamId: 'team-id',
        team: {
          id: 'team-id',
          userTeams: [
            {
              userId: 'userId',
              role: 'manager'
            }
          ]
        }
      }
      // Membership check
      prismaMock.userTeam.findFirst.mockResolvedValue({
        teamId: 'team-id',
        userId: 'userId',
        role: 'manager'
      } as any)

      const mockSyncs = [
        {
          id: 'sync-1',
          journeyId: 'journey-1',
          integrationId: 'integration-id',
          spreadsheetId: 'spreadsheet-1',
          sheetName: 'Sheet1',
          deletedAt: null
        }
      ]

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      prismaMock.googleSheetsSync.findMany.mockResolvedValue(mockSyncs as any)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            integrationId: 'integration-id'
          }
        }
      })

      expect(result).toEqual({
        data: {
          googleSheetsSyncs: expect.arrayContaining([
            expect.objectContaining({
              id: 'sync-1'
            })
          ])
        }
      })
    })

    it('should throw error when integration is not found', async () => {
      prismaMock.integration.findUnique.mockResolvedValue(null)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            integrationId: 'non-existent-integration'
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

    it('should throw error when user is neither owner nor team manager', async () => {
      const mockIntegration = {
        id: 'integration-id',
        userId: 'other-user-id',
        teamId: 'team-id',
        team: {
          id: 'team-id',
          userTeams: [
            {
              userId: 'other-user-id',
              role: 'member'
            }
          ]
        }
      }

      prismaMock.integration.findUnique.mockResolvedValue(
        mockIntegration as any
      )
      // Not in team
      prismaMock.userTeam.findFirst.mockResolvedValue(null)

      const result = await authClient({
        document: GOOGLE_SHEETS_SYNCS_QUERY,
        variables: {
          filter: {
            integrationId: 'integration-id'
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
  })

  it('should throw error when neither journeyId nor integrationId is provided', async () => {
    const result = await authClient({
      document: GOOGLE_SHEETS_SYNCS_QUERY,
      variables: {
        filter: {}
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'At least journeyId or integrationId must be provided'
        })
      ]
    })
  })

  it('should return syncs when both journeyId and integrationId are provided', async () => {
    const mockJourney = {
      id: 'journey-id',
      teamId: 'team-id',
      team: { id: 'team-id', userTeams: [] }
    }
    const mockIntegration = {
      id: 'integration-id',
      teamId: 'team-id',
      team: { id: 'team-id', userTeams: [] }
    }
    const mockSyncs = [
      {
        id: 'sync-1',
        journeyId: 'journey-id',
        integrationId: 'integration-id',
        spreadsheetId: 'spreadsheet-1',
        sheetName: 'Sheet1',
        deletedAt: null
      }
    ]
    prismaMock.journey.findUnique.mockResolvedValue(mockJourney as any)
    prismaMock.integration.findUnique.mockResolvedValue(mockIntegration as any)
    prismaMock.googleSheetsSync.findMany.mockResolvedValue(mockSyncs as any)

    const result = await authClient({
      document: GOOGLE_SHEETS_SYNCS_QUERY,
      variables: {
        filter: {
          journeyId: 'journey-id',
          integrationId: 'integration-id'
        }
      }
    })

    expect(prismaMock.googleSheetsSync.findMany).toHaveBeenCalled()
    const findManyCall = (prismaMock.googleSheetsSync.findMany as jest.Mock)
      .mock.calls[0][0]
    expect(findManyCall).toMatchObject({
      where: { journeyId: 'journey-id', integrationId: 'integration-id' },
      orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
    })
    expect(result).toEqual({
      data: {
        googleSheetsSyncs: expect.arrayContaining([
          expect.objectContaining({ id: 'sync-1' })
        ])
      }
    })
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    // When user is null, it throws before checking journey
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await unauthClient({
      document: GOOGLE_SHEETS_SYNCS_QUERY,
      variables: {
        filter: {
          journeyId: 'journey-id'
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
})
