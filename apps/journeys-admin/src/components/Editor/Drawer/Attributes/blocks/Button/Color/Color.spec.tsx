import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { ButtonColor } from '../../../../../../../../__generated__/globalTypes'

import { BUTTON_BLOCK_UPDATE } from './Color'

import { Color } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Button color selector', () => {
  it('should show button color properties', () => {
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
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })

  it('should change the color property', async () => {
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
          color: ButtonColor.secondary
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
                  color: ButtonColor.secondary
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
            <Color />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
