import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { Properties } from './Properties'

const PropertiesStory = {
  ...journeysAdminConfig,
  component: Properties,
  title: 'Journeys-Admin/TemplateView/Properties',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <JourneyProvider value={{ journey: args.journey }}>
      <Properties userRole={args.userRole} />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const Publisher = Template.bind({})
Publisher.args = {
  journey: defaultJourney,
  userRole: true
}

export default PropertiesStory as Meta
