import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useJourneyNotificationUpdate } from './useJourneyNotificationUpdate'
import { useJourneyNotifcationUpdateMock } from './useJourneyNotificationUpdate.mock'

describe('useJourneyNotificationUpdate', () => {
  afterEach(() => jest.clearAllMocks())

  it('should update event email notifications', async () => {
    const { result } = renderHook(() => useJourneyNotificationUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[useJourneyNotifcationUpdateMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            journeyId: 'journeyId',
            visitorInteractionEmail: true
          }
        }
      })
    })
    expect(useJourneyNotifcationUpdateMock.result).toHaveBeenCalled()
  })
})
