import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_VIDEO } from './useVideo'
import { useVideoMock } from './useVideo.mock'

import { useVideo } from '.'

describe('useVideo', () => {
  it('should get custom domain for a team', async () => {
    const result = jest.fn().mockReturnValue(useVideoMock.result)

    renderHook(
      () =>
        useVideo({
          variables: { videoId: 'someId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_VIDEO,
                  variables: { videoId: 'someId' }
                },
                result
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})
