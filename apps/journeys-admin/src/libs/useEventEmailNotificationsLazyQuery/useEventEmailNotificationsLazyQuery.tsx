import { LazyQueryResultTuple, gql, useLazyQuery } from '@apollo/client'

import {
  GetEventEmailNotifications,
  GetEventEmailNotificationsVariables
} from '../../../__generated__/GetEventEmailNotifications'

export const GET_EVENT_EMAIL_NOTIFICATIONS = gql`
  query GetEventEmailNotifications($journeyId: ID!) {
    eventEmailNotificationsByJourney(journeyId: $journeyId) {
      id
      journeyId
      userId
      value
    }
  }
`

export function useEventEmailNotificationsLazyQuery(
  journeyId: string
): LazyQueryResultTuple<
  GetEventEmailNotifications,
  GetEventEmailNotificationsVariables
> {
  const query = useLazyQuery<
    GetEventEmailNotifications,
    GetEventEmailNotificationsVariables
  >(GET_EVENT_EMAIL_NOTIFICATIONS, {
    variables: { journeyId }
  })

  return query
}
