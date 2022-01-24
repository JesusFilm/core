import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { JourneyProvider } from '../../../libs/context'
import { Properties } from './Properties'

const PropertiesStory = {
  ...journeysAdminConfig,
  component: Properties,
  title: 'Journeys-Admin/JourneyView/Properties',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <JourneyProvider value={defaultJourney}>
      <Properties {...args} />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default PropertiesStory as Meta
