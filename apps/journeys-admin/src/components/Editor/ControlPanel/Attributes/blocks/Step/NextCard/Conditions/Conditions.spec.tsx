import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '../../../../../../../../libs/context'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../../__generated__/GetJourney'
import { Conditions, STEP_BLOCK_LOCK_UPDATE } from './Conditions'

describe('Conditions', () => {
  it('changes the locked step state on click', async () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: 'step2.id',
      parentOrder: 0,
      locked: false,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        stepBlockUpdate: {
          id: 'step1.id',
          journeyId: 'journeyId',
          locked: false
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_BLOCK_LOCK_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  locked: true
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider initialState={{ selectedBlock }}>
            <Conditions />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
