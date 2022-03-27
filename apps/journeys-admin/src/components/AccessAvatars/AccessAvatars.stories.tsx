import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { AuthUser } from 'next-firebase-auth'
import { simpleComponentConfig } from '../../libs/storybook'
import { GET_JOURNEY_WITH_USER_JOURNEYS } from '../AccessDialog/AccessDialog'
import { AccessAvatarsProps } from './AccessAvatars'
import {
  userJourney1,
  userJourney2,
  userJourney3,
  userJourney4,
  userJourney5,
  userJourney6
} from './data'
import { AccessAvatars } from '.'

const AccessAvatarsDemo = {
  ...simpleComponentConfig,
  component: AccessAvatars,
  title: 'Journeys-Admin/AccessAvatars'
}

const authUser = {
  id: 'userId1',
  displayName: 'Amin One',
  imageUrl: 'https://bit.ly/3Gth4Yf',
  email: 'amin@email.com'
} as unknown as AuthUser

const Template: Story<AccessAvatarsProps> = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_JOURNEY_WITH_USER_JOURNEYS,
          variables: {
            id: 'journeySlug'
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
      }
    ]}
  >
    <AccessAvatars {...args} />
  </MockedProvider>
)

export const Default: Story<AccessAvatarsProps> = Template.bind({})
Default.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3],
  AuthUser: authUser
}

export const Medium: Story<AccessAvatarsProps> = Template.bind({})
Medium.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3],
  size: 'medium',
  AuthUser: authUser
}

export const Large: Story<AccessAvatarsProps> = Template.bind({})
Large.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3],
  size: 'large',
  AuthUser: authUser
}

export const Overflow: Story<AccessAvatarsProps> = Template.bind({})
Overflow.args = {
  journeySlug: 'journeySlug',
  userJourneys: [
    userJourney1,
    userJourney2,
    userJourney3,
    userJourney4,
    userJourney5,
    userJourney6
  ],
  AuthUser: authUser
}

export const NoImage: Story<AccessAvatarsProps> = Template.bind({})
NoImage.args = {
  journeySlug: 'journeySlug',
  userJourneys: [
    { ...userJourney1, user: { ...userJourney1.user, imageUrl: null } },
    { ...userJourney2, user: { ...userJourney2.user, imageUrl: null } },
    { ...userJourney3, user: { ...userJourney3.user, imageUrl: null } }
  ],
  AuthUser: authUser
}

export default AccessAvatarsDemo as Meta
