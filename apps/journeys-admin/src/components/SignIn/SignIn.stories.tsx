import { Story, Meta } from '@storybook/react'
import { SignIn, USER_CREATE } from './SignIn'
import { journeysAdminConfig } from '../../libs/storybook'
import { MockedProvider } from '@apollo/client/testing'

// Do we have to write a storybook test for this?

const Demo: Meta = {
  ...journeysAdminConfig,
  component: SignIn,
  title: 'Journeys-Admin/UserAuthentication/SignIn'
}

const Template: Story = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: USER_CREATE,
          variables: {
            id: 'uid',
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'email',
            imageUrl: 'imageUrl'
          }
        },
        result: {
          data: {
            id: 'uid',
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'email',
            imageUrl: 'imageUrl'
          }
        }
      }
    ]}
  >
    <SignIn />
  </MockedProvider>
)

export const Default: Story = Template.bind({})

export default Demo
