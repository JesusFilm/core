import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { GetJourney_adminJourney as Journey } from '../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { InviteUserModal } from './InviteUserModal'

const Demo = {
  ...journeysAdminConfig,
  component: InviteUserModal,
  title: 'Journeys-Admin/InviteUserModal'
}

const journey: Journey = {
  __typename: 'Journey',
  createdAt: '2020-01-01T00:00:00.000Z',
  id: '1234',
  description: '',
  locale: 'en-US',
  slug: 'fact-or-fiction',
  status: JourneyStatus.published,
  publishedAt: '2020-01-01T00:00:00.000Z',
  title: 'Fact or fiction',
  blocks: null,
  primaryImageBlock: null,
  userJourneys: []
}

const Template: Story = () => (
  <MockedProvider>
    <InviteUserModal journey={journey} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
