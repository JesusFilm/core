import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Redirect } from 'next'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'

export const GET_JOURNEY_PROFILE_AND_TEAMS = gql`
  query GetJourneyProfileAndTeams {
    getJourneyProfile {
      id
      userId
      acceptedTermsAt
    }
    teams {
      id
    }
  }
`

interface Props {
  apolloClient: ApolloClient<NormalizedCacheObject>
  encodedRedirectPathname?: string
  resolvedUrl: string
}

export async function checkConditionalRedirect({
  apolloClient,
  encodedRedirectPathname,
  resolvedUrl
}: Props): Promise<Redirect | undefined> {
  const { data } = await apolloClient.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  const redirect =
    encodedRedirectPathname != null && encodedRedirectPathname !== ''
      ? `?redirect=${encodedRedirectPathname}`
      : ''

  if (data.getJourneyProfile?.acceptedTermsAt == null) {
    if (resolvedUrl.startsWith('/users/terms-and-conditions')) return
    return {
      destination: `/users/terms-and-conditions${redirect}`,
      permanent: false
    }
  } else if (data.teams.length === 0) {
    if (resolvedUrl.startsWith('/teams/new')) return
    return {
      destination: `/teams/new${redirect}`,
      permanent: false
    }
  }
}
