import { Story, Meta } from '@storybook/react'
import { SignIn } from './SignIn'
import { journeysAdminConfig } from '../../../libs/storybook'

// Do we have to write a storybook test for this?
// Wrote a simple storybook test

const Demo: Meta = {
  ...journeysAdminConfig,
  component: SignIn,
  title: 'Journeys-Admin/UserAuthentication/SignIn'
}

const Template: Story = () => <SignIn />

export const Default: Story = Template.bind({})

export default Demo
