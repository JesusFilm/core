import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'

import { DatePreview } from './DatePreview'

const DatePreviewStory: Meta<typeof DatePreview> = {
  ...simpleComponentConfig,
  component: DatePreview,
  title: 'Journeys-Admin/JourneyView/DatePreview'
}

const Template: StoryObj<typeof DatePreview> = {
  render: ({ ...args }) => (
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <DatePreview />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export default DatePreviewStory
