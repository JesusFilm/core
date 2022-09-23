import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { DatePreview } from './DatePreview'

const DatePreviewStory = {
  ...simpleComponentConfig,
  component: DatePreview,
  title: 'Journeys-Admin/JourneyView/DatePreview'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={{ journey: args.journey }}>
      <DatePreview />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export default DatePreviewStory as Meta
