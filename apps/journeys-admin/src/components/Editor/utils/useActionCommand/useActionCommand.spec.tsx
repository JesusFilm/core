import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockActionDelete,
  BlockActionDeleteVariables
} from '../../../../../__generated__/BlockActionDelete'
import { TestEditorState } from '../../../../libs/TestEditorState'
import { BLOCK_ACTION_DELETE } from '../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation'
import { blockActionEmailUpdateMock } from '../../../../libs/useBlockActionEmailUpdateMutation/useBlockActionEmailUpdateMutation.mock'
import { blockActionLinkUpdateMock } from '../../../../libs/useBlockActionLinkUpdateMutation/useBlockActionLinkUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandRedoItem } from '../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Toolbar/Items/CommandUndoItem'

import { useActionCommand } from '.'

const blockActionDeleteMock: MockedResponse<
  BlockActionDelete,
  BlockActionDeleteVariables
> = {
  request: {
    query: BLOCK_ACTION_DELETE,
    variables: {
      id: 'button2.id'
    }
  },
  result: {
    data: {
      blockDeleteAction: {
        __typename: 'ButtonBlock',
        id: 'button2.id'
      }
    }
  }
}

describe('useActionCommand', () => {
  describe('addAction', () => {
    it('should call actionLinkUpdate and handle undo/redo', async () => {
      // TODO TEST: update for new props (customizable, parentStepId)
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const mockRedoResult = jest
        .fn()
        .mockReturnValue(blockActionLinkUpdateMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionLinkUpdateMock,
              { ...blockActionDeleteMock, result: mockResult },
              { ...blockActionLinkUpdateMock, result: mockRedoResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              <CommandRedoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'LinkAction',
          url: 'https://github.com',
          parentBlockId: 'button2.id',
          gtmEventName: '',
          customizable: false,
          parentStepId: null
        },
        undoAction: null
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })

    it('should call actionEmailUpdate and handle undo/redo', async () => {
      // TODO TEST: update for new props (customizable, parentStepId)
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const mockRedoResult = jest
        .fn()
        .mockReturnValue(blockActionEmailUpdateMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionEmailUpdateMock,
              { ...blockActionDeleteMock, result: mockResult },
              { ...blockActionEmailUpdateMock, result: mockRedoResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              <CommandRedoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'EmailAction',
          email: 'edmondwashere@gmail.com',
          parentBlockId: 'button2.id',
          gtmEventName: '',
          customizable: false,
          parentStepId: null
        },
        undoAction: null
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })

    it('should call actionNavigateToBlockUpdate and handle undo/redo', async () => {
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const mockRedoResult = jest
        .fn()
        .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionNavigateToBlockUpdateMock,
              { ...blockActionDeleteMock, result: mockResult },
              {
                ...blockActionNavigateToBlockUpdateMock,
                result: mockRedoResult
              }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              <CommandRedoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'NavigateToBlockAction',
          blockId: 'step2.id',
          parentBlockId: 'button2.id',
          gtmEventName: ''
        },
        undoAction: null
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })

    it('should call actionDelete and handle undo/redo', async () => {
      const mockResult = jest
        .fn()
        .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
      const mockRedoResult = jest
        .fn()
        .mockReturnValue(blockActionDeleteMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionDeleteMock,
              { ...blockActionNavigateToBlockUpdateMock, result: mockResult },
              { ...blockActionDeleteMock, result: mockRedoResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              <CommandRedoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: null,
        undoAction: {
          __typename: 'NavigateToBlockAction',
          blockId: 'step2.id',
          parentBlockId: 'button2.id',
          gtmEventName: ''
        }
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })

    it('should dispatch editor focus and undo editor focus', async () => {
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <EditorProvider>
            <MockedProvider
              mocks={[
                blockActionLinkUpdateMock,
                { ...blockActionDeleteMock, result: mockResult }
              ]}
            >
              <CommandProvider>
                <TestEditorState />
                <CommandUndoItem variant="icon-button" />
                {children}
              </CommandProvider>
            </MockedProvider>
          </EditorProvider>
        )
      })
      result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'LinkAction',
          url: 'https://github.com',
          parentBlockId: 'button2.id',
          gtmEventName: '',
          customizable: false,
          parentStepId: null
        },
        undoAction: null,
        editorFocus: {
          activeContent: ActiveContent.Social
        },
        undoEditorFocus: {
          activeContent: ActiveContent.Canvas
        }
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      expect(screen.getByText('activeContent: social')).toBeInTheDocument()
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    })
  })
})
