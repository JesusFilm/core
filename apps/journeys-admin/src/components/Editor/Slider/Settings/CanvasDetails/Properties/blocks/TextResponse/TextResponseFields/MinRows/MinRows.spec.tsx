import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../../../../../../../../../__generated__/JourneyFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_MIN_ROWS_UPDATE } from './MinRows'

import { MinRows } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock(
  '../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate',
  () => {
    return {
      journeyUpdatedAtCacheUpdate: jest.fn()
    }
  }
)

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

const mockMinRowsUpdate1 = {
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

const mockMinRowsUpdate2 = {
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

const mockMinRowsUpdate3 = {
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

describe('MinRows', () => {
  beforeEach(() => jest.clearAllMocks())

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
      <MockedProvider mocks={[mockMinRowsUpdate1]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <MinRows />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(mockMinRowsUpdate1.result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should undo min rows change', async () => {
    render(
      <MockedProvider
        mocks={[mockMinRowsUpdate1, mockMinRowsUpdate2]}
        addTypename={false}
      >
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <MinRows />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(mockMinRowsUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockMinRowsUpdate2.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should redo the change to min rows that was undone', async () => {
    render(
      <MockedProvider
        mocks={[mockMinRowsUpdate1, mockMinRowsUpdate2, mockMinRowsUpdate3]}
        addTypename={false}
      >
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <MinRows />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(mockMinRowsUpdate1.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockMinRowsUpdate2.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockMinRowsUpdate3.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should not call mutation if no selected block', async () => {
    render(
      <MockedProvider mocks={[mockMinRowsUpdate1]} addTypename={false}>
        <EditorProvider initialState={{}}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() =>
      expect(mockMinRowsUpdate1.result).not.toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(journeyUpdatedAtCacheUpdate).not.toHaveBeenCalled()
    )
  })
})
