import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { ButtonSize } from '../../../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_UPDATE } from './Size'

import { Size } from '.'

describe('Button size selector', () => {
  it('should show button size properties', () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: ButtonSize.medium,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Size />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
  })

  it('should change the size property', async () => {
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
          size: 'small'
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
                  size: 'small'
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
            <Size />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
