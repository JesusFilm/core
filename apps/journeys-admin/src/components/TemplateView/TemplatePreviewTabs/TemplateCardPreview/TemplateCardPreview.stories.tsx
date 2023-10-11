import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { steps } from '../../../CardPreview/CardPreview.stories'

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

const Template: StoryObj<typeof TemplateCardPreview> = {
  render: () => <TemplateCardPreview steps={steps} />
}

export const Default = {
  ...Template
}

export default TemplateCardPreviewStory
