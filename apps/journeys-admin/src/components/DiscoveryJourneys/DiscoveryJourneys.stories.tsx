import { Meta, Story } from '@storybook/react'

import { cache } from '../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../libs/storybook'

import { getDiscoveryJourneysMock } from './data'
import { DiscoveryJourneys } from './DiscoveryJourneys'

const DiscoveryJourneysStory = {
  ...journeysAdminConfig,
  component: DiscoveryJourneys,
  title: 'Journeys-Admin/JourneyList/DiscoveryJourneys'
}

const Template: Story = () => <DiscoveryJourneys />

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    cache: cache(),
    mocks: [getDiscoveryJourneysMock]
  }
}

export default DiscoveryJourneysStory as Meta
