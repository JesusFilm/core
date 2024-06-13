import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useJourneyNotifcationUpdate } from './useJourneyNotifcationUpdate'
import { useEventEmailNotificationsUpdateMock } from './useJourneyNotifcationUpdate.mock'

describe('useEventEmailNotificationsUpdate', () => {
  afterEach(() => jest.clearAllMocks())

  it('should update event email notifications', async () => {
    const { result } = renderHook(() => useJourneyNotifcationUpdate(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[useEventEmailNotificationsUpdateMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            input: {
              journeyId: 'journeyId',
              visitorInteractionEmail: true
            }
          }
        })
        expect(useEventEmailNotificationsUpdateMock.result).toHaveBeenCalled()
      })
    })
  })
})
