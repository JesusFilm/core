import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../__generated__/GetJourney'
import { NextCard, STEP_BLOCK_LOCK_UPDATE } from './NextCard'

describe('NextCard', () => {
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
                input: {
                  locked: true,
                  nextBlockId: selectedBlock.nextBlockId
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <NextCard id="step1.id" />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
