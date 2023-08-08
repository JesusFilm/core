import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'

import { DatePreview } from './DatePreview'

const DatePreviewStory = {
  ...simpleComponentConfig,
  component: DatePreview,
  title: 'Journeys-Admin/JourneyView/DatePreview'
}

const Template: Story = ({ ...args }) => (
  <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
    <DatePreview />
  </JourneyProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export default DatePreviewStory as Meta
