import { journeyAdminConfig } from '../../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AccessAvatarsProps } from './AccessAvatars'
import {
  singleAvatar,
  multipleAvatars,
  fallBackAvatars,
  moreThanMaxAvatars
} from './AccessAvatarsData'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'Journey-Admin/JourneyList/AccessAvatar'
}

const Template: Story = ({ ...args }) => (
  <>
    <AccessAvatars users={args.users} />
  </>
)

export const Single: Story<AccessAvatarsProps> = Template.bind({})
Single.args = singleAvatar

export const Multiple: Story<AccessAvatarsProps> = Template.bind({})
Multiple.args = multipleAvatars

export const FallBack: Story<AccessAvatarsProps> = Template.bind({})
FallBack.args = fallBackAvatars

export const ExtraAvatars: Story<AccessAvatarsProps> = Template.bind({})
ExtraAvatars.args = moreThanMaxAvatars

export default AccessAvatarsDemo as Meta
