import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { Card } from '.'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'

const block: TreeBlock<CardBlock> = {
  __typename: 'CardBlock',
  id: 'Card1',
  parentBlockId: null,
  backgroundColor: 'green',
  fontColor: 'blue',
  imgSrc: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      parentBlockId: 'Card1',
      description: 'question description',
      variant: null,
      children: []
    }
  ]
}

describe('CardBlock', () => {
  it('should render children', () => {
    const { getByText } = renderWithApolloClient(
      <Card {...block} />
    )

    expect(getByText('Question 1')).toBeInTheDocument()
  })
})
