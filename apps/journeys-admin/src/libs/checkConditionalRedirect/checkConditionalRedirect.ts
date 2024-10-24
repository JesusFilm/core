import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { Redirect } from 'next'

import { GetJourneyProfileAndTeams } from '../../../__generated__/GetJourneyProfileAndTeams'
import { GetMe } from '../../../__generated__/GetMe'
import {
  TeamCreate,
  TeamCreateVariables
} from '../../../__generated__/TeamCreate'
import { GET_ME } from '../../components/PageWrapper/NavigationDrawer/UserNavigation'
import { TEAM_CREATE } from '../useTeamCreateMutation/useTeamCreateMutation'

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

interface CheckConditionalRedirectProps {
  apolloClient: ApolloClient<NormalizedCacheObject>
  resolvedUrl: string
  teamName?: string
}

export async function checkConditionalRedirect({
  apolloClient,
  resolvedUrl,
  teamName
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
    query: GET_ME,
    variables: { input: { redirect } }
  })

  if (!(me.me?.emailVerified ?? false)) {
    if (resolvedUrl.startsWith('/users/verify')) return
    return {
      destination: `/users/verify${redirect}`,
      permanent: false
    }
  }

  // don't redirect on /users/verify
  if (resolvedUrl.startsWith(`/users/verify${redirect}`)) return

  const { data } = await apolloClient.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  if (data.getJourneyProfile?.acceptedTermsAt == null) {
    if (resolvedUrl.startsWith('/users/terms-and-conditions')) return
    return {
      destination: `/users/terms-and-conditions${redirect}`,
      permanent: false
    }
  }

  if (data.teams.length === 0) {
    if (currentRedirect?.match(/^\/templates\/[\w-]+\/quick/) != null) {
      await apolloClient.mutate<TeamCreate, TeamCreateVariables>({
        mutation: TEAM_CREATE,
        variables: { input: { title: teamName ?? 'My Team' } }
      })
      return { destination: currentRedirect, permanent: false }
    }
    if (resolvedUrl.startsWith('/teams/new')) return
    return {
      destination: `/teams/new${redirect}`,
      permanent: false
    }
  }
}
