import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../__generated__/BlockRestore'
import {
  BLOCK_RESTORE,
  useBlockRestoreMutation
} from './useBlockRestoreMutation'

describe('useBlockRestoreMutation', () => {
  const useBlockRestoreMutationMock: MockedResponse<
    BlockRestore,
    BlockRestoreVariables
  > = {
    request: {
      query: BLOCK_RESTORE,
      variables: {
        blockRestoreId: 'blockId'
      }
    },
    result: jest.fn(() => ({
      data: {
        blockRestore: [
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            parentBlockId: 'stepId',
            parentOrder: 0,
            coverBlockId: null,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false
          }
        ]
      }
    }))
  }

  it('should restore block', async () => {
    const { result } = renderHook(() => useBlockRestoreMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[useBlockRestoreMutationMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            blockRestoreId: 'blockId'
          }
        })
        expect(useBlockRestoreMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
