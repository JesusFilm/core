import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'

import { SIGN_UP_BLOCK_UPDATE_CONTENT, SignUpEdit } from '.'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

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

  it('saves the signUp label on onBlur', async () => {
    const result = jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIGN_UP_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'signUp',
                input: {
                  submitLabel: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
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

    const mockUpdateSuccess1 = {
      request: {
        query: SIGN_UP_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'signUp',
          input: {
            submitLabel: 'updated label'
          }
        }
      },
      result: result1
    }

    const mockUpdateSuccess2 = {
      request: {
        query: SIGN_UP_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'signUp',
          input: {
            submitLabel: 'Submit'
          }
        }
      },
      result: result2
    }

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
    fireEvent.change(input, { target: { value: 'updated label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the undone label change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    const result2 = jest.fn(() => ({
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

    const mockUpdateSuccess1 = {
      request: {
        query: SIGN_UP_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'signUp',
          input: {
            submitLabel: 'updated label'
          }
        }
      },
      result: result1,
      maxUsageCount: 2
    }

    const mockUpdateSuccess2 = {
      request: {
        query: SIGN_UP_BLOCK_UPDATE_CONTENT,
        variables: {
          id: 'signUp',
          input: {
            submitLabel: 'Submit'
          }
        }
      },
      result: result2
    }

    render(
      <MockedProvider mocks={[mockUpdateSuccess1, mockUpdateSuccess2]}>
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
    fireEvent.change(input, { target: { value: 'updated label' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
