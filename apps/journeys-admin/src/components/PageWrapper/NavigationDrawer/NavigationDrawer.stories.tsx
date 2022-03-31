import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { AuthUser } from 'next-firebase-auth'
import { simpleComponentConfig } from '../../../libs/storybook'
import { GET_ME, NavigationDrawerProps } from './NavigationDrawer'
import { NavigationDrawer } from '.'

const NavigationDrawerStory = {
  ...simpleComponentConfig,
  component: NavigationDrawer,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer'
}

const Template: Story<NavigationDrawerProps> = () => {
  const [open, setOpen] = useState(true)

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_ME
          },
          result: {
            data: {
              me: {
                id: 'userId',
                firstName: 'Amin',
                lastName: 'One',
                imageUrl: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com'
              }
            }
          }
        }
      ]}
    >
      <NavigationDrawer
        open={open}
        onClose={() => setOpen(!open)}
        AuthUser={
          {
            displayName: 'Amin One',
            photoURL: 'https://bit.ly/3Gth4Yf',
            email: 'amin@email.com',
            signOut: noop
          } as unknown as AuthUser
        }
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default NavigationDrawerStory as Meta
