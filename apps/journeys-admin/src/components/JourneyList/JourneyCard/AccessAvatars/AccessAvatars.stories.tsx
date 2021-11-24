import { journeysAdminConfig } from '../../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5 } from './AccessAvatarsData'

const AccessAvatarsDemo = {
  ...journeysAdminConfig,
  component: AccessAvatars,
  title: 'Journeys-Admin/JourneyList/JourneyCard/AccessAvatar'
}

const Template: Story = ({ ...args }) => <AccessAvatars users={[]} {...args} />

export const Single: Story<AccessAvatarsProps> = Template.bind({})
Single.args = {
  users: [user1]
}

export const Multiple: Story<AccessAvatarsProps> = Template.bind({})
Multiple.args = {
  users: [user1, user2, user3]
}

export const Fallback: Story<AccessAvatarsProps> = Template.bind({})
Fallback.args = {
  users: [
    { ...user1, image: undefined },
    { ...user2, image: undefined },
    { ...user2, image: undefined }
  ]
}

export const ExtraAvatars: Story<AccessAvatarsProps> = Template.bind({})
ExtraAvatars.args = {
  users: [user1, user2, user3, user4, user5]
}

export default AccessAvatarsDemo as Meta
