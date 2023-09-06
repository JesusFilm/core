import { Meta, StoryObj } from '@storybook/react'

import { cache } from '../../libs/apolloClient/cache'
import { journeysAdminConfig } from '../../libs/storybook'

import { getDiscoveryJourneysMock } from './data'
import { DiscoveryJourneys } from './DiscoveryJourneys'

const DiscoveryJourneysStory: Meta<typeof DiscoveryJourneys> = {
  ...journeysAdminConfig,
  component: DiscoveryJourneys,
  title: 'Journeys-Admin/JourneyList/DiscoveryJourneys'
}

const Template: StoryObj<typeof DiscoveryJourneys> = {
  render: () => <DiscoveryJourneys />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      cache: cache(),
      mocks: [getDiscoveryJourneysMock]
    }
  }
}

export default DiscoveryJourneysStory
