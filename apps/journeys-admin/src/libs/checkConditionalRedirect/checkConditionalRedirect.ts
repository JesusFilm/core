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

export async function checkConditionalRedirect(
  client: ApolloClient<NormalizedCacheObject>,
  flags: {
    [key: string]: boolean | undefined
  } = {},
  encodedRedirectPathname?: string
): Promise<Redirect | undefined> {
  const { data } = await client.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  console.log('refererURL', encodedRedirectPathname)

  const redirect =
    encodedRedirectPathname != null && encodedRedirectPathname !== ''
      ? `?redirect=${encodedRedirectPathname}`
      : ''

  if (
    flags.termsAndConditions === true &&
    data.getJourneyProfile?.acceptedTermsAt == null
  ) {
    return {
      destination: `/users/terms-and-conditions${redirect}`,
      permanent: false
    }
  } else if (flags.teams === true && data.teams.length === 0) {
    return {
      destination: `/teams/new${redirect}`,
      permanent: false
    }
  }
}
