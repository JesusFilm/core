import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { getDeleteR2AssetMock } from './useDeleteR2Asset.mock'
import { useDeleteR2AssetMutation } from './useDeleteR2AssetMutation'

const deleteR2AssetMock = getDeleteR2AssetMock({
  id: 'subtitle1.id'
})

describe('useDeleteR2Asset', () => {
  it('should delete an R2 asset', async () => {
    const { result } = renderHook(() => useDeleteR2AssetMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[deleteR2AssetMock]}>{children}</MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: { id: 'subtitle1.id' }
      })

      expect(deleteR2AssetMock.result).toHaveBeenCalled()
    })
  })
})
