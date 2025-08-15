import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { ButtonFields } from '../../../../../../../../__generated__/ButtonFields'
import { ButtonVariant } from '../../../../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { BUTTON_BLOCK_UPDATE_CONTENT, ButtonEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ButtonEdit', () => {
  const props: TreeBlock<ButtonFields> = {
    __typename: 'ButtonBlock',
    id: 'button.id',
    label: 'label',
    parentBlockId: 'card',
    parentOrder: 0,
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    children: [],
    settings: null
  }

  const mockLabelUpdate1 = {
    request: {
      query: BUTTON_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'button.id',
        label: 'label update'
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            label: 'label update'
          }
        ]
      }
    }))
  }

  const mockLabelUpdate2 = {
    request: {
      query: BUTTON_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'button.id',
        label: 'label'
      }
    },
    result: jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
            label: 'label'
          }
        ]
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('selects the input on click', () => {
    render(
      <MockedProvider>
        <ButtonEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
  })

  it('should submit if the label has changed', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <ButtonEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )
    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1, mockLabelUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <ButtonEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockLabelUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the undone label change', async () => {
    const redoLabelMock = {
      ...mockLabelUpdate1
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate1, mockLabelUpdate2, redoLabelMock])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <ButtonEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, ' update')
    await waitFor(() => expect(mockLabelUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockLabelUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoLabelMock.result).toHaveBeenCalled())
  })

  it('should not submit if the current value is the same', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockLabelUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <ButtonEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'label', {
      initialSelectionStart: 0,
      initialSelectionEnd: 5
    })

    await waitFor(() => expect(mockLabelUpdate2.result).not.toHaveBeenCalled())
  })
})
