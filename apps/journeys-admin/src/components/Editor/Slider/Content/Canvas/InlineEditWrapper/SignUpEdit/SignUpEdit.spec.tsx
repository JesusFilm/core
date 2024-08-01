import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'

import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'
import { SIGN_UP_BLOCK_UPDATE_SUBMIT_LABEL } from './SignUpEdit'

import { SignUpEdit } from '.'

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

  beforeEach(() => jest.clearAllMocks())

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
    render(
      <MockedProvider mocks={[mockUpdateSuccess1]}>
        <SnackbarProvider>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Submit update   ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())
  })

  it('should not submit if the current value is the same', async () => {
    render(
      <MockedProvider mocks={[mockUpdateSuccess1]}>
        <SnackbarProvider>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Submit   ' } })
    fireEvent.blur(input)
    await waitFor(() =>
      expect(mockUpdateSuccess1.result).not.toHaveBeenCalled()
    )
  })

  it('should undo the label change', async () => {
    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
        <SnackbarProvider>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Submit update' } })
    fireEvent.blur(input)
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())
  })

  it('should redo the undone label change', async () => {
    const firstUpdateMock = {
      ...mockUpdateSuccess1,
      maxUsageCount: 2
    }

    render(
      <MockedProvider mocks={[firstUpdateMock, mockUpdateSuccess2]}>
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
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: 'Submit update' } })
    fireEvent.blur(input)
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())
  })
})
