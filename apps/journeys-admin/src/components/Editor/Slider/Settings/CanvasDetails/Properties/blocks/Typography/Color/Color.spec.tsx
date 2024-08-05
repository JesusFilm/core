import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyColor } from '../../../../../../../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { TYPOGRAPHY_BLOCK_UPDATE_COLOR } from './Color'

import { Color } from '.'

describe('Typography color selector', () => {
  it('should show typography color properties', () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      children: []
    }
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })

  it('should change the color property', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: TypographyColor.error,
      content: '',
      variant: null,
      children: []
    }
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          color: TypographyColor.secondary
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                color: TypographyColor.secondary
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Error' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the property change', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: TypographyColor.error,
      content: '',
      variant: null,
      children: []
    }
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          color: TypographyColor.secondary
        }
      }
    }))
    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          color: TypographyColor.error
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                color: TypographyColor.secondary
              }
            },
            result: result1
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                color: TypographyColor.error
              }
            },
            result: result2
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
