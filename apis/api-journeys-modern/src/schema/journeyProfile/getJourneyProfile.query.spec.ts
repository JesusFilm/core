import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('getJourneyProfile', () => {
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

  const GET_JOURNEY_PROFILE_QUERY = graphql(`
    query GetJourneyProfile {
      getJourneyProfile {
        id
        userId
        acceptedTermsAt
        lastActiveTeamId
        journeyFlowBackButtonClicked
        plausibleJourneyFlowViewed
        plausibleDashboardViewed
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return journey profile when user is authenticated', async () => {
    const profile = {
      id: 'profileId',
      userId: 'userId',
      acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z'),
      lastActiveTeamId: null,
      journeyFlowBackButtonClicked: null,
      plausibleJourneyFlowViewed: null,
      plausibleDashboardViewed: null
    }

    prismaMock.journeyProfile.findUnique.mockResolvedValue(profile)

    const result = await authClient({
      document: GET_JOURNEY_PROFILE_QUERY
    })

    expect(result).toEqual({
      data: {
        getJourneyProfile: {
          id: 'profileId',
          userId: 'userId',
          acceptedTermsAt: '2021-02-18T00:00:00.000Z',
          lastActiveTeamId: null,
          journeyFlowBackButtonClicked: null,
          plausibleJourneyFlowViewed: null,
          plausibleDashboardViewed: null
        }
      }
    })

    expect(prismaMock.journeyProfile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'userId' }
      })
    )
  })

  it('should return null when profile does not exist', async () => {
    prismaMock.journeyProfile.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: GET_JOURNEY_PROFILE_QUERY
    })

    expect(result).toEqual({
      data: {
        getJourneyProfile: null
      }
    })
  })

  it('should throw error when user is not authenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: GET_JOURNEY_PROFILE_QUERY
    })

    expect(result).toEqual({
      data: {
        getJourneyProfile: null
      },
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })
})
