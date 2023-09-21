import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { journeys } from './data'

import { TemplateSection } from '.'

const TemplateSectionStory: Meta<typeof TemplateSection> = {
  ...journeysAdminConfig,
  component: TemplateSection,
  title: 'Journeys-Admin/TemplateSection'
}

const Template: StoryObj<typeof TemplateSection> = {
  render: ({ ...args }) => <TemplateSection {...args} />
}

export const Default = {
  ...Template,
  args: {
    category: 'Easter',
    journeys
  }
}

export default TemplateSectionStory
