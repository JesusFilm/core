import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { ControlPanel } from '.'

describe('ControlPanel', () => {
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
  it('should render the element', () => {
    const { getByTestId, getByText, getByRole } = render(
      <EditorProvider initialState={{ steps: [step1, step2] }}>
        <ControlPanel />
      </EditorProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step1.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Cards' }))
    fireEvent.click(getByTestId('preview-step2.id'))
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
  })

  it('should hide add button when clicking blocks tab', async () => {
    const { getByRole, queryByRole } = render(
      <EditorProvider initialState={{ steps: [step1, step2] }}>
        <ControlPanel />
      </EditorProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Blocks' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
  })

  it('should hide add button when clicking add button', async () => {
    const { getByRole, queryByRole } = render(
      <EditorProvider initialState={{ steps: [step1, step2] }}>
        <ControlPanel />
      </EditorProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
  })
})
