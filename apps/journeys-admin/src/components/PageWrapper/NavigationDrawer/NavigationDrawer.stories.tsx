import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { User } from 'next-firebase-auth'
import { ComponentProps, ReactElement, useState } from 'react'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import { GetMe } from '../../../../__generated__/GetMe'
import { GetUserRole } from '../../../../__generated__/GetUserRole'
import {
  JourneyStatus,
  Role,
  UserJourneyRole
} from '../../../../__generated__/globalTypes'
import { cache } from '../../../libs/apolloClient/cache'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'

import { GET_ME } from './UserNavigation'

import { NavigationDrawer } from '.'

const NavigationDrawerStory: Meta<typeof NavigationDrawer> = {
  ...journeysAdminConfig,
  component: NavigationDrawer,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer',
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const user = {
  id: 'userId',
  displayName: 'Amin One',
  photoURL: 'https://bit.ly/3Gth4Yf',
  email: 'amin@email.com'
} as unknown as User

const getMeMock: MockedResponse<GetMe> = {
  request: {
    query: GET_ME,
    variables: { input: { redirect: undefined } }
  },
  result: {
    data: {
      me: {
        id: 'userId',
        firstName: 'Amin',
        lastName: 'One',
        imageUrl: 'https://bit.ly/3Gth4Yf',
        email: 'amin@email.com',
        superAdmin: true,
        emailVerified: true,
        __typename: 'User'
      }
    }
  }
}

const getUserRoleMock: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        id: 'userId',
        roles: [Role.publisher],
        __typename: 'UserRole'
      }
    }
  }
}

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          id: 'journeyId',
          title: 'Journey Title',
          status: JourneyStatus.draft,
          __typename: 'Journey',
          userJourneys: [
            {
              id: 'userJourneyId',
              role: UserJourneyRole.owner,
              user: {
                id: 'userId',
                openedAt: null
              }
            }
          ]
        } as unknown as Journey
      ]
    }
  }
}

function NavigationDrawerComponent(
  props: ComponentProps<typeof NavigationDrawer>
): ReactElement {
  const [open, setOpen] = useState(true)
  return <NavigationDrawer open={open} onClose={setOpen} {...props} />
}

const Template: StoryObj<typeof NavigationDrawer> = {
  render: ({ ...args }) => <NavigationDrawerComponent {...args} />
}

export const Default = { ...Template, args: { selectedPage: '' } }

export const WithBadge = {
  ...Template,
  args: { selectedPage: '', user },
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getMeMock, getUserRoleMock, getAdminJourneysMock]
    }
  }
}

export default NavigationDrawerStory
