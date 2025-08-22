import { InMemoryCache } from '@apollo/client'
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
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        id: 'journey-id',
        __typename: 'Journey',
        blocks: [
          { __ref: 'StepBlock:step1.id' },
          { __ref: 'StepBlock:step2.id' }
        ]
      },
      'StepBlock:step1.id': { __typename: 'StepBlock', id: 'step1.id' },
      'StepBlock:step2.id': { __typename: 'StepBlock', id: 'step2.id' }
    })

    const { result } = renderHook(() => useBlockRestoreMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[useBlockRestoreMutationMock]} cache={cache}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider initialState={initialState}>
              {children}
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          id: stepBlock.id
        }
      })
    })
    expect(useBlockRestoreMutationMock.result).toHaveBeenCalled()

    const extractedCache = cache.extract()
    expect(extractedCache['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:step1.id' },
      { __ref: 'StepBlock:step2.id' },
      { __ref: 'StepBlock:step3.id' }
    ])
    expect(extractedCache['StepBlock:step1.id']).toBeDefined()
    expect(extractedCache['StepBlock:step2.id']).toBeDefined()
    expect(extractedCache['StepBlock:step3.id']).toBeDefined()
  })
})
