import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'
import { TEAM_CREATE } from '../useTeamCreateMutation/useTeamCreateMutation'

import { GET_JOURNEY_PROFILE_AND_TEAMS } from './checkConditionalRedirect'

import { checkConditionalRedirect } from '.'

const meData = {
  me: {
    emailVerified: true
  }
}

describe('checkConditionalRedirect', () => {
  it('calls apollo apolloClient', async () => {
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data: {} })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toBeDefined()
    expect(apolloClient.query).toHaveBeenCalledWith({
      query: GET_JOURNEY_PROFILE_AND_TEAMS
    })
  })

  it('does not redirect to user verify why resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: { me: { emailVerified: false } } })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/users/verify?redirect=test'
      })
    ).toBeUndefined()
  })

  it('redirect to user verify if email not verified', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: { me: { emailVerified: false } } })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toEqual({
      destination: '/users/verify',
      permanent: false
    })
  })

  it('does not redirect to terms and conditions when resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/users/terms-and-conditions?redirect=test'
      })
    ).toBeUndefined()
  })

  it('redirect to terms and conditions if getJourneyProfile is null', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toEqual({
      destination: '/users/terms-and-conditions',
      permanent: false
    })
  })

  it('redirect if terms and conditions if acceptedTermsAt is null', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: null,
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/templates/journeyId'
      })
    ).toEqual({
      destination:
        '/users/terms-and-conditions?redirect=%2Ftemplates%2FjourneyId',
      permanent: false
    })
  })

  it('redirects to terms and conditions with redirect parameter', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        __typename: 'JourneyProfile',
        acceptedTermsAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/?redirect=%2Fcustom-redirect-location'
      })
    ).toEqual({
      destination:
        '/users/terms-and-conditions?redirect=%2Fcustom-redirect-location',
      permanent: false
    })
  })

  it('does not redirect to teams new if resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/teams/new?redirect=test'
      })
    ).toBeUndefined()
  })

  it('redirect to teams new if teams empty', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toEqual({
      destination: '/teams/new',
      permanent: false
    })
  })

  it('redirect to teams with redirect parameter', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/?redirect=%2Fcustom-redirect-location'
      })
    ).toEqual({
      destination: '/teams/new?redirect=%2Fcustom-redirect-location',
      permanent: false
    })
  })

  it('does not redirect when all conditions are met', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: [
        {
          id: 'teamId',
          __typename: 'Team'
        }
      ]
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toBeUndefined()
  })

  it('skip teams new if teams empty and template quick with teamName', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData }),
      mutate: jest.fn().mockResolvedValue({})
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/?redirect=%2Ftemplates%2FjourneyId%2Fquick',
        teamName: 'teamName'
      })
    ).toEqual({
      destination: '/templates/journeyId/quick',
      permanent: false
    })
    expect(apolloClient.mutate).toHaveBeenCalledWith({
      mutation: TEAM_CREATE,
      variables: { input: { title: 'teamName' } }
    })
  })

  it('skip teams new if teams empty and template quick without teamName', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const apolloClient = {
      query: jest
        .fn()
        .mockResolvedValue({ data })
        .mockResolvedValueOnce({ data: meData }),
      mutate: jest.fn().mockResolvedValue({})
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/?redirect=%2Ftemplates%2FjourneyId%2Fquick'
      })
    ).toEqual({
      destination: '/templates/journeyId/quick',
      permanent: false
    })
    expect(apolloClient.mutate).toHaveBeenCalledWith({
      mutation: TEAM_CREATE,
      variables: { input: { title: 'My Team' } }
    })
  })
})
