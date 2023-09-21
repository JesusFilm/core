import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'

import { journeys } from './data'

import { TemplateSections } from '.'

const TemplateSectionsStory: Meta<typeof TemplateSections> = {
  ...journeysAdminConfig,
  component: TemplateSections,
  title: 'Journeys-Admin/TemplateSections'
}

const Template: StoryObj<typeof TemplateSections> = {
  render: ({ ...args }) => <TemplateSections {...args} />
}

export const Default = {
  ...Template,
  args: {
    category: 'Easter',
    journeys
  }
}

export default TemplateSectionsStory
