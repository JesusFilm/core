import { Meta, StoryObj } from '@storybook/nextjs'

import Grid1Icon from '@core/shared/ui/icons/Grid1'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { TagItem } from './TagItem'

const TagItemStory: Meta<typeof TagItem> = {
  ...simpleComponentConfig,
  component: TagItem,
  title: 'Journeys-Admin/TemplateView/TemplateTags/TagItem'
}

const Template: StoryObj<typeof TagItem> = {
  render: ({ ...args }) => <TagItem {...args} />
}

export const Default = {
  ...Template,
  args: {
    name: 'tag name',
    icon: <Grid1Icon />
  }
}

export const Loading = {
  ...Template,
  args: { loading: true }
}

export default TagItemStory
