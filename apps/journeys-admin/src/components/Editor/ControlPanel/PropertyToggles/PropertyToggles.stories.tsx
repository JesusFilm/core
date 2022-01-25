import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { PropertyToggles } from '.'

const PropertyTogglesStory = {
  ...simpleComponentConfig,
  component: PropertyToggles,
  title: 'Journeys-Admin/Editor/ControlPanel/PropertyToggles'
}

export const Default: Story = () => {
  return <PropertyToggles />
}

export default PropertyTogglesStory as Meta
