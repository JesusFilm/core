import { render, fireEvent } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { CardPreview } from '.'

describe('CardPreview', () => {
  it('should call onSelect when step is clicked on', () => {
    const onSelect = jest.fn()
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <CardPreview onSelect={onSelect} steps={[step]} />
    )
    fireEvent.click(getByTestId('step-step.id'))
    expect(onSelect).toHaveBeenCalledWith(step)
  })
})
