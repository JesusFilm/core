import { Meta, StoryObj } from '@storybook/react'
import { fireEvent, within } from '@storybook/testing-library'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

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
        <TemplatePreviewTabs openTeamDialog={false} setOpenTeamDialog={noop} />
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
    fireEvent.click(canvas.getByText('{{count}} Videos'))
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}
export default TemplatePreviewTabsStory
