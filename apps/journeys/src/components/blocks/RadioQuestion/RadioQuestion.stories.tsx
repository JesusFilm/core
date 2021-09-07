import { Story, Meta } from '@storybook/react'
import { RadioQuestionType } from '../../../types'
import { RadioQuestion } from './RadioQuestion'
import { journeysConfig } from '../../../libs/storybook/decorators'

const options = [
  {
    __typename: 'RadioOption',
    label: 'Chat Privately',
    id: 'Question1',
    parent: { id: 'MoreQuestions' }
  },
  {
    __typename: 'RadioOption',
    label: 'Get a bible',
    id: 'Question2',
    parent: { id: 'MoreQuestions' }
  },
  {
    __typename: 'RadioOption',
    label: 'Watch more videos about Jesus',
    id: 'Question3',
    parent: { id: 'MoreQuestions' }
  },
  {
    __typename: 'RadioOption',
    label: 'Ask a question',
    id: 'Question4',
    parent: { id: 'MoreQuestions' }
  }
]

const longLabel = [
  {
    __typename: 'RadioOption',
    label:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    id: 'Question1',
    parent: { id: 'MoreQuestions' }
  },
  {
    __typename: 'RadioOption',
    label:
      'when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting',
    id: 'Question2',
    parent: { id: 'MoreQuestions' }
  }
]

const Demo = {
  ...journeysConfig,
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion'
}

const DefaultTemplate: Story<RadioQuestionType> = ({ ...props }) => (
  <RadioQuestion {...props} />
)

export const DefaultQuestion = DefaultTemplate.bind({})
DefaultQuestion.args = {
  id: 'MoreQuestions',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children: options,
  parent: {
    id: 'Step1'
  }
}

export const LongOptions = DefaultTemplate.bind({})
LongOptions.args = {
  id: 'MoreQuestions',
  label: 'Have you accepted Jesus in your life?',
  description:
    'Have you declared that you want to accept Jesus in your life as your Lord and savior?',
  children: longLabel
}

export const DarkBackground = DefaultTemplate.bind({})
DarkBackground.args = {
  id: 'AnotherQuestion',
  label: 'Dark Background',
  description: 'Testing to see if the dark background is working',
  variant: 'dark',
  children: options,
  parent: {
    id: 'AStep'
  }
}

export default Demo as Meta
