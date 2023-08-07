import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { VisitorStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'

import { VisitorCard } from '.'

const VisitorCardStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/JourneyVisitorsList/VisitorCard'
}

const Template: Story<ComponentProps<typeof VisitorCard>> = ({ ...args }) => (
  <VisitorCard {...args} />
)

export const Default = Template.bind({})
Default.args = {
  visitorNode: {
    __typename: 'JourneyVisitor',
    visitorId: 'visitor.id-012345678901',
    createdAt: '2021-11-19T12:34:56.647Z',
    duration: 5,
    visitor: {
      __typename: 'Visitor',
      name: null,
      countryCode: null,
      status: null,
      referrer: null
    },
    events: []
  },
  loading: false
}

export const Complete = Template.bind({})
Complete.args = {
  visitorNode: {
    __typename: 'JourneyVisitor',
    visitorId: 'visitor.id',
    createdAt: '2021-11-19T12:34:56.647Z',
    duration: 75,
    visitor: {
      __typename: 'Visitor',
      name: 'John Doe',
      countryCode: 'Town, City',
      status: VisitorStatus.star,
      referrer: 'referrer.com'
    },
    events: [
      {
        __typename: 'ChatOpenEvent',
        id: 'chat.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        label: 'chat label',
        value: 'chat value'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'radio.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        label: 'radio label',
        value: 'radio value'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'text.id',
        createdAt: '2021-11-19T12:35:56.647Z',
        label: 'text label',
        value: 'text value'
      }
    ]
  },
  loading: false
}

export const Loading = Template.bind({})
Loading.args = {
  ...Default.args,
  loading: true
}

export default VisitorCardStory as Meta
