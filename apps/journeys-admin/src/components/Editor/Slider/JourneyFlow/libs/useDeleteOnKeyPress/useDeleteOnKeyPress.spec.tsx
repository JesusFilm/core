import { MutationResult } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Edge, OnSelectionChangeParams, useKeyPress } from 'reactflow'

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
import { useDeleteEdge } from '../useDeleteEdge'

import { useDeleteOnKeyPress } from './useDeleteOnKeyPress'

jest.mock('reactflow', () => {
  const originalModule = jest.requireActual('reactflow')
  return {
    __esModule: true,
    ...originalModule,
    useKeyPress: jest.fn()
  }
})
const mockUseKeyPress = useKeyPress as jest.MockedFunction<typeof useKeyPress>
jest.mock('../useDeleteEdge', () => {
  return {
    useDeleteEdge: jest.fn()
  }
})
const mockUseDeleteEdge = useDeleteEdge as jest.MockedFunction<
  typeof useDeleteEdge
>

jest.mock('../../../../../../libs/useBlockDeleteMutation', () => {
  return {
    useBlockDeleteMutation: jest.fn()
  }
})

const mockUseBlockDeleteMutation =
  useBlockDeleteMutation as jest.MockedFunction<typeof useBlockDeleteMutation>

describe('useDeleteOnKeyPress', () => {
  const deleteBlock = jest.fn()
  const deleteEdge = jest.fn()
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
          <MockedProvider>{children}</MockedProvider>
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
            <MockedProvider>{children}</MockedProvider>
          </EditorProvider>
        </JourneyProvider>
      )
    })
    await waitFor(async () => expect(deleteBlock).toHaveBeenCalled())
  })
})
