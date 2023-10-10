import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'

import {
  GetAdminJourney,
  GetAdminJourney_adminJourney as Journey
} from '../../../__generated__/GetAdminJourney'

export const GET_ADMIN_JOURNEY = gql`
  query GetAdminJourney($adminJourneyId: ID!) {
    adminJourney(id: $adminJourneyId, idType: databaseId) {
      id
      template
    }
  }
`

export async function journeyAdminExists(
  apolloClient: ApolloClient<NormalizedCacheObject>,
  journeyId?: string
): Promise<Journey | null> {
  const { data } = await apolloClient.query<GetAdminJourney>({
    query: GET_ADMIN_JOURNEY,
    variables: {
      id: journeyId
    }
  })
  return data.adminJourney
}
