import { journeysAdminConfig } from '../../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'

const AccessAvatarsDemo = {
  ...journeysAdminConfig,
  component: AccessAvatars,
  title: 'Journeys-Admin/JourneyList/JourneyCard/AccessAvatar'
}

const Template: Story<AccessAvatarsProps> = ({ ...args }) => (
  <AccessAvatars {...args} />
)

export const Single: Story<AccessAvatarsProps> = Template.bind({})
Single.args = {
  users: [user1]
}

export const MaxDesktop: Story<AccessAvatarsProps> = Template.bind({})
MaxDesktop.args = {
  users: [user1, user2, user3, user4, user5]
}
export const MaxMobile: Story<AccessAvatarsProps> = Template.bind({})
MaxMobile.args = {
  users: [user1, user2, user3]
}

export const OverFlowAvatars: Story<AccessAvatarsProps> = Template.bind({})
OverFlowAvatars.args = {
  users: [user1, user2, user3, user4, user5, user6]
}

export const NoImage: Story<AccessAvatarsProps> = Template.bind({})
NoImage.args = {
  users: [
    { ...user1, imageUrl: null },
    { ...user2, imageUrl: null },
    { ...user3, imageUrl: null }
  ]
}

export default AccessAvatarsDemo as Meta
