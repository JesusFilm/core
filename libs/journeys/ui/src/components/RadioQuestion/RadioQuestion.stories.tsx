import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import {
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard,
  TreeBlock
} from '../..'
import { RadioQuestion } from './RadioQuestion'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'
import { RadioOptionFields } from './RadioOption/__generated__/RadioOptionFields'
import { RADIO_QUESTION_RESPONSE_CREATE } from '.'

const children: Array<TreeBlock<RadioOptionFields>> = [
  {
    __typename: 'RadioOptionBlock',
    label: 'Chat Privately',
    id: 'RadioOption1',
    parentBlockId: 'MoreQuestions',
    parentOrder: 0,
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Get a bible',
    id: 'RadioOption2',
    parentBlockId: 'MoreQuestions',
    parentOrder: 1,
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Watch more videos about Jesus',
    id: 'RadioOption3',
    parentBlockId: 'MoreQuestions',
    parentOrder: 2,
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label: 'Ask a question',
    id: 'RadioOption4',
    parentBlockId: 'MoreQuestions',
    parentOrder: 3,
    action: null,
    children: []
  }
]

const longLabel: Array<TreeBlock<RadioOptionFields>> = [
  {
    __typename: 'RadioOptionBlock',
    label:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    id: 'RadioOption1',
    parentBlockId: 'MoreQuestions',
    parentOrder: 0,
    action: null,
    children: []
  },
  {
    __typename: 'RadioOptionBlock',
    label:
      'when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting',
    id: 'RadioOption2',
    parentBlockId: 'MoreQuestions',
    parentOrder: 1,
    action: null,
    children: []
  }
]

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: RadioQuestion,
  title: 'Journeys-Ui/RadioQuestion'
}

const DefaultTemplate: Story<TreeBlock<RadioQuestionFields>> = ({
  ...props
}) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: RADIO_QUESTION_RESPONSE_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'RadioQuestion1',
              radioOptionBlockId: 'RadioOption1'
            }
          }
        },
        result: {
          data: {
            radioQuestionResponseCreate: {
              id: 'uuid',
              radioOptionBlockId: 'RadioOption1'
            }
          }
        }
      }
    ]}
  >
    <StoryCard>
      <RadioQuestion {...props} uuid={() => 'uuid'} />
      <Typography>Next block goes here</Typography>
    </StoryCard>
  </MockedProvider>
)

export const Default: Story<TreeBlock<RadioQuestionFields>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'RadioQuestion1',
  label: 'How can we help you know more about Jesus?',
  children,
  parentBlockId: 'Step1'
}

export const Long: Story<TreeBlock<RadioQuestionFields>> = DefaultTemplate.bind(
  {}
)
Long.args = {
  id: 'RadioQuestion1',
  label: 'Have you accepted Jesus in your life?',
  description:
    'Have you declared that you want to accept Jesus in your life as your Lord and savior?',
  children: longLabel
}

export default Demo as Meta
