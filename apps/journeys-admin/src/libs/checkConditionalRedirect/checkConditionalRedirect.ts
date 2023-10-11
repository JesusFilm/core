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
  resolvedUrl: string
}

export async function checkConditionalRedirect({
  apolloClient,
  resolvedUrl
}: Props): Promise<Redirect | undefined> {
  const { data } = await apolloClient.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  const currentRedirect = new URL(
    resolvedUrl,
    'https://admin.nextstep.is'
  ).searchParams.get('redirect')
  let redirect = ''

  if (currentRedirect != null) {
    redirect = `?redirect=${encodeURIComponent(currentRedirect)}`
  } else {
    if (resolvedUrl !== '/')
      redirect = `?redirect=${encodeURIComponent(resolvedUrl)}`
  }

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
