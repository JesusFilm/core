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

type NextRedirect = Redirect & {
  has?: Array<{ type: string; key: string; value: string }>
}

export async function checkConditionalRedirect(
  client: ApolloClient<NormalizedCacheObject>,
  flags: {
    [key: string]: boolean | undefined
  } = {},
  encodedRedirectPathname?: string,
  pageSource?: string
): Promise<NextRedirect | undefined> {
  const { data } = await client.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  console.log('encodedRedirectPathname', encodedRedirectPathname, pageSource)

  const redirect =
    encodedRedirectPathname != null && encodedRedirectPathname !== ''
      ? {
          source: `/?redirect=${encodedRedirectPathname.substring(1)}`
          // has: [
          //   {
          //     type: 'query',
          //     key: 'redirect',
          //     value: encodedRedirectPathname
          //   }
          // ]
        }
      : {}

  if (
    flags.termsAndConditions === true &&
    data.getJourneyProfile?.acceptedTermsAt == null
  ) {
    return {
      ...redirect,
      destination: '/users/terms-and-conditions',
      permanent: false
    }
  } else if (flags.teams === true && data.teams.length === 0) {
    return {
      ...redirect,
      destination: '/teams/new',
      permanent: false
    }
  }
}
