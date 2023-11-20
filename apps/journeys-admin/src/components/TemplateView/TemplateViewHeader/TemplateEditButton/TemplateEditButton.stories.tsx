import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'

import { TemplateEditButton } from './TemplateEditButton'

const TemplateEditButtonStory: Meta<typeof TemplateEditButton> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/TemplateView/TemplateHeader/TemplateEditButton',
  component: TemplateEditButton
}

const Tempalte: StoryObj<typeof TemplateEditButton> = {
  render: () => <TemplateEditButton journeyId="journeyId" />
}

export const Default = {
  ...Tempalte
}

export default TemplateEditButtonStory
