import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../libs/storybook'
import { EmailInviteInput } from './EmailInviteInput'

const EmailInviteInputStory = {
  ...journeysAdminConfig,
  component: EmailInviteInput,
  title: 'Journeys-Admin/EmailInviteInput'
}

export const Default: Story = () => {
  const [openEmailInviteInput, setOpenEmailInviteInput] = useState(true)
  return (
    <EmailInviteInput
      open={openEmailInviteInput}
      onClose={() => setOpenEmailInviteInput(false)}
    />
  )
}

export default EmailInviteInputStory as Meta
