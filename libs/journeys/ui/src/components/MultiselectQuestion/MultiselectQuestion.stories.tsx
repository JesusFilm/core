import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TypographyVariant } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { MultiselectOptionFields } from '../MultiselectOption/__generated__/MultiselectOptionFields'
import { StoryCard } from '../StoryCard'
import { Typography } from '../Typography'

import { MULTISELECT_SUBMISSION_EVENT_CREATE, MultiselectQuestion } from '.'

const Demo: Meta<typeof MultiselectQuestion> = {
  ...simpleComponentConfig,
  component: MultiselectQuestion,
  title: 'Journeys-Ui/MultiselectQuestion',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
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
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const children: Array<TreeBlock<MultiselectOptionFields>> = [
  {
    __typename: 'MultiselectOptionBlock',
    label: 'Chat Privately',
    id: 'Option1',
    parentBlockId: 'Multiselect1',
    parentOrder: 0,
    children: []
  },
  {
    __typename: 'MultiselectOptionBlock',
    label: 'Get a bible',
    id: 'Option2',
    parentBlockId: 'Multiselect1',
    parentOrder: 1,
    children: []
  },
  {
    __typename: 'MultiselectOptionBlock',
    label: 'Watch more videos about Jesus',
    id: 'Option3',
    parentBlockId: 'Multiselect1',
    parentOrder: 2,
    children: []
  },
  {
    __typename: 'MultiselectOptionBlock',
    label: 'Ask a question',
    id: 'Option4',
    parentBlockId: 'Multiselect1',
    parentOrder: 3,
    children: []
  }
]

const submitEventMock: MockedResponse = {
  request: {
    query: MULTISELECT_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'Multiselect1',
        values: ['Chat Privately']
      }
    }
  },
  result: {
    data: {
      multiselectSubmissionEventCreate: {
        id: 'uuid'
      }
    }
  }
}

type Story = StoryObj<typeof MultiselectQuestion>

const Template: Story = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[submitEventMock]}>
      <StoryCard>
        <Typography {...typographyProps} />
        <MultiselectQuestion
          {...args}
          uuid={() => 'uuid'}
          submitLabel="Submit"
        />
        <Typography
          {...typographyProps}
          content="MultiselectQuestion is just the button group above"
          variant={TypographyVariant.body1}
          parentOrder={2}
        />
      </StoryCard>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'Default',
    children,
    parentOrder: 1,
    parentBlockId: 'Step1',
    min: 1,
    max: 2,
    submitLabel: 'Submit'
  }
}

export const RTL = {
  args: { ...Default.args },
  parameters: { rtl: true }
}

export default Demo
