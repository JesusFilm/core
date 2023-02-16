import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { AuthUser } from 'next-firebase-auth'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { NextRouter } from 'next/router'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Role, UserJourneyRole } from '../../../../__generated__/globalTypes'
import { GET_USER_ROLE } from '../../JourneyView/JourneyView'
import { GET_JOURNEYS } from '../../../libs/useJourneys/useJourneys'
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
                id: 'user.id',
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
        },
        {
          request: {
            query: GET_JOURNEYS
          },
          result: args.result
        }
      ]}
    >
      <FlagsProvider flags={{ templates: args.templates }}>
        <NavigationDrawer
          open={open}
          onClose={() => setOpen(!open)}
          authUser={
            {
              id: 'user.id',
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

export const WithBadge = Template.bind({})
WithBadge.args = {
  templates: false,
  title: 'Active Journeys',
  result: {
    data: {
      journeys: [
        {
          id: 'journey.id',
          userJourneys: [
            {
              id: 'journey.userJourney1.id',
              role: UserJourneyRole.editor,
              user: {
                id: 'user.id'
              }
            }
          ]
        }
      ]
    }
  }
}

export default NavigationDrawerStory as Meta
