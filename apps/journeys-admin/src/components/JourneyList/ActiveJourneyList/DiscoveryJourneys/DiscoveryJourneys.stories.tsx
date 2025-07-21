import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

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
  ...Template
}

export default DiscoveryJourneysStory
