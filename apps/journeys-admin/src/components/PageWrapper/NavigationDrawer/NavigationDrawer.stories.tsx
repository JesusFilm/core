import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { AuthUser } from 'next-firebase-auth'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Role } from '../../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../../../pages/templates/admin'
import { GET_ME } from './NavigationDrawer'
import { NavigationDrawer } from '.'

const NavigationDrawerStory = {
  ...journeysAdminConfig,
  component: NavigationDrawer,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer'
}

const Template: Story = ({ ...args }) => {
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
        },
        {
          request: {
            query: GET_USER_ROLE
          },
          result: {
            data: {
              getUserRole: {
                id: 'userId',
                roles: [Role.publisher]
              }
            }
          }
        }
      ]}
    >
      <FlagsProvider flags={{ reports: args.reports }}>
        <NavigationDrawer
          open={open}
          onClose={() => setOpen(!open)}
          authUser={
            {
              displayName: 'Amin One',
              photoURL: 'https://bit.ly/3Gth4Yf',
              email: 'amin@email.com',
              signOut: noop
            } as unknown as AuthUser
          }
          title={args.title}
        />
      </FlagsProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  reports: true,
  title: 'Active Journeys'
}

export const Reports = Template.bind({})
Reports.args = {
  reports: true,
  title: 'Reports'
}

export const ReportsOff = Template.bind({})
ReportsOff.args = {
  reports: false,
  title: 'Journeys'
}

export default NavigationDrawerStory as Meta
