import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/GetJourney'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'

import { TYPOGRAPHY_BLOCK_UPDATE_ALIGN } from './Align'

import { Align } from '.'

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
          journeyId: 'journeyId',
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
                journeyId: 'journeyId',
                input: {
                  align: TypographyAlign.right
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <Align />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Center' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Right' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
