import axios, { isAxiosError } from 'axios'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { ability } from '../../lib/auth/ability'

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

describe('journeysPlausibleStatsRealtimeVisitors', () => {
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
    query JourneysPlausibleStatsRealtimeVisitors($id: ID!, $idType: IdType) {
      journeysPlausibleStatsRealtimeVisitors(id: $id, idType: $idType)
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
    mockAxios.get.mockResolvedValue({ data: 7 } as any)
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns realtime visitors for a slug', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      slug: 'journey-slug',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'journey-slug', idType: 'slug' }
    })

    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { slug: 'journey-slug' },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } }
      }
    })
    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://plausible.example/api/v1/stats/realtime/visitors',
      {
        headers: { Authorization: 'Bearer plausible-key' },
        params: { site_id: 'api-journeys-journey-journey-id' }
      }
    )
    expect(result).toEqual({
      data: {
        journeysPlausibleStatsRealtimeVisitors: 7
      }
    })
  })

  it('builds database filter when idType is databaseId', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      slug: null,
      userJourneys: [],
      team: { userTeams: [] }
    } as any)

    await authClient({
      document: QUERY,
      variables: { id: 'journey-id', idType: 'databaseId' }
    })

    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith({
      where: { id: 'journey-id' },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } }
      }
    })
  })

  it('returns error when journey is not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'missing', idType: 'slug' }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsRealtimeVisitors: null },
      errors: [
        expect.objectContaining({
          message: 'Journey not found'
        })
      ]
    })
  })

  it('returns error when user cannot view the journey', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockAbility.mockReturnValueOnce(false)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'journey-id', idType: 'databaseId' }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsRealtimeVisitors: null },
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
        })
      ]
    })
  })

  it('returns error when Plausible env vars are missing', async () => {
    delete process.env.PLAUSIBLE_URL
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'journey-id', idType: 'databaseId' }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsRealtimeVisitors: null },
      errors: [
        expect.objectContaining({
          message: 'Plausible is not configured'
        })
      ]
    })
  })

  it('propagates Plausible API errors', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      message: 'Invalid site id',
      response: { data: 'Invalid site id' }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: { id: 'journey-id', idType: 'databaseId' }
    })

    expect(result).toEqual({
      data: { journeysPlausibleStatsRealtimeVisitors: null },
      errors: [
        expect.objectContaining({
          message: 'Invalid site id'
        })
      ]
    })
  })
})

