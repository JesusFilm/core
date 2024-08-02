import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_LABEL_UPDATE } from './Label'

import { ApolloLink } from '@apollo/client'
import userEvent from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'
import { Label } from '.'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
  minRows: null,
  integrationId: null,
  type: null,
  routeId: null,
  children: []
}

const mockUpdateSuccess1 = {
  request: {
    query: TEXT_RESPONSE_LABEL_UPDATE,
    variables: {
      id: block.id,
      label: 'Your answer here more'
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseBlockUpdate: {
        id: block.id,
        label: 'Your answer here more'
      }
    }
  }))
}

const mockUpdateSuccess2 = {
  request: {
    query: TEXT_RESPONSE_LABEL_UPDATE,
    variables: {
      id: block.id,
      label: 'Your answer here'
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseBlockUpdate: {
        id: block.id,
        label: 'Your answer here'
      }
    }
  }))
}

describe('Edit Label field', () => {
  it('should display label value', () => {
    render(
      <MockedProvider mocks={[mockUpdateSuccess1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )
    const field = screen.getByRole('textbox', { name: 'Label' })

    expect(field).toHaveValue('Your answer here')
  })

  it('should not be able to type beyond max character limit', () => {
    render(
      <MockedProvider mocks={[mockUpdateSuccess1]} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )
    const field = screen.getByRole('textbox', { name: 'Label' })

    expect(field).toHaveAttribute('maxlength', '250')
  })

  it('should change the label', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })

    userEvent.type(field, ' more')
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockUpdateSuccess1, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <Label />
        </EditorProvider>
      </MockedProvider>
    )
    const field = screen.getByRole('textbox', { name: 'Label' })
    userEvent.type(field, ' more')
    await waitFor(() => expect(mockUpdateSuccess1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())
  })

  it('should redo the change to label that was undone', async () => {
    const firstUpdateMock = {
      ...mockUpdateSuccess1,
      maxUsageCount: 2
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([firstUpdateMock, mockUpdateSuccess2])
    ])

    render(
      <MockedProvider link={link} addTypename={false}>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Label />
        </EditorProvider>
      </MockedProvider>
    )

    const field = screen.getByRole('textbox', { name: 'Label' })
    userEvent.type(field, ' more')

    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockUpdateSuccess2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(firstUpdateMock.result).toHaveBeenCalled())
  })
})
