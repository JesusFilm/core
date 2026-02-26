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

describe('journeyProfileUpdate', () => {
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

  const JOURNEY_PROFILE_UPDATE_MUTATION = graphql(`
    mutation JourneyProfileUpdate($input: JourneyProfileUpdateInput!) {
      journeyProfileUpdate(input: $input) {
        id
        userId
        lastActiveTeamId
        journeyFlowBackButtonClicked
        plausibleJourneyFlowViewed
        plausibleDashboardViewed
      }
    }
  `)

  const profile = {
    id: 'profileId',
    userId: 'userId',
    acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z'),
    lastActiveTeamId: null,
    journeyFlowBackButtonClicked: null,
    plausibleJourneyFlowViewed: null,
    plausibleDashboardViewed: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.journeyProfile.findUnique.mockResolvedValue(profile)
  })

  it('should update lastActiveTeamId', async () => {
    const updatedProfile = {
      ...profile,
      lastActiveTeamId: 'lastTeamId'
    }
    prismaMock.journeyProfile.update.mockResolvedValue(updatedProfile)

    const result = await authClient({
      document: JOURNEY_PROFILE_UPDATE_MUTATION,
      variables: { input: { lastActiveTeamId: 'lastTeamId' } }
    })

    expect(result).toEqual({
      data: {
        journeyProfileUpdate: {
          id: 'profileId',
          userId: 'userId',
          lastActiveTeamId: 'lastTeamId',
          journeyFlowBackButtonClicked: null,
          plausibleJourneyFlowViewed: null,
          plausibleDashboardViewed: null
        }
      }
    })

    expect(prismaMock.journeyProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'profileId' },
        data: { lastActiveTeamId: 'lastTeamId' }
      })
    )
  })

  it('should update journeyFlowBackButtonClicked', async () => {
    const updatedProfile = {
      ...profile,
      journeyFlowBackButtonClicked: true
    }
    prismaMock.journeyProfile.update.mockResolvedValue(updatedProfile)

    const result = await authClient({
      document: JOURNEY_PROFILE_UPDATE_MUTATION,
      variables: { input: { journeyFlowBackButtonClicked: true } }
    })

    expect(result).toEqual({
      data: {
        journeyProfileUpdate: {
          id: 'profileId',
          userId: 'userId',
          lastActiveTeamId: null,
          journeyFlowBackButtonClicked: true,
          plausibleJourneyFlowViewed: null,
          plausibleDashboardViewed: null
        }
      }
    })
  })

  it('should update plausibleJourneyFlowViewed', async () => {
    const updatedProfile = {
      ...profile,
      plausibleJourneyFlowViewed: true
    }
    prismaMock.journeyProfile.update.mockResolvedValue(updatedProfile)

    const result = await authClient({
      document: JOURNEY_PROFILE_UPDATE_MUTATION,
      variables: { input: { plausibleJourneyFlowViewed: true } }
    })

    expect(result).toEqual({
      data: {
        journeyProfileUpdate: {
          id: 'profileId',
          userId: 'userId',
          lastActiveTeamId: null,
          journeyFlowBackButtonClicked: null,
          plausibleJourneyFlowViewed: true,
          plausibleDashboardViewed: null
        }
      }
    })
  })

  it('should update plausibleDashboardViewed', async () => {
    const updatedProfile = {
      ...profile,
      plausibleDashboardViewed: true
    }
    prismaMock.journeyProfile.update.mockResolvedValue(updatedProfile)

    const result = await authClient({
      document: JOURNEY_PROFILE_UPDATE_MUTATION,
      variables: { input: { plausibleDashboardViewed: true } }
    })

    expect(result).toEqual({
      data: {
        journeyProfileUpdate: {
          id: 'profileId',
          userId: 'userId',
          lastActiveTeamId: null,
          journeyFlowBackButtonClicked: null,
          plausibleJourneyFlowViewed: null,
          plausibleDashboardViewed: true
        }
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
      document: JOURNEY_PROFILE_UPDATE_MUTATION,
      variables: { input: { lastActiveTeamId: 'lastTeamId' } }
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
