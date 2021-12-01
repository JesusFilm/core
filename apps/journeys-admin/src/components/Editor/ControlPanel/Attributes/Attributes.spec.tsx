import { TreeBlock } from '@core/journeys/ui'
import { render } from '@testing-library/react'
import { Attributes } from '.'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'

describe('Attributes', () => {
  it('should render the element', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByText } = render(<Attributes selected={step} />)
    expect(getByText('step.id')).toBeInTheDocument()
  })
})
