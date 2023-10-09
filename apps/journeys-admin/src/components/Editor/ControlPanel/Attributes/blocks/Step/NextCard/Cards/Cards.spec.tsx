import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'

import { Cards, STEP_BLOCK_NEXT_BLOCK_UPDATE } from './Cards'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Cards', () => {
  it('updates the next step on click', async () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: 'step2.id',
      parentOrder: 0,
      locked: false,
      children: []
    }

    const nextBlock: TreeBlock<StepBlock> = {
      id: 'step2.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: 'step0.id',
      parentOrder: 0,
      locked: false,
      children: []
    }

    const steps = [selectedBlock, nextBlock]

    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          id: 'step1.id',
          nextBlockId: 'step2.id'
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_BLOCK_NEXT_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  nextBlockId: selectedBlock.nextBlockId
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
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ steps, selectedBlock }}>
            <Cards />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('preview-step2.id'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
