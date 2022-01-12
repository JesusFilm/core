import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { Step } from '.'

const block: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'Step1',
  parentBlockId: null,
  nextBlockId: null,
  locked: false,
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      parentBlockId: 'Step1',
      description: 'question description',
      children: []
    },
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question2',
      label: 'Question 2',
      parentBlockId: 'Step1',
      description: 'question description',
      children: []
    }
  ]
}

describe('RadioQuestion', () => {
  it('should render blocks', () => {
    const { getByText } = renderWithApolloClient(<Step {...block} />)
    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
  })
})
