import axios, { isAxiosError } from 'axios'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('axios')
jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))
jest.mock('../../lib/auth/ability', () => ({
  Action: {
    Update: 'update'
  },
  ability: jest.fn(),
  subject: jest.fn((_type, object) => ({ subject: _type, object }))
}))

const mockAxios = axios as jest.Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as jest.MockedFunction<
  typeof isAxiosError
>
const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>
const mockAbility = ability as jest.MockedFunction<typeof ability>

describe('journeysPlausibleStatsBreakdown', () => {
  const originalEnv = process.env
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

  const QUERY = graphql(`
    query JourneysPlausibleStatsBreakdown(
      $id: ID!
      $idType: IdType
      $where: PlausibleStatsBreakdownFilter!
    ) {
      journeysPlausibleStatsBreakdown(id: $id, idType: $idType, where: $where) {
        property
        visitors
        events
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      PLAUSIBLE_URL: 'https://plausible.example',
      PLAUSIBLE_API_KEY: 'plausible-key'
    }
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    mockAbility.mockReturnValue(true)
    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            goal: 'event-name',
            visitors: 10,
            events: 5
          }
        ]
      }
    } as any)
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns breakdown stats for a journey', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'journey-id',
        idType: 'databaseId',
        where: {
          property: 'event:goal'
        }
      }
    })

    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://plausible.example/api/v1/stats/breakdown',
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-journey-journey-id',
          property: 'event:goal',
          metrics: 'visitors,events'
        })
      })
    )

    expect(result).toEqual({
      data: {
        journeysPlausibleStatsBreakdown: [
          {
            property: 'event-name',
            visitors: 10,
            events: 5
          }
        ]
      }
    })
  })

  it('returns error when journey not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'missing', where: { property: 'event:goal' } }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'Journey not found'
        })
      ]
    })
  })

  it('returns error when user cannot view journey', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockAbility.mockReturnValueOnce(false)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'journey-id',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
        })
      ]
    })
  })

  it('returns error when env vars missing', async () => {
    delete process.env.PLAUSIBLE_URL
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'journey-id',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'Plausible is not configured'
        })
      ]
    })
  })

  it('returns Plausible error message on API failure', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid property' } }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'journey-id',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'Invalid property'
        })
      ]
    })
  })
})
