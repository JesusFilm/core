import { MockedResponse } from '@apollo/client/testing'

import {
  EventEmailNotificationsUpdate,
  EventEmailNotificationsUpdateVariables
} from '../../../__generated__/EventEmailNotificationsUpdate'

import { EVENT_EMAIL_NOTIFICATIONS_UPDATE } from './useEventEmailNotificationsUpdateMutation'

export const useEventEmailNotificationsUpdateMock: MockedResponse<
  EventEmailNotificationsUpdate,
  EventEmailNotificationsUpdateVariables
> = {
  request: {
    query: EVENT_EMAIL_NOTIFICATIONS_UPDATE,
    variables: {
      id: 'eventEmailNotificationId',
      input: {
        journeyId: 'journeyId',
        userId: 'userId',
        value: true
      }
    }
  },
  result: {
    data: {
      eventEmailNotificationsUpdate: {
        __typename: 'EventEmailNotifications',
        id: 'eventEmailNotificationId',
        journeyId: 'journeyId',
        userId: 'userId',
        value: true
      }
    }
  }
}
