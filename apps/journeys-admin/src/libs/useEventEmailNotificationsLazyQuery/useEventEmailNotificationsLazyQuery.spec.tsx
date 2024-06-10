import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import {
  GET_EVENT_EMAIL_NOTIFICATIONS,
  useEventEmailNotificationsLazyQuery
} from './useEventEmailNotificationsLazyQuery'

describe('useEventEmailNotificationsLazyQuery', () => {
  it('should return event email notifications when called', async () => {
    const { result } = renderHook(
      () => useEventEmailNotificationsLazyQuery('journeyId'),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_EVENT_EMAIL_NOTIFICATIONS,
                  variables: { journeyId: 'journeyId' }
                },
                result: {
                  data: {
                    eventEmailNotificationsByJourney: [
                      {
                        id: 'eventEmailNotificationId',
                        journeyId: 'journeyId',
                        userId: 'userId',
                        value: true
                      }
                    ]
                  }
                }
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await result.current[0]()

    await waitFor(() => {
      expect(result.current[1].data).toEqual({
        eventEmailNotificationsByJourney: [
          {
            id: 'eventEmailNotificationId',
            journeyId: 'journeyId',
            userId: 'userId',
            value: true
          }
        ]
      })
    })
  })
})
