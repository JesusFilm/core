import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/GetJourney'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'

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
                journeyId: 'journeyId',
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
})
