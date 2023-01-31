import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { EmailInviteInput } from './EmailInviteInput'

const EmailInviteInputStory = {
  ...journeysAdminConfig,
  component: EmailInviteInput,
  title: 'Journeys-Admin/EmailInviteInput'
}

export const Default: Story = () => {
  return <EmailInviteInput />
}

export default EmailInviteInputStory as Meta
