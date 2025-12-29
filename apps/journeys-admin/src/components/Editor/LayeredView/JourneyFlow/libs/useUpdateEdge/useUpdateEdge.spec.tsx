import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { blockOrderUpdateMock } from '../../../../../../libs/useBlockOrderUpdateMutation/useBlockOrderUpdateMutation.mock'
import {
  stepBlockNextBlockUpdateMock,
  stepBlockNextBlockUpdateToStepMock
} from '../../../../../../libs/useStepBlockNextBlockUpdateMutation/useStepBlockNextBlockUpdateMutation.mock'
import { CommandRedoItem } from '../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem'

import { useUpdateEdge } from './useUpdateEdge'

const block = {
  __typename: 'ButtonBlock',
  id: 'button2.id',
  children: []
} as unknown as TreeBlock<ButtonBlock>

const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [block]
}

describe('useUpdateEdge', () => {
  it('should update block order for SocialPreview edge and undo/redo', async () => {
    const mockResult = jest.fn().mockReturnValue(blockOrderUpdateMock.result)
    const mockUndoResult = jest
      .fn()
      .mockReturnValue(blockOrderUpdateMock.result)
    const mockRedoResult = jest
      .fn()
      .mockReturnValue(blockOrderUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...blockOrderUpdateMock, result: mockResult },
            {
              request: {
                ...blockOrderUpdateMock.request,
                variables: { id: 'blockId', parentOrder: 1 }
              },
              result: mockUndoResult
            },
            { ...blockOrderUpdateMock, result: mockRedoResult }
          ]}
        >
          <EditorProvider
            initialState={{ steps: [step1, { ...step1, id: 'blockId' }] }}
          >
            <TestEditorState />
            <CommandUndoItem variant="icon-button" />
            <CommandRedoItem variant="icon-button" />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current({
      target: 'blockId',
      source: 'SocialPreview',
      sourceHandle: null
    })
    await waitFor(() => expect(mockResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: blockId')).toBeInTheDocument()
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    const redo = screen.getByRole('button', { name: 'Redo' })
    await waitFor(() => expect(redo).not.toBeDisabled())
    fireEvent.click(redo)
    await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: blockId')).toBeInTheDocument()
  })

  it('should update nextBlockId for step block edge and undo/redo', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const mockUndoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const mockRedoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...stepBlockNextBlockUpdateToStepMock,
              result: mockResult
            },
            {
              request: {
                ...stepBlockNextBlockUpdateToStepMock.request,
                variables: { id: 'step0.id', nextBlockId: null }
              },
              result: mockUndoResult
            },
            {
              ...stepBlockNextBlockUpdateToStepMock,
              result: mockRedoResult
            }
          ]}
        >
          <EditorProvider
            initialState={{ steps: [{ ...step1, id: 'step0.id' }, step1] }}
          >
            <TestEditorState />
            <CommandUndoItem variant="icon-button" />
            <CommandRedoItem variant="icon-button" />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current({
      target: 'step1.id',
      source: 'step0.id',
      sourceHandle: null
    })
    await waitFor(() => expect(mockResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step0.id')).toBeInTheDocument()
    const redo = screen.getByRole('button', { name: 'Redo' })
    await waitFor(() => expect(redo).not.toBeDisabled())
    fireEvent.click(redo)
    await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
  })

  it('should update navigateToBlockAction for action edge and undo/redo', async () => {
    const blockActionResult = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...blockActionNavigateToBlockUpdateMock,
              result: blockActionResult
            }
          ]}
        >
          <EditorProvider initialState={{ steps: [step1] }}>
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    await result.current({
      target: 'step2.id',
      source: 'step1.id',
      sourceHandle: 'button2.id'
    })
    await waitFor(() => expect(blockActionResult).toHaveBeenCalled())
  })

  it('should update edge for source node change', async () => {
    const blockActionResult = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)

    const stepBlockResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)

    const { result } = renderHook(() => useUpdateEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                ...blockActionNavigateToBlockUpdateMock.request,
                variables: {
                  id: 'block1.id',
                  blockId: 'step2.id'
                }
              },
              result: blockActionResult
            },
            {
              request: {
                ...stepBlockNextBlockUpdateMock.request,
                variables: {
                  id: 'step1.id',
                  nextBlockId: null
                }
              },
              result: stepBlockResult
            }
          ]}
        >
          <EditorProvider initialState={{ steps: [step1] }}>
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current({
      source: 'step1.id',
      sourceHandle: 'block1.id',
      target: 'step2.id',
      oldEdge: {
        id: 'oldEdge.id',
        source: 'step1.id',
        sourceHandle: null,
        target: 'step2.id'
      }
    })
    await waitFor(() => expect(stepBlockResult).toHaveBeenCalled())
  })
})
