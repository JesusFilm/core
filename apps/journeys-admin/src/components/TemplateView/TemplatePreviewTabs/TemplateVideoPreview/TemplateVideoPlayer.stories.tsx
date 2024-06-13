import { Meta, StoryObj } from '@storybook/react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../libs/storybook'
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
