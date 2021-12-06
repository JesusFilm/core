import { render, fireEvent } from '@testing-library/react'
import { Canvas } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'

describe('Canvas', () => {
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
      <Canvas onSelect={onSelect} steps={[step]} />
    )
    fireEvent.click(getByTestId('step-step.id'))
    expect(onSelect).toHaveBeenCalledWith(step)
  })

  it('should show border around selected', () => {
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
      <Canvas onSelect={onSelect} steps={[step]} selected={step} />
    )
    expect(getByTestId('step-step.id')).toHaveStyle('border: 3px solid #1976d2')
  })
})
