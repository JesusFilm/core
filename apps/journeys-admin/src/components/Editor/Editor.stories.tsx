import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../libs/storybook'
import { Editor } from '.'

const EditorStory = {
  ...journeyAdminConfig,
  component: Editor,
  title: 'JourneyAdmin/Editor'
}

const Template: Story = () => <Editor />

export const Default = Template.bind({})

export default EditorStory as Meta
