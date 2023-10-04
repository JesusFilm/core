import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { journeysAdminConfig } from '../../../libs/storybook'
import { publishedJourney } from '../../JourneyView/data'

import { journeyVideoBlocks } from './data'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'

const TemplatePreviewTabsStory: Meta<typeof TemplatePreviewTabs> = {
  ...journeysAdminConfig,
  component: TemplatePreviewTabs,
  title: 'Journeys-Admin/TemplateView/TemplatePreviewTabs',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen',
    docs: {
      source: { type: 'code' }
    }
  }
}

const journeyWithVideos = {
  ...publishedJourney,
  blocks: journeyVideoBlocks
}

const Template: StoryObj<
  ComponentProps<typeof TemplatePreviewTabs> & { journey: JourneyFields }
> = {
  render: (args) => (
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <TemplatePreviewTabs />
    </JourneyProvider>
  )
}

export const CardPreview = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export const VideoPreview = {
  ...Template,
  play: async () => {
    await userEvent.click(
      screen.getByRole('tab', { name: '{{videBlockCount}} Videos' })
    )
  },
  args: {
    journey: journeyWithVideos
  }
}

export default TemplatePreviewTabsStory
