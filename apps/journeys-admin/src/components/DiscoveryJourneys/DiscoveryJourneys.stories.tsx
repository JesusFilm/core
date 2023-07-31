import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { DiscoveryJourneys } from './DiscoveryJourneys'
import { mocks } from './data'

const DiscoveryJourneysStory = {
  ...journeysAdminConfig,
  component: DiscoveryJourneys,
  title: 'Journeys-Admin/JourneyList/DiscoveryJourneys'
}

const Template: Story = () => (
  <MockedProvider mocks={mocks}>
    <DiscoveryJourneys />
  </MockedProvider>
)

export const Default = Template.bind({})

export default DiscoveryJourneysStory as Meta
