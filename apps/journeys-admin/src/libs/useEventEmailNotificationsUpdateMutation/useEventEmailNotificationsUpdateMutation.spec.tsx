import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { EventEmailNotificationsUpdate } from '../../../__generated__/EventEmailNotificationsUpdate'

import {
  EVENT_EMAIL_NOTIFICATIONS_UPDATE,
  useEventEmailNotificationsUpdate
} from './useEventEmailNotificationsUpdateMutation'

describe('useEventEmailNotificationsUpdate', () => {
  const eventEmailNotificationsMock: MockedResponse<EventEmailNotificationsUpdate> =
    {
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
      result: jest.fn(() => ({
        data: {
          eventEmailNotificationsUpdate: {
            __typename: 'EventEmailNotifications',
            id: 'eventEmailNotificationId',
            journeyId: 'journeyId',
            userId: 'userId',
            value: true
          }
        }
      }))
    }

  it('should update event email notifications', async () => {
    const { result } = renderHook(() => useEventEmailNotificationsUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[eventEmailNotificationsMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: 'eventEmailNotificationId',
            input: {
              journeyId: 'journeyId',
              userId: 'userId',
              value: true
            }
          }
        })
        expect(eventEmailNotificationsMock.result).toHaveBeenCalled()
      })
    })
  })
})
