import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_MIN_ROWS_UPDATE } from './MinRows'

import { MinRows } from '.'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const selectedBlock: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse.id',
  parentBlockId: null,
  parentOrder: null,
  label: 'Your answer here',
  hint: null,
  minRows: 3,
  integrationId: null,
  type: null,
  routeId: null,
  children: []
}

const minRowsUpdate1 = {
  request: {
    query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
    variables: {
      id: selectedBlock.id,
      minRows: 4
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseBlockUpdate: {
        id: selectedBlock.id,
        minRows: 4
      }
    }
  }))
}

const minRowsUpdate2 = {
  request: {
    query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
    variables: {
      id: selectedBlock.id,
      minRows: 3
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseBlockUpdate: {
        id: selectedBlock.id,
        minRows: 3
      }
    }
  }))
}

const minRowsUpdate3 = {
  request: {
    query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
    variables: {
      id: selectedBlock.id,
      minRows: 4
    }
  },
  result: jest.fn(() => ({
    data: {
      textResponseBlockUpdate: {
        id: selectedBlock.id,
        minRows: 4
      }
    }
  }))
}

beforeEach(() => jest.clearAllMocks())

describe('MinRows', () => {
  it('should select Three Rows by default', () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Three Rows' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('should change rows of text response', async () => {
    render(
      <MockedProvider mocks={[minRowsUpdate1]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(minRowsUpdate1.result).toHaveBeenCalled())
  })

  it('should undo min rows change', async () => {
    render(
      <MockedProvider
        mocks={[minRowsUpdate1, minRowsUpdate2]}
        addTypename={false}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(minRowsUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(minRowsUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the change to min rows that was undone', async () => {
    render(
      <MockedProvider
        mocks={[minRowsUpdate1, minRowsUpdate2, minRowsUpdate3]}
        addTypename={false}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(minRowsUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(minRowsUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(minRowsUpdate3.result).toHaveBeenCalled())
  })

  it('should not call mutation if no selected block', async () => {
    render(
      <MockedProvider mocks={[minRowsUpdate1]} addTypename={false}>
        <EditorProvider initialState={{}}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(minRowsUpdate1.result).not.toHaveBeenCalled())
  })
})
