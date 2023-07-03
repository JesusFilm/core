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
  ignore: { acceptedTermsAt?: boolean; teams?: boolean } = {}
): Promise<Redirect | undefined> {
  const { data } = await client.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  if (
    data.getJourneyProfile?.acceptedTermsAt == null &&
    ignore.acceptedTermsAt !== true
  ) {
    return { destination: '/users/terms-and-conditions', permanent: false }
  } else if (data.teams.length === 0 && ignore.teams !== true) {
    return { destination: '/teams/new', permanent: false }
  }
}
