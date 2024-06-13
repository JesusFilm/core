import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { PublisherInvite } from './PublisherInvite'

const PublisherInviteStory: Meta<typeof PublisherInvite> = {
  ...journeysAdminConfig,
  component: PublisherInvite,
  title: 'Journeys-Admin/PublisherInvite'
}

const Template: StoryObj<typeof PublisherInvite> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <PublisherInvite {...args} />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journeyId: 'journeyId'
  }
}

export default PublisherInviteStory
