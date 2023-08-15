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
  } = {}
): Promise<Redirect | undefined> {
  const { data } = await client.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  if (
    flags.termsAndConditions === true &&
    data.getJourneyProfile?.acceptedTermsAt == null
  ) {
    return { destination: '/users/terms-and-conditions', permanent: false }
  } else if (flags.teams === true && data.teams.length === 0) {
    return { destination: '/teams/new', permanent: false }
  }
}
