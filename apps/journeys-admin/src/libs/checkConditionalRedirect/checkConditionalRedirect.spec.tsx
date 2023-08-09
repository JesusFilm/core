import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'

import { GET_JOURNEY_PROFILE_AND_TEAMS } from './checkConditionalRedirect'

import { checkConditionalRedirect } from '.'

describe('checkConditionalRedirect', () => {
  it('calls apollo client', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({ data: {} })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: true,
        teams: true
      })
    ).toBeDefined()
    expect(client.query).toHaveBeenCalledWith({
      query: GET_JOURNEY_PROFILE_AND_TEAMS
    })
  })

  it('does not redirect when ignored', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const client = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: false,
        teams: false
      })
    ).toBeUndefined()
  })

  it('redirect if getJourneyProfile is null', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: null,
      teams: []
    }
    const client = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: true,
        teams: true
      })
    ).toEqual({
      destination: '/users/terms-and-conditions',
      permanent: false
    })
  })

  it('redirect if termsAndConditions is null', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: null,
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const client = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: true,
        teams: true
      })
    ).toEqual({
      destination: '/users/terms-and-conditions',
      permanent: false
    })
  })

  it('redirect if teams empty', async () => {
    const data: GetJourneyProfileAndTeams = {
      getJourneyProfile: {
        id: 'profile.id',
        userId: 'user.id',
        acceptedTermsAt: '1970-01-01T00:00:00.000Z',
        __typename: 'JourneyProfile'
      },
      teams: []
    }
    const client = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: true,
        teams: true
      })
    ).toEqual({
      destination: '/teams/new',
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
    const client = {
      query: jest.fn().mockResolvedValue({ data })
    } as unknown as ApolloClient<NormalizedCacheObject>
    expect(
      await checkConditionalRedirect(client, {
        termsAndConditions: true,
        teams: true
      })
    ).toBeUndefined()
  })
})
