import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { PublisherInvite } from './PublisherInvite'

const PublisherInviteStory = {
  ...journeysAdminConfig,
  component: PublisherInvite,
  title: 'Journeys-Admin/PublisherInvite'
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <PublisherInvite {...args} />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  journeyId: 'journeyId'
}

export default PublisherInviteStory as Meta
