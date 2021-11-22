import { Story, Meta } from '@storybook/react'
import { Register } from './Register'
import { journeyAdminConfig } from '../../../libs/storybook'
import { AuthProvider } from '../../../../src/libs/firebaseClient'

// Do we have to write a storybook test for this?
// Wrote a simple storybook test

const Demo: Meta = {
  ...journeyAdminConfig,
  component: Register,
  title: 'JourneyAdmin/UserAuthentication/Register'
}

const Template: Story = () => (
  <AuthProvider>
    <Register />
  </AuthProvider>
)

export const Default: Story = Template.bind({})

export default Demo
