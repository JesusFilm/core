import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useUserJourneyOpen, USER_JOURNEY_OPEN } from './useUserJourneyOpen'

describe('useUserJourneyOpen', () => {
  it('should call userJourneyOpen', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyOpen: {
          id: 'UserJourney1.id'
        }
      }
    }))

    renderHook(() => useUserJourneyOpen('journey.id'), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: USER_JOURNEY_OPEN,
                variables: {
                  id: 'journey.id'
                }
              },
              result
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })
    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})
