import { TreeBlock } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { EditorProvider } from '../Context'
import { ControlPanel } from '.'

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
    const { getByTestId, getByText, getByRole } = render(
      <EditorProvider initialState={{ steps: [step1, step2] }}>
        <ControlPanel />
      </EditorProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('step-step1.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Cards' }))
    fireEvent.click(getByTestId('step-step2.id'))
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
  })
})
