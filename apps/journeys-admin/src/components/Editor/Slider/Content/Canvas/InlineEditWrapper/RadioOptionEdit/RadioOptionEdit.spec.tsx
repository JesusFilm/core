import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { RadioOptionFields } from '../../../../../../../../__generated__/RadioOptionFields'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { RADIO_OPTION_BLOCK_UPDATE_CONTENT, RadioOptionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    pollOptionImageId: null,
    children: []
  }

  const mockRadioOptionUpdate1 = {
    request: {
      query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'option.id',
        input: {
          label: 'new label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'new label'
          }
        ]
      }
    }))
  }

  const mockRadioOptionUpdate2 = {
    request: {
      query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
      variables: {
        id: 'option.id',
        input: {
          label: 'test label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
            label: 'test label'
          }
        ]
      }
    }))
  }

  beforeEach(() => jest.clearAllMocks())

  it('selects the input on click', () => {
    render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Add your text here...')
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockRadioOptionUpdate1, mockRadioOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() =>
      expect(mockRadioOptionUpdate1.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).toHaveBeenCalled()
    )
  })

  it('should redo the change to label that was undone', async () => {
    const redoUpdateMock = {
      ...mockRadioOptionUpdate1
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([
        mockRadioOptionUpdate1,
        mockRadioOptionUpdate2,
        redoUpdateMock
      ])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() =>
      expect(mockRadioOptionUpdate1.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoUpdateMock.result).toHaveBeenCalled())
  })

  it('should not save if label hasnt changed', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockRadioOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <EditorProvider>
          <RadioOptionEdit {...props} />
        </EditorProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'test label')
    await waitFor(() =>
      expect(mockRadioOptionUpdate2.result).not.toHaveBeenCalled()
    )
  })
})
