import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import { GET_ADMIN_VIDEO } from './useAdminVideo'
import { useAdminVideoMock } from './useAdminVideo.mock'

import { useAdminVideo } from '.'

describe('useAdminVideo', () => {
  it('should get custom domain for a team', async () => {
    const result = jest.fn().mockReturnValue(useAdminVideoMock.result)

    renderHook(
      () =>
        useAdminVideo({
          variables: { videoId: 'someId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ADMIN_VIDEO,
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

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
