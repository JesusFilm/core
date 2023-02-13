import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { EmailInviteForm } from './EmailInviteForm'

const EmailInviteFormStory = {
  ...journeysAdminConfig,
  component: EmailInviteForm,
  title: 'Journeys-Admin/EmailInviteForm'
}

export const Default: Story = () => {
  return <EmailInviteForm />
}

export default EmailInviteFormStory as Meta
