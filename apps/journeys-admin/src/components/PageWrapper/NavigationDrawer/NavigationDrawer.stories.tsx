import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { AuthUser } from 'next-firebase-auth'
import { ReactElement, useState } from 'react'

import { Role, UserJourneyRole } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { GET_USER_ROLE } from '../../../libs/useUserRoleQuery/useUserRoleQuery'
import { GET_ME } from '../../NewPageWrapper/NavigationDrawer'

import { NavigationDrawer } from '.'

const NavigationDrawerStory: Meta<typeof NavigationDrawer> = {
  ...journeysAdminConfig,
  component: NavigationDrawer,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer'
}

const NavigationDrawerComponent = (args): ReactElement => {
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
            query: GET_ADMIN_JOURNEYS
          },
          result: args.result
        }
      ]}
    >
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
      />
    </MockedProvider>
  )
}

const Template: StoryObj<typeof NavigationDrawer> = {
  render: ({ ...args }) => <NavigationDrawerComponent {...args} />
}

export const Default = { ...Template }

export const WithBadge = {
  ...Template,
  args: {
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
}

export default NavigationDrawerStory
