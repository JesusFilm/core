import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'

import {
  GetAdminJourneys_journeys_userJourneys_user as User,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../libs/storybook'
import { GET_CURRENT_USER } from '../../libs/useCurrentUser'
import { GET_JOURNEY_WITH_USER_JOURNEYS } from '../AccessDialog/AccessDialog'

import { AccessAvatarsProps } from './AccessAvatars'
import {
  userJourney1,
  userJourney2,
  userJourney3,
  userJourney4,
  userJourney5,
  userJourney6,
  userJourney7
} from './data'

import { AccessAvatars } from '.'

const AccessAvatarsDemo = {
  ...simpleComponentConfig,
  component: AccessAvatars,
  title: 'Journeys-Admin/AccessAvatars'
}

const defaultUserJourneys = [userJourney1, userJourney2, userJourney3]
const noImageUserJourneys: UserJourney[] = [
  {
    ...userJourney1,
    user: {
      __typename: 'User',
      id: '1',
      firstName: 'Amin',
      lastName: 'One',
      imageUrl: null
    }
  },
  {
    ...userJourney2,
    user: {
      __typename: 'User',
      id: '2',
      firstName: 'Horace',
      lastName: 'Two',
      imageUrl: null
    }
  },
  {
    ...userJourney3,
    user: {
      __typename: 'User',
      id: '3',
      firstName: 'Coral',
      lastName: 'Three',
      imageUrl: null
    }
  }
]
const notificationJourneys = [
  { ...userJourney1, role: UserJourneyRole.inviteRequested },
  userJourney2,
  { ...userJourney3, role: UserJourneyRole.inviteRequested },
  {
    ...userJourney4,
    role: UserJourneyRole.inviteRequested,
    user: { ...userJourney4.user, imageUrl: null } as unknown as User
  },
  userJourney5,
  { ...userJourney6, role: UserJourneyRole.inviteRequested }
]

const overflowUserJourneys = [
  ...defaultUserJourneys,
  userJourney4,
  userJourney5,
  userJourney6
]
const overflowNotificationUserJourneys = [...overflowUserJourneys, userJourney7]
const loadingUserJourneys = undefined

const mocks = [
  {
    request: {
      query: GET_JOURNEY_WITH_USER_JOURNEYS,
      variables: {
        id: 'journeyId'
      }
    },
    result: {
      data: {
        journey: {
          id: 'journeyId',
          userJourneys: [
            {
              id: 'userJourneyId1',
              role: 'owner',
              user: {
                __typename: 'User',
                id: 'userId1',
                firstName: 'Amin',
                lastName: 'One',
                imageUrl: 'https://bit.ly/3Gth4Yf',
                email: 'amin@email.com'
              }
            },
            {
              id: 'userJourneyId2',
              role: 'editor',
              user: {
                __typename: 'User',
                id: 'userId2',
                firstName: 'Horace',
                lastName: 'Two',
                imageUrl: 'https://bit.ly/3rgHd6a',
                email: 'horace@email.com'
              }
            },
            {
              id: 'userJourneyId3',
              role: 'inviteRequested',
              user: {
                __typename: 'User',
                id: 'userId3',
                firstName: 'Coral',
                lastName: 'Three',
                imageUrl: 'https://bit.ly/3nlwUwJ',
                email: 'coral@email.com'
              }
            }
          ]
        }
      }
    }
  },
  {
    request: {
      query: GET_CURRENT_USER
    },
    result: {
      data: {
        me: {
          id: 'userId1',
          __typename: 'User',
          email: 'amin@email.com'
        }
      }
    }
  }
]

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={mocks}>
    <Stack spacing={4}>
      <Typography>Default</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={defaultUserJourneys}
        size={args.size}
      />

      <Typography>No Image</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={noImageUserJourneys}
        size={args.size}
      />

      <Typography>ManageButton</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={defaultUserJourneys}
        size={args.size}
        showManageButton
      />

      <Typography>Overflow</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={overflowUserJourneys}
        size={args.size}
      />

      <Typography>ManageButtonOverflow</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={overflowUserJourneys}
        size={args.size}
        showManageButton
      />

      <Typography>Notification</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={notificationJourneys}
        size={args.size}
      />

      <Typography>Overflow Notification</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={overflowNotificationUserJourneys}
        size={args.size}
      />

      <Typography>Loading</Typography>
      <AccessAvatars
        journeyId="journeyId"
        userJourneys={loadingUserJourneys}
        size={args.size}
      />
    </Stack>
  </MockedProvider>
)

export const Default: Story<AccessAvatarsProps> = Template.bind({})

export const Medium: Story<AccessAvatarsProps> = Template.bind({})
Medium.args = {
  size: 'medium'
}

export const Large: Story<AccessAvatarsProps> = Template.bind({})
Large.args = {
  size: 'large'
}
export default AccessAvatarsDemo as Meta
