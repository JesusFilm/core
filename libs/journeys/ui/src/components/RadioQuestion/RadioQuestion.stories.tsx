import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import type { TreeBlock } from '../../libs/block'
import { StoryCard } from '../StoryCard'
import { TypographyVariant } from '../../../__generated__/globalTypes'
import Typography from '../Typography'
import { RadioOptionFields } from '../RadioOption/__generated__/RadioOptionFields'
import RadioQuestion, { RADIO_QUESTION_SUBMISSION_EVENT_CREATE } from '.'

const Demo = {
  ...simpleComponentConfig,
  component: RadioQuestion,
  title: 'Journeys-Ui/RadioQuestion'
}

const typographyProps: ComponentProps<typeof Typography> = {
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

const submitEventMock: MockedResponse = {
  request: {
    query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
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
      radioQuestionSubmissionEventCreate: {
        id: 'uuid'
      }
    }
  }
}

const Template: Story<ComponentProps<typeof RadioQuestion>> = ({ ...args }) => (
  <MockedProvider mocks={[submitEventMock]}>
    <StoryCard>
      <Typography {...typographyProps} />
      <RadioQuestion {...args} uuid={() => 'uuid'} />
      <Typography
        {...typographyProps}
        content="RadioQuestion is just the button group above"
        variant={TypographyVariant.body1}
        parentOrder={2}
      />
    </StoryCard>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  id: 'Default',
  children,
  parentOrder: 1,
  parentBlockId: 'Step1'
}

export const RTL = Template.bind({})
RTL.args = { ...Default.args }
RTL.parameters = { rtl: true }

export default Demo as Meta
