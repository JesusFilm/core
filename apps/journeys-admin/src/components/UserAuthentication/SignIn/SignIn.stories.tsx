import { Story, Meta } from '@storybook/react'
import { SignIn } from './SignIn'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ApolloProvider } from '@apollo/client'
import client from '../../../../src/libs/client'

// Do we have to write a storybook test for this?
// Wrote a simple storybook test

const Demo: Meta = {
  ...journeysAdminConfig,
  component: SignIn,
  title: 'Journeys-Admin/UserAuthentication/SignIn'
}

const Template: Story = () => (
  <ApolloProvider client={client}>
    <SignIn />
  </ApolloProvider>
)

export const Default: Story = Template.bind({})

export default Demo
