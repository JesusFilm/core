import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig, StoryCard, TreeBlock } from '../..'
import { TypographyVariant } from '../../../__generated__/globalTypes'
import { Typography } from '../Typography'
import { RadioQuestion } from './RadioQuestion'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'
import { RadioOptionFields } from './RadioOption/__generated__/RadioOptionFields'
import { RADIO_QUESTION_RESPONSE_CREATE } from '.'

const typographyProps: TreeBlock = {
  __typename: 'TypographyBlock',
  id: 'id',
  parentOrder: 0,
  parentBlockId: 'card',
  align: null,
  color: null,
  variant: TypographyVariant.h3,
  content: 'How can we help you know more about Jesus?',
  children: []
}

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
      <Typography {...typographyProps} />
      {props.id === 'Long' && (
        <Typography
          {...typographyProps}
          content="Have you declared that you want to accept Jesus in your life as your Lord and savior?"
          variant={TypographyVariant.body2}
          parentOrder={1}
        />
      )}
      <RadioQuestion {...props} uuid={() => 'uuid'} />
      <Typography
        {...typographyProps}
        content="Next block goes here"
        variant={TypographyVariant.body1}
        parentOrder={props.id === 'Long' ? 3 : 2}
      />
    </StoryCard>
  </MockedProvider>
)

export const Default: Story<TreeBlock<RadioQuestionFields>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'Default',
  label: 'How can we help you know more about Jesus?',
  children,
  parentOrder: 1,
  parentBlockId: 'Step1'
}

export const Long: Story<TreeBlock<RadioQuestionFields>> = DefaultTemplate.bind(
  {}
)
Long.args = {
  id: 'Long',
  label: 'Have you accepted Jesus in your life?',
  description: '',
  children: longLabel,
  parentOrder: 2
}

export default Demo as Meta
