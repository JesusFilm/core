import { Story, Meta } from '@storybook/react'
import { InviteUserModal } from './InviteUserModal'
import { journeysAdminConfig } from '../../libs/storybook'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_usersJourneys as UserJourney,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import {
  UserJourneyRole,
  JourneyStatus
} from '../../../__generated__/globalTypes'

const Demo = {
  ...journeysAdminConfig,
  component: InviteUserModal,
  title: 'Journeys-Admin/InviteUserModal'
}

const usersJourneys: UserJourney[] = [
  {
    __typename: 'UserJourney',
    userId: '1',
    journeyId: '1234',
    role: UserJourneyRole.inviteRequested,
    user: {
      __typename: 'User',
      id: '1',
      email: 'drew.drew@drew.com',
      firstName: 'drewster',
      lastName: 'drew',
      imageUrl: ''
    }
  },
  {
    __typename: 'UserJourney',
    userId: '2',
    journeyId: '1234',
    role: UserJourneyRole.inviteRequested,
    user: {
      __typename: 'User',
      id: '2',
      email: 'drew2.drew@drew.com',
      firstName: 'drewster2',
      lastName: 'drew',
      imageUrl: ''
    }
  },
  {
    __typename: 'UserJourney',
    userId: '3',
    journeyId: '1234',
    role: UserJourneyRole.editor,
    user: {
      __typename: 'User',
      id: '3',
      email: 'josh.fake@fake.com',
      firstName: 'Joshua',
      lastName: 'Fake',
      imageUrl: ''
    }
  },
  {
    __typename: 'UserJourney',
    userId: '4',
    journeyId: '1234',
    role: UserJourneyRole.editor,
    user: {
      __typename: 'User',
      id: '4',
      email: 'josh2.fake@fake.com',
      firstName: 'Joshua2',
      lastName: 'Fake',
      imageUrl: ''
    }
  },
  {
    __typename: 'UserJourney',
    userId: '5',
    journeyId: '1234',
    role: UserJourneyRole.owner,
    user: {
      __typename: 'User',
      id: '5',
      email: 'john.geronimo@tandem.org.nz',
      firstName: 'John',
      lastName: 'Geronimo',
      imageUrl:
        'https://lh3.googleusercontent.com/a/AATXAJxOLQjNEXpqvNUiM31hrlLbvneWbUAvB3OG-StX=s96-c'
    }
  }
]

const journey: Journey = {
  __typename: 'Journey',
  createdAt: '2020-01-01T00:00:00.000Z',
  id: '1234',
  description: '',
  primaryImageBlock: null,
  slug: 'fact-or-fiction',
  status: JourneyStatus.published,
  publishedAt: '2020-01-01T00:00:00.000Z',
  title: 'Fact or fiction',
  usersJourneys: usersJourneys
}

const Template: Story = () => (
  <MockedProvider>
    <InviteUserModal journey={journey} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
