import { Meta, Story } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { DiscoveryJourneys } from './DiscoveryJourneys'

const DiscoveryJourneysStory = {
  ...journeysAdminConfig,
  component: DiscoveryJourneys,
  title: 'Journeys-Admin/JourneyList/DiscoveryJourneys'
}

const Template: Story = () => <DiscoveryJourneys />

export const Default = Template.bind({})

export default DiscoveryJourneysStory as Meta
