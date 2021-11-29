import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { Editor } from '.'

const EditorStory = {
  ...journeysAdminConfig,
  component: Editor,
  title: 'Journeys-Admin/Editor'
}

const Template: Story = () => <Editor />

export const Default = Template.bind({})

export default EditorStory as Meta
