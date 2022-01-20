import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { SignUp } from '.'

const SignUpStory = {
  ...journeysAdminConfig,
  component: SignUp,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/SignUp'
}

export const Default: Story = () => {
  return <SignUp />
}

export default SignUpStory as Meta
