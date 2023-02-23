import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { InviteRequirementMessage } from '.'

const InviteRequirementMessageStory = {
  ...journeysAdminConfig,
  component: InviteRequirementMessage,
  title: 'Journeys-Admin/JourneyList/InivteRequestedMessage'
}

const Template: Story = () => <InviteRequirementMessage />

export const Default = Template.bind({})

export default InviteRequirementMessageStory as Meta
