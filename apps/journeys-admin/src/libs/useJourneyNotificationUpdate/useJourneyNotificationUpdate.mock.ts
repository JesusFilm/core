import { MockedResponse } from '@apollo/client/testing'

import {
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
} from '../../../__generated__/JourneyNotificationUpdate'

import { JOURNEY_NOTIFICATION_UPDATE } from './useJourneyNotificationUpdate'

export const useJourneyNotifcationUpdateMock: MockedResponse<
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
> = {
  request: {
    query: JOURNEY_NOTIFICATION_UPDATE,
    variables: {
      input: {
        journeyId: 'journeyId',
        visitorInteractionEmail: true
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      journeyNotificationUpdate: {
        __typename: 'JourneyNotification',
        id: 'journeyNotificationUpdateid',
        journeyId: 'journeyId',
        userId: 'userId',
        userTeamId: 'userTeamId',
        userJourneyId: 'userJourneyId',
        visitorInteractionEmail: true
      }
    }
  }))
}
