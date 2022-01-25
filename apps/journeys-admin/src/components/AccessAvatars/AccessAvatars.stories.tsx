import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'
import { AccessAvatars } from '.'

const AccessAvatarsDemo = {
  ...journeysAdminConfig,
  component: AccessAvatars,
  title: 'Journeys-Admin/AccessAvatars'
}

const Template: Story<AccessAvatarsProps> = ({ ...args }) => (
  <AccessAvatars {...args} />
)

export const Default: Story<AccessAvatarsProps> = Template.bind({})
Default.args = {
  users: [user1, user2, user3]
}

export const Overflow: Story<AccessAvatarsProps> = Template.bind({})
Overflow.args = {
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
