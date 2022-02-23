import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../__generated__/GetJourney'
import { Conditions, STEP_BLOCK_LOCK_UPDATE } from './Conditions'

describe('Conditions', () => {
  it('display the correct text', () => {
    const selectedBlock: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: []
    }

    const { getByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Conditions />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByText('Lock the next step')).toBeInTheDocument()
  })

  it('toggles the lock property of step block', async () => {
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
          id: selectedBlock.id,
          __typename: 'StepBlock',
          locked: true
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
                id: 'step1.id',
                input: {
                  locked: true,
                  nextBlockId: 'step2.id'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Conditions />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
