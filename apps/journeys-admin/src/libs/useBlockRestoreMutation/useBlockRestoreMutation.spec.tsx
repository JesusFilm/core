import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../__generated__/BlockRestore'

import {
  BLOCK_RESTORE,
  useBlockRestoreMutation
} from './useBlockRestoreMutation'
import { stepBlock, stepBlockRes } from './useBlockRestoreMutation.mock'

describe('useBlockRestoreMutation', () => {
  const useBlockRestoreMutationMock: MockedResponse<
    BlockRestore,
    BlockRestoreVariables
  > = {
    request: {
      query: BLOCK_RESTORE,
      variables: {
        id: stepBlock.id
      }
    },
    result: jest.fn(() => ({
      data: {
        blockRestore: [stepBlockRes]
      }
    }))
  }

  const initialState = {
    selectedBlock: null,
    activeSlide: ActiveSlide.JourneyFlow
  } as unknown as EditorState

  it('should restore block', async () => {
    const { result } = renderHook(() => useBlockRestoreMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[useBlockRestoreMutationMock]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider initialState={initialState}>
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await waitFor(async () => {
        await result.current[0]({
          variables: {
            id: stepBlock.id
          }
        })
        expect(useBlockRestoreMutationMock.result).toHaveBeenCalled()
      })
    })
  })
})
