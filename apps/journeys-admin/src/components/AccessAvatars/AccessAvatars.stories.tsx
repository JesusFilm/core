import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../libs/storybook'
import {
  GET_CURRENT_USER,
  GET_JOURNEY_WITH_USER_JOURNEYS
} from '../AccessDialog/AccessDialog'
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
    ]}
  >
    <AccessAvatars {...args} />
  </MockedProvider>
)

export const Default: Story<AccessAvatarsProps> = Template.bind({})
Default.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3]
}

export const Medium: Story<AccessAvatarsProps> = Template.bind({})
Medium.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3],
  size: 'medium'
}

export const Large: Story<AccessAvatarsProps> = Template.bind({})
Large.args = {
  journeySlug: 'journeySlug',
  userJourneys: [userJourney1, userJourney2, userJourney3],
  size: 'large'
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
  ]
}

export const NoImage: Story<AccessAvatarsProps> = Template.bind({})
NoImage.args = {
  journeySlug: 'journeySlug',
  userJourneys: [
    { ...userJourney1, user: { ...userJourney1.user, imageUrl: null } },
    { ...userJourney2, user: { ...userJourney2.user, imageUrl: null } },
    { ...userJourney3, user: { ...userJourney3.user, imageUrl: null } }
  ]
}

export const Loading: Story<AccessAvatarsProps> = Template.bind({})
Loading.args = {
  journeySlug: undefined,
  userJourneys: undefined
}

export default AccessAvatarsDemo as Meta
