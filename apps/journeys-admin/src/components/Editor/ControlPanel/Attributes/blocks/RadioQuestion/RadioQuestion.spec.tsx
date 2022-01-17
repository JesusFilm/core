import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { RadioQuestion } from '.'

describe('Radio Question Attribute', () => {
  it('shows default attributes', () => {
    const block: TreeBlock<RadioQuestionBlock> = {
      id: 'radio-question.id',
      __typename: 'RadioQuestionBlock',
      parentBlockId: null,
      label: 'Radio Question',
      description: null,
      children: []
    }

    const { getByText } = render(<RadioQuestion {...block} />)
    expect(getByText('None')).toBeInTheDocument()
    expect(getByText('Radio Question')).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<RadioQuestionBlock> = {
      id: 'radio-question.id',
      __typename: 'RadioQuestionBlock',
      parentBlockId: 'step.id',
      label: 'Radio Question',
      description: 'Radio Description',
      children: []
    }

    const { getByText } = render(<RadioQuestion {...block} />)
    expect(getByText('Radio Description')).toBeInTheDocument()
  })
})
