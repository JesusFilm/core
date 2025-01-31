import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL, SignUpEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('SignUpEdit', () => {
  const props: TreeBlock<SignUpFields> = {
    id: 'signUp',
    __typename: 'SignUpBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    submitLabel: 'Submit',
    submitIconId: null,
    action: null,
    children: []
  }

  const mockUpdateSuccess1 = {
    request: {
      query: SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL,
      variables: {
        id: 'signUp',
        submitLabel: 'Submit update'
      }
    },
    result: jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp',
            submitLabel: 'Submit update'
          }
        ]
      }
    }))
  }

  const mockUpdateSuccess2 = {
    request: {
      query: SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL,
      variables: {
        id: 'signUp',
        submitLabel: 'Submit'
      }
    },
    result: jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp',
            submitLabel: 'Submit'
          }
        ]
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('selects the input on click', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUpEdit {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.click(input)
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('should submit if the value has changed', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1])
    ])

    render(
      <MockedProvider link={link}>
        <SnackbarProvider>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link}>
        <SnackbarProvider>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())
  })

  it('should redo the undone label change', async () => {
    const firstUpdateMock = {
      ...mockUpdateSuccess1,
      maxUsageCount: 2
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([firstUpdateMock, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link}>
        <SnackbarProvider>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())
  })

  it('should not submit if the current value is the same', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link}>
        <SnackbarProvider>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'Submit', {
      initialSelectionStart: 0,
      initialSelectionEnd: 5
    })

    await waitFor(() =>
      expect(mockUpdateSuccess2.result).not.toHaveBeenCalled()
    )
  })
})
