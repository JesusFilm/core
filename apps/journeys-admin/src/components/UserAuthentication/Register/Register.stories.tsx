import { Story, Meta } from '@storybook/react'
import { Register } from './Register'
import { journeysAdminConfig } from '../../../libs/storybook'

// Do we have to write a storybook test for this?
// Wrote a simple storybook test

const Demo: Meta = {
  ...journeysAdminConfig,
  component: Register,
  title: 'Journeys-Admin/UserAuthentication/Register'
}

const Template: Story = () => <Register />

export const Default: Story = Template.bind({})

export default Demo
