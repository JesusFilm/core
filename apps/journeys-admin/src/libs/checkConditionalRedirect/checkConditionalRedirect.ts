import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { isAfter, parseISO } from 'date-fns'
import { Redirect } from 'next'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'

export const GET_JOURNEY_PROFILE_AND_TEAMS = gql`
  query GetJourneyProfileAndTeams {
    getJourneyProfile {
      id
      userId
      acceptedTermsAt
      onboardingFormCompletedAt
    }
    teams {
      id
    }
  }
`

interface CheckConditionalRedirectProps {
  apolloClient: ApolloClient<NormalizedCacheObject>
  resolvedUrl: string
}

export async function checkConditionalRedirect({
  apolloClient,
  resolvedUrl
}: CheckConditionalRedirectProps): Promise<Redirect | undefined> {
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
  } else if (
    data.getJourneyProfile?.onboardingFormCompletedAt == null &&
    isAfter(
      parseISO(data.getJourneyProfile?.acceptedTermsAt),
      new Date(2023, 9, 5)
    )
  ) {
    if (resolvedUrl.startsWith('/onboarding-form')) return
    return { destination: `/onboarding-form${redirect}`, permanent: false }
  } else if (data.teams.length === 0) {
    if (resolvedUrl.startsWith('/teams/new')) return
    return {
      destination: `/teams/new${redirect}`,
      permanent: false
    }
  }
}
