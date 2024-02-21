import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { isAfter, parseISO } from 'date-fns'
import { Redirect } from 'next'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'
import { GetMe } from '../../../__generated__/GetMe'
import { GET_ME } from '../../components/PageWrapper/NavigationDrawer/UserNavigation'

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

  const { data: me } = await apolloClient.query<GetMe>({
    query: GET_ME
  })

  if (!(me.me?.emailVerified ?? false)) {
    if (resolvedUrl.startsWith('/users/verify')) return
    return {
      destination: `/users/verify`,
      permanent: false
    }
  }

  // don't redirect on /users/verify
  if (resolvedUrl.startsWith('/users/verify')) return

  const { data } = await apolloClient.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

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
