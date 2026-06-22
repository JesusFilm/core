import axios, { isAxiosError } from 'axios'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { ability } from '../../lib/auth/ability'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('axios')
vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('../../lib/auth/ability', () => ({
  Action: {
    Update: 'update'
  },
  ability: vi.fn(),
  subject: vi.fn((_type, object) => ({ subject: _type, object }))
}))

const mockAxios = axios as Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as unknown as MockedFunction<
  typeof isAxiosError
>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockAbility = ability as MockedFunction<typeof ability>

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
    vi.clearAllMocks()
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
      data: null,
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
      data: null,
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
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
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Invalid site id'
        })
      ]
    })
  })
})
