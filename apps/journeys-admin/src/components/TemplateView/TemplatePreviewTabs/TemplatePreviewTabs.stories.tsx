import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../__generated__/JourneyFields'
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

const Template: StoryObj<typeof TemplatePreviewTabs> = {
  render: () => {
    return (
      <JourneyProvider
        value={{ journey: journey as JourneyFields, variant: 'admin' }}
      >
        <TemplatePreviewTabs />
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template
}

export default TemplatePreviewTabsStory
