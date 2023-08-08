import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { ButtonVariant } from '../../../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_UPDATE } from './Variant'

import { Variant } from '.'

describe('Button variant selector', () => {
  it('should show button variant properties', () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Variant />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
  })

  it('should change the Variant property', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          variant: ButtonVariant.text
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_UPDATE,
              variables: {
                id: 'id',
                journeyId: 'journeyId',
                input: {
                  variant: 'text'
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
            <Variant />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Contained' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
