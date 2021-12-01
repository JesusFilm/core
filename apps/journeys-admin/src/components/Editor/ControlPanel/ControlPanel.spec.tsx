import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { ControlPanel } from '../ControlPanel'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'

describe('ControlPanel', () => {
  it('should render the element', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByTestId, getByText, getByRole } = render(
      <ControlPanel steps={[step]} />
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).toBeDisabled()
    fireEvent.click(getByTestId('step-step.id'))
    expect(getByText('step.id')).toBeInTheDocument()
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
  })
})
