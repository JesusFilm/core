import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { AuthUser } from 'next-firebase-auth'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { NextRouter } from 'next/router'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Role } from '../../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../JourneyView/JourneyView'
import { GET_ME } from './NavigationDrawer'
import { NavigationDrawer } from '.'

// jest.mock('react-i18next', () => ({
//   __esModule: true,
//   useTranslation: () => {
//     return {
//       t: (str: string) => str
//     }
//   }
// }))

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
      <FlagsProvider flags={{ templates: args.templates }}>
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
          router={{ pathname: undefined } as unknown as NextRouter}
        />
      </FlagsProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  templates: false,
  title: 'Active Journeys'
}

export const Complete = Template.bind({})
Complete.args = {
  templates: true,
  title: 'Journeys'
}

export default NavigationDrawerStory as Meta
