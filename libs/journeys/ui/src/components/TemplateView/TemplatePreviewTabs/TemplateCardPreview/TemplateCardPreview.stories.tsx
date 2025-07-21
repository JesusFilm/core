import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TreeBlock } from '../../../../libs/block'
import { transformer } from '../../../../libs/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { journeyVideoBlocks } from '../data'

import { TemplateCardPreview } from './TemplateCardPreview'

const TemplateCardPreviewStory: Meta<typeof TemplateCardPreview> = {
  ...journeysAdminConfig,
  component: TemplateCardPreview,
  title: 'Journeys-Admin/TemplateView/TemplatePreviewTab/TemplateCardPreview',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const steps = transformer(journeyVideoBlocks) as Array<TreeBlock<StepBlock>>

const Template: StoryObj<typeof TemplateCardPreview> = {
  render: (args) => <TemplateCardPreview steps={args.steps} />
}

export const Default = {
  ...Template,
  args: {
    steps
  }
}

export const Loading = {
  ...Template,
  args: { steps: undefined }
}

export default TemplateCardPreviewStory
