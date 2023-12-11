import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../libs/storybook'
import { descriptiveTemplate } from '../data'

import { TemplateListItem } from '.'

const TemplateListItemStory: Meta<typeof TemplateListItem> = {
  ...journeysAdminConfig,
  component: TemplateListItem,
  title: 'Journeys-Admin/TemplateList/TemplateListItem'
}

const Template: StoryObj<ComponentProps<typeof TemplateListItem>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TemplateListItem {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: descriptiveTemplate
  }
}

export const Loading = {
  ...Template
}

export default TemplateListItemStory
