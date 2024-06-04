import { LazyQueryResultTuple, gql, useLazyQuery } from '@apollo/client'

import {
  GetUserJourneyNotifications,
  GetUserJourneyNotificationsVariables
} from '../../../__generated__/GetUserJourneyNotifications'

export const GET_USER_JOURNEY_NOTIFICATIONS = gql`
  query GetUserJourneyNotifications($journeyId: ID!) {
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
): LazyQueryResultTuple<
  GetUserJourneyNotifications,
  GetUserJourneyNotificationsVariables
> {
  const query = useLazyQuery<
    GetUserJourneyNotifications,
    GetUserJourneyNotificationsVariables
  >(GET_USER_JOURNEY_NOTIFICATIONS, {
    variables: { journeyId }
  })

  return query
}
