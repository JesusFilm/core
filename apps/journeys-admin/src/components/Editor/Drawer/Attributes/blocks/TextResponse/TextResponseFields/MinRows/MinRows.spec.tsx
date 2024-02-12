import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/GetJourney'

import { TEXT_RESPONSE_MIN_ROWS_UPDATE } from './MinRows'

import { MinRows } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('MinRows', () => {
  it('should select Three Rows by default', () => {
    const selectedBlock: TreeBlock<TextResponseBlock> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse.id',
      parentBlockId: null,
      parentOrder: null,
      label: 'Your answer here',
      hint: null,
      minRows: null,
      submitIconId: null,
      submitLabel: null,
      action: null,
      children: []
    }
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <MinRows />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Three Rows' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('should change rows of text response', async () => {
    const selectedBlock: TreeBlock<TextResponseBlock> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse.id',
      parentBlockId: null,
      parentOrder: null,
      label: 'Your answer here',
      hint: null,
      minRows: null,
      submitIconId: null,
      submitLabel: null,
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
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
                journeyId: 'journey.id',
                input: { minRows: 4 }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <MinRows />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Four Rows' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
