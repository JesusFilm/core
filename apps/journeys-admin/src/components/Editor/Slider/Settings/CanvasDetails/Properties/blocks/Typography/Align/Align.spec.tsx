import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { TypographyAlign } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../../__generated__/JourneyFields'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { TYPOGRAPHY_BLOCK_UPDATE_ALIGN } from './Align'

import { Align } from '.'

jest.mock('../../../../../../../../../libs/journeyUpdatedAtCacheUpdate', () => {
  return {
    journeyUpdatedAtCacheUpdate: jest.fn()
  }
})

describe('Typography align selector', () => {
  it('should show typography align properties', () => {
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
          <Align />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Left' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Right' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Center' })).toBeInTheDocument()
  })

  it('should change the align property', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: TypographyAlign.center,
      color: null,
      content: '',
      variant: null,
      children: []
    }
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          align: TypographyAlign.right
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_ALIGN,
              variables: {
                id: 'id',
                input: {
                  align: TypographyAlign.right
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <Align />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Center' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Right' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should undo the property change', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: TypographyAlign.center,
      color: null,
      content: '',
      variant: null,
      children: []
    }
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          align: TypographyAlign.right
        }
      }
    }))
    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          align: TypographyAlign.center
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_ALIGN,
              variables: {
                id: 'id',
                input: {
                  align: TypographyAlign.right
                }
              }
            },
            result: result1
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_ALIGN,
              variables: {
                id: 'id',
                input: {
                  align: TypographyAlign.center
                }
              }
            },
            result: result2
          }
        ]}
      >
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <Align />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Right' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })
})
