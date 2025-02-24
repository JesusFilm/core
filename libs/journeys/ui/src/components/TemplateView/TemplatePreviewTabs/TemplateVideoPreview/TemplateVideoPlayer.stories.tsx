import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { VideoBlock } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
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
