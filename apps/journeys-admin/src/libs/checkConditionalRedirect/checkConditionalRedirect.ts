import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import { compareAsc, parseISO } from 'date-fns'
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
  } else if (
    data.getJourneyProfile?.onboardingFormCompletedAt == null &&
    compareAsc(
      parseISO(data.getJourneyProfile?.acceptedTermsAt),
      new Date(2023, 9, 5) // users created before this date will not have to fill out the form
    ) === 1
  ) {
    return { destination: '/onboarding-form', permanent: false }
  } else if (flags.teams === true && data.teams.length === 0) {
    return { destination: '/teams/new', permanent: false }
  }
}
