import { MockedResponse } from '@apollo/client/testing'

import {
  GetEventEmailNotifications,
  GetEventEmailNotificationsVariables
} from '../../../__generated__/GetEventEmailNotifications'

import { GET_EVENT_EMAIL_NOTIFICATIONS } from './useEventEmailNotificationsLazyQuery'

export const useEventEmailNotificationsLazyQuery: MockedResponse<
  GetEventEmailNotifications,
  GetEventEmailNotificationsVariables
> = {
  request: {
    query: GET_EVENT_EMAIL_NOTIFICATIONS,
    variables: { journeyId: 'journeyId' }
  },
  result: {
    data: {
      eventEmailNotificationsByJourney: [
        {
          __typename: 'EventEmailNotifications',
          id: 'eventEmailNotificationId',
          journeyId: 'journeyId',
          userId: 'userId',
          value: true
        }
      ]
    }
  }
}
