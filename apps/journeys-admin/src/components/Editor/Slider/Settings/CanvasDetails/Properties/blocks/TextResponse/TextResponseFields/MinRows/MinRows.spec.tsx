import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_MIN_ROWS_UPDATE } from './MinRows'

import { MinRows } from '.'

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

describe('MinRows', () => {
  it('should select Three Rows by default', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Three Rows' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('should change rows of text response', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          minRows: 4
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: { minRows: 4 }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo min rows change', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          journeyId: 'journey.id'
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          minRows: 3
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  minRows: 4
                }
              }
            },
            result: result1
          },
          {
            request: {
              query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  minRows: 3
                }
              }
            },
            result: result2
          }
        ]}
        addTypename={false}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <MinRows />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should redo the change to min rows that was undone', async () => {
    const result1 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          minRows: 4
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          minRows: 3
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  minRows: 4
                }
              }
            },
            result: result1,
            maxUsageCount: 2
          },
          {
            request: {
              query: TEXT_RESPONSE_MIN_ROWS_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  minRows: 3
                }
              }
            },
            result: result2
          }
        ]}
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
    await waitFor(() => expect(result1).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
  })
})
