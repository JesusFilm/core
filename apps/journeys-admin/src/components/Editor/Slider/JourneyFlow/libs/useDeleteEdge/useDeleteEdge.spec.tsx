import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { blockActionDeleteMock } from '../../../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import {
  stepBlockNextBlockUpdateMock,
  stepBlockNextBlockUpdateToStepMock
} from '../../../../../../libs/useStepBlockNextBlockUpdateMutation/useStepBlockNextBlockUpdateMutation.mock'
import { CommandRedoItem } from '../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem'

import { useDeleteEdge } from './useDeleteEdge'

const block = {
  __typename: 'ButtonBlock',
  id: 'block1.id',
  action: {
    __typename: 'NavigateToBlockAction',
    blockId: 'step2.id',
    parentBlockId: 'block1.id',
    gtmEventName: ''
  },
  children: []
} as unknown as TreeBlock<ButtonBlock>
const step0: TreeBlock<StepBlock> = {
  id: 'step0.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  children: []
}
const step1: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 1,
  locked: false,
  nextBlockId: null,
  children: [block]
}
const step2: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: null,
  children: []
}

describe('useDeleteEdge', () => {
  it('should delete an edge from a step and undo/redo', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const mockUndoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const mockRedoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...stepBlockNextBlockUpdateMock, result: mockResult },
            { ...stepBlockNextBlockUpdateToStepMock, result: mockUndoResult },
            { ...stepBlockNextBlockUpdateMock, result: mockRedoResult }
          ]}
        >
          <EditorProvider
            initialState={{
              steps: [{ ...step0, nextBlockId: 'step1.id' }, step1]
            }}
          >
            <TestEditorState />
            <CommandUndoItem variant="icon-button" />
            <CommandRedoItem variant="icon-button" />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current({ source: 'step0.id', sourceHandle: null })
    await waitFor(() => expect(mockResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step0.id')).toBeInTheDocument()
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    const redo = screen.getByRole('button', { name: 'Redo' })
    await waitFor(() => expect(redo).not.toBeDisabled())
    fireEvent.click(redo)
    await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step0.id')).toBeInTheDocument()
  })

  it('should delete an edge from a block action and undo/redo', async () => {
    const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
    const mockUndoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const mockRedoResult = jest
      .fn()
      .mockReturnValue(stepBlockNextBlockUpdateMock.result)
    const { result } = renderHook(() => useDeleteEdge(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...blockActionDeleteMock, result: mockResult },
            {
              request: {
                ...blockActionNavigateToBlockUpdateMock.request,
                variables: { id: 'block1.id', blockId: 'step2.id' }
              },
              result: mockUndoResult
            },
            { ...blockActionDeleteMock, result: mockRedoResult }
          ]}
        >
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <TestEditorState />
            <CommandUndoItem variant="icon-button" />
            <CommandRedoItem variant="icon-button" />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current({ source: 'step1.id', sourceHandle: 'block1.id' })
    await waitFor(() => expect(mockResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step2.id')).toBeInTheDocument()
    const redo = screen.getByRole('button', { name: 'Redo' })
    await waitFor(() => expect(redo).not.toBeDisabled())
    fireEvent.click(redo)
    await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
  })
})
