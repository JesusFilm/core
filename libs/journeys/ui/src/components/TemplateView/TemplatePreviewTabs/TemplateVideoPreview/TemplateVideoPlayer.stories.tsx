import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TreeBlock } from '../../../../libs/block'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { videoBlocksFiltered } from '../data'

import { TemplateVideoPreview } from './TemplateVideoPreview'

const TemplateVideoPreviewStory: Meta<typeof TemplateVideoPreview> = {
  ...journeysAdminConfig,
  component: TemplateVideoPreview,
  title: 'Journeys-Admin/TemplateView/TemplatePreviewTab/TemplateVideoPreview',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof TemplateVideoPreview> = {
  render: () => (
    <TemplateVideoPreview
      videoBlocks={
        videoBlocksFiltered as unknown as Array<TreeBlock<VideoBlock>>
      }
    />
  )
}

export const Default = {
  ...Template
}

export default TemplateVideoPreviewStory
