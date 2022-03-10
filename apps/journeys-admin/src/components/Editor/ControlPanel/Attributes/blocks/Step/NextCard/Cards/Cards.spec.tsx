import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../../../../libs/context'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../../../../__generated__/globalTypes'
import { Cards, STEP_BLOCK_NEXT_BLOCK_UPDATE } from './Cards'

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
          journeyId: 'journeyId',
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
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
