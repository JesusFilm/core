import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../libs/storybook'
import { publishedJourney } from '../../JourneyView/data'

import { journeyVideoBlocks } from './data'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'

const TemplatePreviewTabsStory: Meta<typeof TemplatePreviewTabs> = {
  ...simpleComponentConfig,
  component: TemplatePreviewTabs,
  title: 'Journeys-Admin/TemplateView/TemplatePreviewTabs'
}

const journey = {
  ...publishedJourney,
  blocks: journeyVideoBlocks
}

const Template: StoryObj<
  ComponentProps<typeof TemplatePreviewTabs> & { journey: Journey }
> = {
  render: (args) => {
    return (
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <TemplatePreviewTabs />
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    journey
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}
export default TemplatePreviewTabsStory
