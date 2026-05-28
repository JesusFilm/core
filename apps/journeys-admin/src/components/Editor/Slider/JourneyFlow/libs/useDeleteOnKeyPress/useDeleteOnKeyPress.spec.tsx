import { MutationResult } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Edge, OnSelectionChangeParams, useKeyPress } from '@xyflow/react'
import { type MockedFunction } from 'vitest'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { BlockDelete } from '../../../../../../../__generated__/BlockDelete'
import { StepFields as StepBlock } from '../../../../../../../__generated__/StepFields'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { MuxVideoUploadProvider } from '../../../../../MuxVideoUploadProvider'
import { useDeleteEdge } from '../useDeleteEdge'

import { useDeleteOnKeyPress } from './useDeleteOnKeyPress'

vi.mock('@xyflow/react', async () => {
  const originalModule = await vi.importActual('@xyflow/react')
  return {
    __esModule: true,
    ...originalModule,
    useKeyPress: vi.fn()
  }
})
const mockUseKeyPress = useKeyPress as MockedFunction<typeof useKeyPress>
vi.mock('../useDeleteEdge', async () => {
  return {
    useDeleteEdge: vi.fn()
  }
})
const mockUseDeleteEdge = useDeleteEdge as MockedFunction<typeof useDeleteEdge>

vi.mock('../../../../../../libs/useBlockDeleteMutation', async () => {
  return {
    useBlockDeleteMutation: vi.fn()
  }
})

const mockUseBlockDeleteMutation = useBlockDeleteMutation as MockedFunction<
  typeof useBlockDeleteMutation
>

describe('useDeleteOnKeyPress', () => {
  const deleteBlock = vi.fn()
  const deleteEdge = vi.fn()
  const deleteResult = {} as unknown as MutationResult<BlockDelete>

  beforeEach(() => {
    mockUseDeleteEdge.mockReturnValue(deleteEdge)
    mockUseBlockDeleteMutation.mockReturnValue([deleteBlock, deleteResult])
  })

  it('should delete a edge', async () => {
    mockUseKeyPress.mockReturnValueOnce(false)

    const initialState = {
      selectedBlock: null,
      activeSlide: ActiveSlide.JourneyFlow
    } as unknown as EditorState
    const edge = {
      source: 'source',
      target: 'target'
    } as unknown as Edge
    const selectionParams = {
      edges: [edge]
    } as unknown as OnSelectionChangeParams

    const { result } = renderHook(() => useDeleteOnKeyPress(), {
      wrapper: ({ children }) => (
        <EditorProvider initialState={initialState}>
          <MockedProvider>
            <MuxVideoUploadProvider>{children}</MuxVideoUploadProvider>
          </MockedProvider>
        </EditorProvider>
      )
    })

    mockUseKeyPress.mockReturnValueOnce(true)
    await act(async () => result.current.onSelectionChange(selectionParams))

    await waitFor(async () => expect(deleteEdge).toHaveBeenCalled())
  })

  it('should delete a node', async () => {
    mockUseKeyPress.mockReturnValueOnce(false)
    const stepBlock = {
      __typename: 'StepBlock',
      id: 'step.id'
    } as unknown as TreeBlock<StepBlock>
    const initialState = {
      selectedBlock: stepBlock,
      activeSlide: ActiveSlide.JourneyFlow,
      steps: [stepBlock]
    } as unknown as EditorState

    mockUseKeyPress.mockReturnValueOnce(true)
    renderHook(() => useDeleteOnKeyPress(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider initialState={initialState}>
            <MockedProvider>
              <MuxVideoUploadProvider>{children}</MuxVideoUploadProvider>
            </MockedProvider>
          </EditorProvider>
        </JourneyProvider>
      )
    })
    await waitFor(async () => expect(deleteBlock).toHaveBeenCalled())
  })
})
