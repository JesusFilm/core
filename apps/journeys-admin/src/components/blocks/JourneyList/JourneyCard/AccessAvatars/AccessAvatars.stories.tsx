import { journeyAdminConfig } from '../../../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './AccessAvatarsData'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'Journey-Admin/JourneyList/JourneyCard/AccessAvatar'
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
    { ...user3, image: undefined }
  ]
}

export const ExtraAvatars: Story<AccessAvatarsProps> = Template.bind({})
ExtraAvatars.args = {
  users: [user1, user2, user3, user4, user5]
}

// display user without first name. should display their email in the tooltip
export const NoFirstName: Story<AccessAvatarsProps> = Template.bind({})
NoFirstName.args = {
  users: [
    {...user6, firstName: undefined}
  ]
}

// display user without first name or image, should display email in the tooltip
// and first letter of email as the fallback image
export const NoNameOrImage: Story<AccessAvatarsProps> = Template.bind({})
NoNameOrImage.args = {
  users: [
    { ...user6, firstName: undefined, image: undefined}
  ]
}

// display user without first name/email/image, should display blank silhouette with
// "No name or email available for this user" as tooltip
export const NoNameEmailOrImage: Story<AccessAvatarsProps> = Template.bind({})
NoNameEmailOrImage.args = {
  users: [
    { ...user6, firstName: undefined, email: undefined , image: undefined}
  ]
}


export default AccessAvatarsDemo as Meta
