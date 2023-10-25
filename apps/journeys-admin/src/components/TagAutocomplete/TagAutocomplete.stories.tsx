import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { TagAutocomplete } from './TagAutocomplete'

const TagAutocompleteStory: Meta<typeof TagAutocomplete> = {
  ...simpleComponentConfig,
  component: TagAutocomplete,
  title: 'Journeys-Admin/TagAutocomplete'
}

const Template: StoryObj<typeof TagAutocomplete> = {
  render: ({ ...args }) => <TagAutocomplete {...args} />
}

export const Default = {
  ...Template,
  args: {
    tags: [
      { id: 'tag1', name: { value: 'Ramadan' } },
      { id: 'tag2', name: { value: 'Christmas' } },
      { id: 'tag3', name: { value: 'Easter' } }
    ],
    onChange: jest.fn()
  }
}

export const Filled = {
  ...Template,
  args: {
    ...Default.args,
    initialTags: ['tag2', 'tag3'],
    label: 'Holidays',
    placeholder: 'Add holidays'
  }
}

export default TagAutocompleteStory
