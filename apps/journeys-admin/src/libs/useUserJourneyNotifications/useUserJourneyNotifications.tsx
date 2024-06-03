import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetUserJourneyNotifications,
  GetUserJourneyNotificationsVariables
} from '../../../__generated__/GetUserJourneyNotifications'

export const GET_USER_JOURNEY_NOTIFICATIONS = gql`
  query GetUserJourneyNotifications($journeyId: String!) {
    userJourneyNotificationsByJourney(journeyId: $journeyId) {
      id
      journeyId
      userId
      value
    }
  }
`

export function useUserJourneyNotificationsLazyQuery(
  journeyId: string
): QueryResult<GetUserJourneyNotifications> {
  const query = useQuery<
    GetUserJourneyNotifications,
    GetUserJourneyNotificationsVariables
  >(GET_USER_JOURNEY_NOTIFICATIONS, {
    variables: { journeyId }
  })

  return {
    ...query
  }
}
