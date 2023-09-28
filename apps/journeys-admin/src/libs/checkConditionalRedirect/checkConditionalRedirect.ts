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
  refererUrl?: string
): Promise<Redirect | undefined> {
  const { data } = await client.query<GetJourneyProfileAndTeams>({
    query: GET_JOURNEY_PROFILE_AND_TEAMS
  })

  console.info('refererURL', refererUrl)

  // refererUrl example:
  // http://localhost:4200/users/sign-in?redirect=http://localhost:4200/templates/[journeyId]?createNew=true
  const redirectPath = refererUrl?.split('?redirect=').pop()
  console.info('redirectPath', redirectPath)
  const redirect =
    redirectPath != null && redirectPath !== ''
      ? `?redirect=${redirectPath}`
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
