import { MockedProvider } from '@apollo/client/testing'
import { waitFor } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'
import { GET_VISITORS, useVisitors } from './useVisitors'

describe('useVisitors', () => {
  it('should get visitors', async () => {
    const result = jest.fn(() => ({
      data: {
        visitors: []
      }
    }))

    renderHook(() => useVisitors(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_VISITORS
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
