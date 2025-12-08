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

describe('journeysPlausibleStatsAggregate', () => {
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
    query JourneysPlausibleStatsAggregate(
      $id: ID!
      $idType: IdType
      $where: PlausibleStatsAggregateFilter!
    ) {
      journeysPlausibleStatsAggregate(id: $id, idType: $idType, where: $where) {
        visitors {
          value
          change
        }
        events {
          value
        }
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
        results: {
          visitors: { value: 42, change: 10 },
          events: { value: 3 }
        }
      }
    } as any)
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns aggregate stats using derived metrics', async () => {
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
        where: { period: '30d' }
      }
    })

    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://plausible.example/api/v1/stats/aggregate',
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-journey-journey-id',
          metrics: 'visitors,events',
          period: '30d'
        })
      })
    )

    expect(result).toEqual({
      data: {
        journeysPlausibleStatsAggregate: {
          visitors: { value: 42, change: 10 },
          events: { value: 3 }
        }
      }
    })
  })

  it('returns error when journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'missing-id', idType: 'slug', where: {} }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsAggregate: null },
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
      variables: { id: 'journey-id', idType: 'databaseId', where: {} }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsAggregate: null },
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
        })
      ]
    })
  })

  it('returns Plausible error message when request fails', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid filters' } }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'journey-id', where: {} }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsAggregate: null },
      errors: [
        expect.objectContaining({
          message: 'Invalid filters'
        })
      ]
    })
  })
})
