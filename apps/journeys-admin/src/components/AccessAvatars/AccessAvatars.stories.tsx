import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { GET_JOURNEY_WITH_USER_JOURNEYS } from '../AccessDialog/AccessDialog'
import { AccessAvatarsProps } from './AccessAvatars'
import { user1, user2, user3, user4, user5, user6 } from './data'
import { AccessAvatars } from '.'

const AccessAvatarsDemo = {
  ...journeysAdminConfig,
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
      }
    ]}
  >
    <AccessAvatars {...args} />
  </MockedProvider>
)

export const Default: Story<AccessAvatarsProps> = Template.bind({})
Default.args = {
  journeySlug: 'journeySlug',
  users: [user1, user2, user3]
}

export const Overflow: Story<AccessAvatarsProps> = Template.bind({})
Overflow.args = {
  journeySlug: 'journeySlug',
  users: [user1, user2, user3, user4, user5, user6]
}

export const NoImage: Story<AccessAvatarsProps> = Template.bind({})
NoImage.args = {
  journeySlug: 'journeySlug',
  users: [
    { ...user1, imageUrl: null },
    { ...user2, imageUrl: null },
    { ...user3, imageUrl: null }
  ]
}

export default AccessAvatarsDemo as Meta
