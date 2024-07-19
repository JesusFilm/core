import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { useActionCommand } from '.'
import {
  BlockActionDelete,
  BlockActionDeleteVariables
} from '../../../../../../../../../../../__generated__/BlockActionDelete'
import { TestEditorState } from '../../../../../../../../../../libs/TestEditorState'
import { BLOCK_ACTION_DELETE } from '../../../../../../../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation'
import { blockActionEmailUpdateMock } from '../../../../../../../../../../libs/useBlockActionEmailUpdateMutation/useBlockActionEmailUpdateMutation.mock'
import { blockActionLinkUpdateMock } from '../../../../../../../../../../libs/useBlockActionLinkUpdateMutation/useBlockActionLinkUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

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
    it('should call actionLinkUpdate and handle undo', async () => {
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionLinkUpdateMock,
              { ...blockActionDeleteMock, result: mockResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      await result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'LinkAction',
          url: 'https://github.com',
          parentBlockId: 'button2.id',
          gtmEventName: ''
        },
        undoAction: null
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
    })

    it('should call actionEmailUpdate and handle undo', async () => {
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionEmailUpdateMock,
              { ...blockActionDeleteMock, result: mockResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      await result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'EmailAction',
          email: 'edmondwashere@gmail.com',
          parentBlockId: 'button2.id',
          gtmEventName: ''
        },
        undoAction: null
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
    })

    it('should call actionNavigateToBlockUpdate and handle undo', async () => {
      const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionNavigateToBlockUpdateMock,
              { ...blockActionDeleteMock, result: mockResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      await result.current.addAction({
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
    })

    it('should call actionDelete and handle undo', async () => {
      const mockResult = jest
        .fn()
        .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
      const { result } = renderHook(() => useActionCommand(), {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              blockActionDeleteMock,
              { ...blockActionNavigateToBlockUpdateMock, result: mockResult }
            ]}
          >
            <CommandProvider>
              <CommandUndoItem variant="icon-button" />
              {children}
            </CommandProvider>
          </MockedProvider>
        )
      })
      await result.current.addAction({
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
    })

    it('should dispatch editor focus', async () => {
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
      await result.current.addAction({
        blockId: 'button2.id',
        blockTypename: 'ButtonBlock',
        action: {
          __typename: 'LinkAction',
          url: 'https://github.com',
          parentBlockId: 'button2.id',
          gtmEventName: ''
        },
        undoAction: null,
        editorFocus: {
          activeContent: ActiveContent.Social
        }
      })
      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      expect(screen.getByText('activeContent: social')).toBeInTheDocument()
    })
  })
})
