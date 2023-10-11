import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { TemplatePreviewTabs } from './TemplatePreviewTabs'

const TemplatePreviewTabsStory: Meta<typeof TemplatePreviewTabs> = {
  ...simpleComponentConfig,
  component: TemplatePreviewTabs,
  title: 'Journeys-Admin/TemplatePreviewTabs'
}

const Template: StoryObj<typeof TemplatePreviewTabs> = {
  render: () => {
    return <TemplatePreviewTabs />
  }
}

export const Default = {
  ...Template
}

export default TemplatePreviewTabsStory
