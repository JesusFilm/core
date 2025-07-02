import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import { TypographyVariant } from '../../../../../../../../../../__generated__/globalTypes'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { TYPOGRAPHY_BLOCK_UPDATE_VARIANT } from './Variant'

import { Variant } from '.'

describe('Typography variant selector', () => {
  it('should show variant properties', () => {
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
    ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Body 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 3' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 4' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 5' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 6' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Overline' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Caption' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
  })

  it('should change the variant property', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: TypographyVariant.h1,
      children: []
    ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          variant: TypographyVariant.overline
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_VARIANT,
              variables: {
                id: 'id',
                input: {
                  variant: TypographyVariant.overline
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              language: { bcp47: 'en' }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <Variant />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Header 1' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(getByRole('button', { name: 'Overline' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo the property change', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: TypographyVariant.h1,
      children: []
    ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
    const result1 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          variant: TypographyVariant.overline
        }
      }
    }))
    const result2 = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          variant: TypographyVariant.h1
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_VARIANT,
              variables: {
                id: 'id',
                input: {
                  variant: TypographyVariant.overline
                }
              }
            },
            result: result1
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_VARIANT,
              variables: {
                id: 'id',
                input: {
                  variant: TypographyVariant.h1
                }
              }
            },
            result: result2
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              language: { bcp47: 'en' }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <Variant />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Overline' }))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})
