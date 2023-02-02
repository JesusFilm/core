import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { EmailInviteForm } from './EmailInviteForm'

const EmailInviteInputStory = {
  ...journeysAdminConfig,
  component: EmailInviteForm,
  title: 'Journeys-Admin/EmailInviteInput'
}

export const Default: Story = () => {
  return <EmailInviteForm />
}

export default EmailInviteInputStory as Meta
