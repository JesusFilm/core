import { Story, Meta } from '@storybook/react'
import { SignIn } from './SignIn'
import { journeyAdminConfig } from '../../../libs/storybook'
import { AuthProvider } from '../../../../src/libs/firebaseClient'

// Do we have to write a storybook test for this?
// Wrote a simple storybook test

const Demo: Meta = {
  ...journeyAdminConfig,
  component: SignIn,
  title: 'JourneyAdmin/UserAuthentication/SignIn'
}

const Template: Story = () => (
  <AuthProvider>
    <SignIn />
  </AuthProvider>
)

export const Default: Story = Template.bind({})

export default Demo
