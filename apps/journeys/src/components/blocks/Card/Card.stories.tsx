import { Story, Meta } from '@storybook/react'
import { Card } from './Card'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

const Demo = {
  ...journeysConfig,
  component: Card,
  title: 'Journeys/Blocks/Card'
}

const DefaultTemplate: Story<TreeBlock<CardBlock>> = ({ ...props }) => (
  <Card {...props} />
)

export const Default: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'Card',
  backgroundColor: 'aliceblue',
  fontColor: 'black',
  imgSrc:
    'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      parentBlockId: 'Card1',
      description: 'question description',
      variant: null,
      children: [
        {
          __typename: 'RadioOptionBlock',
          label: 'Chat Privately',
          id: 'Question1',
          parentBlockId: 'MoreQuestions',
          action: null,
          children: []
        },
        {
          __typename: 'RadioOptionBlock',
          label: 'Get a bible',
          id: 'Question2',
          parentBlockId: 'MoreQuestions',
          action: null,
          children: []
        }
      ]
    }
  ]
}

export const NoImage: Story<TreeBlock<CardBlock>> = DefaultTemplate.bind({})
NoImage.args = {
  backgroundColor: 'black',
  fontColor: 'white',
  children: [
    {
      __typename: 'RadioQuestionBlock',
      id: 'Question1',
      label: 'Question 1',
      parentBlockId: 'Card1',
      description: 'question description',
      variant: null,
      children: [
        {
          __typename: 'RadioOptionBlock',
          label: 'Chat Privately',
          id: 'Question1',
          parentBlockId: 'MoreQuestions',
          action: null,
          children: []
        },
        {
          __typename: 'RadioOptionBlock',
          label: 'Get a bible',
          id: 'Question2',
          parentBlockId: 'MoreQuestions',
          action: null,
          children: []
        }
      ]
    }
  ]
}

export default Demo as Meta
