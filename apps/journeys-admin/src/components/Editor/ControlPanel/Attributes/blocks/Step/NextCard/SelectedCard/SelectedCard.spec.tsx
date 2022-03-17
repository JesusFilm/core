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
import { SelectedCard, STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE } from '.'

describe('Selected Card', () => {
  const selectedBlock: TreeBlock<StepBlock> = {
    id: 'step0.id',
    nextBlockId: 'step2.id',
    parentBlockId: null,
    __typename: 'StepBlock',
    parentOrder: 0,
    locked: false,
    children: []
  }

  const nextBlock: TreeBlock<StepBlock> = {
    ...selectedBlock,
    id: 'step1.id',
    nextBlockId: 'step2.id'
  }

  const lastBlock: TreeBlock<StepBlock> = {
    ...selectedBlock,
    id: 'step2.id',
    nextBlockId: 'step0.id'
  }

  const steps = [selectedBlock, nextBlock, lastBlock]

  it('updates nextBlockId to the step itself on remove button click', async () => {
    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          id: 'step0.id',
          nextBlockId: 'step0.id'
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_BLOCK_DEFAULT_NEXT_BLOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  nextBlockId: selectedBlock.id
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
            <SelectedCard />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('removeCustomNextStep'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
