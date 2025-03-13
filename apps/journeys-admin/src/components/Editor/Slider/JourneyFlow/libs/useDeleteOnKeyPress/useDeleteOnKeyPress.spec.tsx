import { MutationResult } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { Edge, OnSelectionChangeParams, useKeyPress } from '@xyflow/react'

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
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { useDeleteEdge } from '../useDeleteEdge'

import { useDeleteOnKeyPress } from './useDeleteOnKeyPress'

// Mock the useKeyPress hook
jest.mock('@xyflow/react', () => {
  const originalModule = jest.requireActual('@xyflow/react')
  return {
    __esModule: true,
    ...originalModule,
    useKeyPress: jest.fn()
  }
})
const mockUseKeyPress = useKeyPress

// Mock the useDeleteEdge hook
jest.mock('../useDeleteEdge', () => ({
  useDeleteEdge: jest.fn()
}))
const mockUseDeleteEdge = useDeleteEdge as jest.MockedFunction<
  typeof useDeleteEdge
>

// Mock the useBlockDeleteMutation hook
jest.mock('../../../../../../libs/useBlockDeleteMutation', () => ({
  useBlockDeleteMutation: jest.fn()
}))
const mockUseBlockDeleteMutation =
  useBlockDeleteMutation as jest.MockedFunction<typeof useBlockDeleteMutation>

describe('useDeleteOnKeyPress', () => {
  const deleteBlock = jest.fn()
  const deleteEdge = jest.fn()
  const deleteResult = {} as unknown as MutationResult<BlockDelete>

  beforeEach(() => {
    mockReactFlow()
    mockUseDeleteEdge.mockReturnValue(deleteEdge)
    mockUseBlockDeleteMutation.mockReturnValue([deleteBlock, deleteResult])
    mockUseKeyPress.mockReturnValue(false)
    jest.clearAllMocks()
  })

  it('should delete an edge', async () => {
    // Set up the initial state
    const initialState = {
      selectedBlock: null,
      activeSlide: ActiveSlide.JourneyFlow,
      showAnalytics: false
    } as unknown as EditorState

    // Create an edge to be deleted
    const edge = {
      id: 'edge-1',
      source: 'source',
      target: 'target',
      sourceHandle: 'sourceHandle'
    } as unknown as Edge

    // Create selection params with the edge
    const selectionParams = {
      edges: [edge],
      nodes: []
    } as unknown as OnSelectionChangeParams

    // Render the hook
    const { result, rerender } = renderHook(() => useDeleteOnKeyPress(), {
      wrapper: ({ children }) => (
        <EditorProvider initialState={initialState}>
          <MockedProvider>{children}</MockedProvider>
        </EditorProvider>
      )
    })

    // Select the edge
    act(() => {
      result.current.onSelectionChange(selectionParams)
    })

    // Trigger the delete key press
    mockUseKeyPress.mockReturnValue(true)
    rerender()

    // Verify that deleteEdge was called with the correct parameters
    expect(deleteEdge).toHaveBeenCalledWith({
      source: edge.source,
      sourceHandle: edge.sourceHandle
    })
  })

  it('should delete a node', async () => {
    // Create a step block to be deleted
    const stepBlock = {
      __typename: 'StepBlock',
      id: 'step.id'
    } as unknown as TreeBlock<StepBlock>

    // Set up the initial state with the selected block
    const initialState = {
      selectedBlock: stepBlock,
      activeSlide: ActiveSlide.JourneyFlow,
      showAnalytics: false,
      steps: [stepBlock]
    } as unknown as EditorState

    // Render the hook
    const { rerender } = renderHook(() => useDeleteOnKeyPress(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider initialState={initialState}>
            <MockedProvider>{children}</MockedProvider>
          </EditorProvider>
        </JourneyProvider>
      )
    })

    // Trigger the delete key press
    mockUseKeyPress.mockReturnValue(true)
    rerender()

    // Verify that deleteBlock was called
    expect(deleteBlock).toHaveBeenCalled()
  })
})
