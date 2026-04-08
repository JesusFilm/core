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
  allowGuest?: boolean
}

export async function checkConditionalRedirect({
  apolloClient,
  resolvedUrl,
  teamName,
  allowGuest = false
}: CheckConditionalRedirectProps): Promise<Redirect | undefined> {
  const requestedRedirect = new URL(
    resolvedUrl,
    'https://admin.nextstep.is'
  ).searchParams.get('redirect')
  const currentRedirect =
    requestedRedirect != null &&
    requestedRedirect.startsWith('/') &&
    !requestedRedirect.startsWith('//')
      ? requestedRedirect
      : null

  let redirect: string | undefined
  let encodedRedirect = ''

  if (currentRedirect != null) {
    redirect = currentRedirect
    encodedRedirect = `?redirect=${encodeURIComponent(currentRedirect)}`
  } else if (resolvedUrl !== '/') {
    redirect = resolvedUrl
    encodedRedirect = `?redirect=${encodeURIComponent(resolvedUrl)}`
  }

  let meResult: GetMe | undefined
  try {
    const { data } = await apolloClient.query<GetMe>({
      query: GET_ME,
      variables: { input: { redirect } }
    })
    meResult = data
  } catch (error) {
    const isUnauthenticated =
      error != null &&
      typeof error === 'object' &&
      'graphQLErrors' in error &&
      Array.isArray((error as { graphQLErrors: unknown[] }).graphQLErrors) &&
      (
        error as { graphQLErrors: Array<{ extensions?: { code?: string } }> }
      ).graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHENTICATED')

    if (isUnauthenticated) {
      return { destination: '/api/clear-auth', permanent: false }
    }
    throw error
  }

  const me = meResult

  if (me?.me?.__typename === 'AuthenticatedUser') {
    if (!(me.me?.emailVerified ?? false)) {
      if (resolvedUrl.startsWith('/users/verify')) return
      return {
        destination: `/users/verify${encodedRedirect}`,
        permanent: false
      }
    }
  }

  if (me?.me?.__typename === 'AnonymousUser' && allowGuest) {
    return
  }

  // don't redirect on /users/verify
  if (resolvedUrl.startsWith(`/users/verify${encodedRedirect}`)) return

  const { data } = await apolloClient.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  if (data.getJourneyProfile?.acceptedTermsAt == null) {
    if (resolvedUrl.startsWith('/users/terms-and-conditions')) return
    return {
      destination: `/users/terms-and-conditions${encodedRedirect}`,
      permanent: false
    }
  }

  // Terms already accepted — skip past the terms page if we're still on it
  // (e.g. redirected here after email verification via link).
  // Only forward the original ?redirect= destination, not the terms URL itself.
  if (resolvedUrl.startsWith('/users/terms-and-conditions')) {
    const forwardRedirect =
      currentRedirect != null
        ? `?redirect=${encodeURIComponent(currentRedirect)}`
        : ''
    if (data.teams.length === 0) {
      return {
        destination: `/teams/new${forwardRedirect}`,
        permanent: false
      }
    }
    return {
      destination: currentRedirect ?? '/',
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
      destination: `/teams/new${encodedRedirect}`,
      permanent: false
    }
  }
}
