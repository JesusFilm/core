import { journeysAdminConfig } from '../../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './AccessAvatarsData'

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

export const MaxAvatars: Story<AccessAvatarsProps> = Template.bind({})
MaxAvatars.args = {
  users: [user1, user2, user3]
}

export const OverFlowAvatars: Story<AccessAvatarsProps> = Template.bind({})
OverFlowAvatars.args = {
  users: [user1, user2, user3, user4, user5]
}

export const NoImage: Story<AccessAvatarsProps> = Template.bind({})
NoImage.args = {
  users: [
    { ...user1, image: undefined },
    { ...user2, image: undefined },
    { ...user3, image: undefined }
  ]
}

// display user without first name. should display their email in the tooltip
export const NoFirstname: Story<AccessAvatarsProps> = Template.bind({})
NoFirstname.args = {
  users: [
    { ...user1, firstName: undefined },
    { ...user2, firstName: undefined },
    { ...user3, firstName: undefined },
    { ...user6, firstName: undefined }
  ]
}

// display user without first name or image, should display email in the tooltip
// and first letter of email as the fallback image
export const NoEmailFirstname: Story<AccessAvatarsProps> = Template.bind({})
NoEmailFirstname.args = {
  users: [
    { ...user1, firstName: undefined, image: undefined },
    { ...user2, firstName: undefined, image: undefined },
    { ...user3, firstName: undefined, image: undefined },
    { ...user6, firstName: undefined, image: undefined }
  ]
}

// display user without first name/email/image, should display generic avatar icon with
// "No name or email available for this user" as tooltip
export const NoDetails: Story<AccessAvatarsProps> = Template.bind({})
NoDetails.args = {
  users: [
    { ...user1, firstName: undefined, email: undefined, image: undefined },
    { ...user2, firstName: undefined, email: undefined, image: undefined },
    { ...user3, firstName: undefined, email: undefined, image: undefined },
    { ...user6, firstName: undefined, email: undefined, image: undefined }
  ]
}

export default AccessAvatarsDemo as Meta
