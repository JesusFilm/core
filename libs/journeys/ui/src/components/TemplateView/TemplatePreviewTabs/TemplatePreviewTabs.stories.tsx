import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fireEvent, within } from 'storybook/test'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { publishedJourney } from '../data'

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

export const Videos = {
  ...Template,
  args: {
    journey
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await fireEvent.click(canvas.getByText('{{count}} Videos'))
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}
export default TemplatePreviewTabsStory
