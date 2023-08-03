import { Story, Meta } from '@storybook/react'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'
import { DatePreview } from './DatePreview'

const DatePreviewStory = {
  ...simpleComponentConfig,
  component: DatePreview,
  title: 'Journeys-Admin/JourneyView/DatePreview'
}

const Template: Story = ({ ...args }) => (
  <JourneyProvider
    value={{ journey: args.journey, renderLocation: RenderLocation.Admin }}
  >
    <DatePreview />
  </JourneyProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export default DatePreviewStory as Meta
