import { Meta, StoryObj } from '@storybook/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { journeyVideoBlocks } from '../data'

import { TemplateCardPreview } from './TemplateCardPreview'

const TemplateCardPreviewStory: Meta<typeof TemplateCardPreview> = {
  ...journeysAdminConfig,
  component: TemplateCardPreview,
  title: 'Journeys-Admin/TemplateCardPreview',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const steps = transformer(journeyVideoBlocks) as Array<TreeBlock<StepBlock>>

const Template: StoryObj<typeof TemplateCardPreview> = {
  render: () => <TemplateCardPreview steps={steps} />
}

export const Default = {
  ...Template
}

export default TemplateCardPreviewStory
