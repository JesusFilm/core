import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { useCreateEditionMutation } from './useCreateEdition'
import { getCreateEditionMock } from './useCreateEdition.mock'

const createEditionMock = getCreateEditionMock({
  videoId: 'video.id',
  name: 'base'
})

describe('useCreateEdition', () => {
  it('should create an edition', async () => {
    const { result } = renderHook(() => useCreateEditionMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[createEditionMock]}>{children}</MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            videoId: 'video.id',
            name: 'base'
          }
        }
      })
    })

    expect(createEditionMock.result).toHaveBeenCalled()
  })
})
