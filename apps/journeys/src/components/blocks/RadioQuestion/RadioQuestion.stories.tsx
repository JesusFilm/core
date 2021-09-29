import { Story, Meta } from '@storybook/react'
import {
  GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock
} from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestion } from './RadioQuestion'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { MockedProvider } from '@apollo/client/testing'

const options: Array<TreeBlock<RadioOptionBlock>> = [
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
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Watch more videos about Jesus',
    id: 'Question3',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Ask a question',
    id: 'Question4',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  }
]

const longLabel: Array<TreeBlock<RadioOptionBlock>> = [
  {
    __typename: 'RadioOptionBlock',
    label:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    id: 'Question1',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label:
      'when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting',
    id: 'Question2',
    parentBlockId: 'MoreQuestions',
    action: null,
    children: []
  }
]

const Demo = {
  ...journeysConfig,
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion'
}

const DefaultTemplate: Story<TreeBlock<RadioQuestionBlock>> = ({
  ...props
}) => (
  <MockedProvider>
    <RadioQuestion {...props} />
  </MockedProvider>
)

export const Default: Story<TreeBlock<RadioQuestionBlock>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'MoreQuestions',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children: options,
  parentBlockId: 'Step1'
}

export const Long: Story<TreeBlock<RadioQuestionBlock>> = DefaultTemplate.bind(
  {}
)
Long.args = {
  id: 'MoreQuestions',
  label: 'Have you accepted Jesus in your life?',
  description:
    'Have you declared that you want to accept Jesus in your life as your Lord and savior?',
  children: longLabel
}

export default Demo as Meta
