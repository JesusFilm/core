import { render, fireEvent } from '@testing-library/react'
import { Canvas } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'
import { ThemeProvider } from '../../ThemeProvider'

describe('Canvas', () => {
  it('should call onSelect when step is clicked on', () => {
    const onSelect = jest.fn()
    const step0: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <Canvas onSelect={onSelect} steps={[step0, step1]} selected={step0} />
    )
    fireEvent.click(getByTestId('step-step1.id'))
    expect(onSelect).toHaveBeenCalledWith(step1)
  })

  it('should show border around selected', () => {
    const onSelect = jest.fn()
    const step0: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId, rerender } = render(
      <ThemeProvider>
        <Canvas onSelect={onSelect} steps={[step0, step1]} selected={step0} />
      </ThemeProvider>
    )
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 3px solid #b62d1c'
    )
    fireEvent.click(getByTestId('step-step1.id'))
    expect(onSelect).toHaveBeenCalledWith(step1)
    rerender(
      <ThemeProvider>
        <Canvas onSelect={onSelect} steps={[step0, step1]} selected={step1} />
      </ThemeProvider>
    )
    expect(getByTestId('step-step0.id')).toHaveStyle(
      'border: 3px solid #efefef'
    )
  })
})
