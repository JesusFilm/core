import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { Step } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourneyForEdit'

describe('Step', () => {
  it('shows default messages', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'step1.id',
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByText } = render(<Step {...step} />)
    expect(getByText('Next Card')).toBeInTheDocument()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
  })

  it('shows locked', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'step1.id',
      locked: true,
      nextBlockId: null,
      children: []
    }
    const { getByText } = render(<Step {...step} />)
    expect(getByText('Next Card')).toBeInTheDocument()
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
  })
})
