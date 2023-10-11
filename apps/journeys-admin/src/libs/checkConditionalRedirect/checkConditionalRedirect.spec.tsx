import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'

import { GET_JOURNEY_PROFILE_AND_TEAMS } from './checkConditionalRedirect'

import { checkConditionalRedirect } from '.'

describe('checkConditionalRedirect', () => {
  it('calls apollo apolloClient', async () => {
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data: {} })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toBeDefined()
    expect(apolloClient.query).toHaveBeenCalledWith({
      query: GET_JOURNEY_PROFILE_AND_TEAMS
    })
  })

  it('does not redirect to terms and conditions when resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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
      query: jest.fn().mockResolvedValue({ data })
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
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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
        onboardingFormCompletedAt: null,
        acceptedTermsAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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

  it('does not redirect to onboarding form if resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '2023-10-07T00:00:00.000Z',
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }

    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>

    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/onboarding-form?redirect=%2Fcustom-redirect-location'
      })
    ).toBeUndefined()
  })

  it('does not redirect to onboarding form if terms accepted before 5 sept 2023', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: [
        {
          id: 'teamId',
          __typename: 'Team'
        }
      ]
    }

    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>

    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/onboarding-form?redirect=%2Fcustom-redirect-location'
      })
    ).toBeUndefined()
  })

  it('redirect to onboarding form if onboardingFormCompletedAt is null', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '2023-10-07T00:00:00.000Z',
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }

    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>

    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/'
      })
    ).toEqual({
      destination: '/onboarding-form',
      permanent: false
    })
  })

  it('redirect to onboarding form with redirect parameter', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '2023-10-07T00:00:00.000Z',
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }

    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>

    expect(
      await checkConditionalRedirect({
        apolloClient,
        resolvedUrl: '/?redirect=%2Fcustom-redirect-location'
      })
    ).toEqual({
      destination: '/onboarding-form?redirect=%2Fcustom-redirect-location',
      permanent: false
    })
  })

  it('does not redirect to teams new if resolvedUrl', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: null
      },
      teams: []
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
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
        __typename: 'JourneyProfile',
        onboardingFormCompletedAt: '1970-01-01T00:00:00.000Z'
      },
      teams: [
        {
          id: 'teamId',
          __typename: 'Team'
        }
      ]
    }
    const apolloClient = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect({ apolloClient, resolvedUrl: '/' })
    ).toBeUndefined()
  })
})
