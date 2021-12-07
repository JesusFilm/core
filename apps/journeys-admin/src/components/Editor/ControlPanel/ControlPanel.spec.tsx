import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { ControlPanel } from '../ControlPanel'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'

describe('ControlPanel', () => {
  it('should render the element', () => {
    const step1: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const step2: TreeBlock<StepBlock> = {
      id: 'step2.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: true,
      nextBlockId: null,
      children: []
    }
    const setSelectedStep = jest.fn()
    const { getByTestId, getByText, getByRole, rerender } = render(
      <ControlPanel steps={[step1, step2]} onSelectStep={setSelectedStep} />
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).toBeDisabled()
    fireEvent.click(getByTestId('step-step1.id'))
    expect(setSelectedStep).toHaveBeenCalledWith(step1)
    rerender(
      <ControlPanel
        steps={[step1, step2]}
        selectedStep={step1}
        onSelectStep={setSelectedStep}
      />
    )
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Cards' }))
    rerender(
      <ControlPanel
        steps={[step1, step2]}
        selectedStep={step2}
        onSelectStep={setSelectedStep}
      />
    )
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
  })
})
